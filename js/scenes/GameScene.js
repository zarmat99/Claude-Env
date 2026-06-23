import { TileMap } from '../world/TileMap.js';
import { LightingSystem } from '../world/LightingSystem.js';
import { TILE } from '../world/Biomes.js';
import { WORLD_LOCATIONS, ROOTSTONE_POSITIONS } from '../world/WorldGen.js';
import { NPCS } from '../data/npcs.js';
import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { Enemy } from '../entities/Enemy.js';
import { HUD } from '../ui/HUD.js';
import { MobileControls } from '../ui/MobileControls.js';
import { subscribeToEvents } from '../systems/QuestSystem.js';
import { save as saveGame } from '../systems/SaveSystem.js';
import { addItem } from '../systems/InventorySystem.js';
import EventBus from '../systems/EventBus.js';

const TILE_SIZE = 16;

export default class GameScene extends Phaser.Scene {
    constructor() { super({ key: 'Game' }); }

    create() {
        const worldData = this.registry.get('worldData');
        const player    = this.registry.get('player');

        if (!worldData || !player) {
            console.error('[GameScene] Missing worldData or player — returning to MainMenu');
            this.scene.start('MainMenu');
            return;
        }

        // World bounds
        const worldPixelW = 200 * TILE_SIZE;
        const worldPixelH = 200 * TILE_SIZE;
        this.physics.world.setBounds(0, 0, worldPixelW, worldPixelH);

        // Create tile map
        this.tileMap = new TileMap(this, worldData.tiles, worldData.biomeMap);

        // Create player entity
        const px = player.worldX * TILE_SIZE + TILE_SIZE / 2;
        const py = player.worldY * TILE_SIZE + TILE_SIZE / 2;
        this.playerEntity = new Player(this, px, py, player);

        // Camera follows player
        this.cameras.main.setBounds(0, 0, worldPixelW, worldPixelH);
        this.cameras.main.startFollow(this.playerEntity.sprite, true, 0.1, 0.1);

        // Lighting
        this.lighting = new LightingSystem(this);

        // Spawn NPCs near starting area
        this.npcs = [];
        this.spawnNPCs(worldData);

        // Spawn enemies
        this.enemies = [];
        this.spawnEnemies(worldData);

        // World items group
        this.worldItems = this.add.group();
        this.spawnWorldItems(worldData);

        // HUD
        this.hud = new HUD(this, player);

        // On-screen touch controls (only render on touch devices)
        this.mobileControls = new MobileControls(this, player);

        // Movement override set by window.GameAPI for automated play (null = off)
        this.apiMoveState = null;

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd    = this.input.keyboard.addKeys({
            up: 'W', down: 'S', left: 'A', right: 'D', run: 'SHIFT'
        });
        this.input.keyboard.on('keydown-I',   () => this.openInventory());
        this.input.keyboard.on('keydown-M',   () => this.openMap());
        this.input.keyboard.on('keydown-J',   () => this.openJournal());
        this.input.keyboard.on('keydown-E',   () => this.interact());
        this.input.keyboard.on('keydown-ESC', () => this.handleEsc());

        // Auto-save every 5 minutes
        this.time.addEvent({
            delay: 300000,
            callback: () => {
                const p = this.registry.get('player');
                const w = this.registry.get('worldData');
                if (p && w) saveGame(p, w);
            },
            loop: true
        });

        // EventBus listeners
        EventBus.on('open_inventory',    this.openInventory,    this);
        EventBus.on('open_map',          this.openMap,          this);
        EventBus.on('combat_end',        this.onCombatEnd,      this);
        EventBus.on('dialogue_end',      this.onDialogueEnd,    this);
        EventBus.on('show_notification', this.showNotification, this);
        EventBus.on('item_collected',    this.onItemCollected,  this);

        // Quest system event wiring
        subscribeToEvents(() => this.registry.get('player'), this);

        // Mark starting tiles as explored
        this.markExplored(player.worldX, player.worldY);

        // Welcome notification
        const locationName = this.getNearestLocationName(player.worldX, player.worldY);
        EventBus.emit('show_notification', `Welcome to ${locationName}.`, '#88ccff');
    }

    update(time, delta) {
        const player = this.registry.get('player');
        if (!player) return;

        // Update player movement (merge touch joystick + GameAPI override when present)
        const touch = this.mobileControls ? this.mobileControls.getMoveState() : null;
        const auto  = this.apiMoveState;
        const merged = (touch || auto) ? {
            left:  !!(touch && touch.left)  || !!(auto && auto.left),
            right: !!(touch && touch.right) || !!(auto && auto.right),
            up:    !!(touch && touch.up)    || !!(auto && auto.up),
            down:  !!(touch && touch.down)  || !!(auto && auto.down),
            run:   !!(touch && touch.run)   || !!(auto && auto.run)
        } : null;
        this.playerEntity.update(this.cursors, this.wasd, this.tileMap, player, delta, merged);

        // Redraw tilemap based on camera position
        const cam = this.cameras.main;
        this.tileMap.redrawVisible(cam.scrollX, cam.scrollY);

        // Advance world time (1 real second = 1 game minute)
        player.worldTime += delta / 1000;

        // Update lighting
        const hour = (player.worldTime / 60) % 24;
        this.lighting.update(hour, this.playerEntity.sprite.x, this.playerEntity.sprite.y);

        // Update HUD
        this.hud.update(player);

        // Update NPCs
        for (const npc of this.npcs) npc.update(player.worldTime, delta);

        // Update enemies
        for (const enemy of this.enemies) {
            enemy.update(this.playerEntity.sprite, player, this.tileMap, delta);
        }

        // Check proximity interactions
        this.checkInteractions();

        // Auto-pickup items
        this.checkItemPickups(player);

        // Update player tile position
        const tx = Math.floor(this.playerEntity.sprite.x / TILE_SIZE);
        const ty = Math.floor(this.playerEntity.sprite.y / TILE_SIZE);
        if (tx !== player.worldX || ty !== player.worldY) {
            player.worldX = tx;
            player.worldY = ty;
            this.markExplored(tx, ty);
            EventBus.emit('location_reached', `${tx},${ty}`);
        }
    }

    spawnNPCs(worldData) {
        // The world is now coherent and hand-placed, so every NPC lives at its
        // story location. Spawn all of them except those gated behind an unlock
        // flag that has not yet been set (e.g. hidden Vorrkai settlement).
        const player = this.registry.get('player');
        const flags  = (player && player.flags) || new Set();
        for (const npcData of Object.values(NPCS)) {
            if (!npcData.spawnTile) continue;
            if (npcData.unlockFlag && !flags.has(npcData.unlockFlag)) continue;
            const px = npcData.spawnTile.x * TILE_SIZE + TILE_SIZE / 2;
            const py = npcData.spawnTile.y * TILE_SIZE + TILE_SIZE / 2;
            const npc = new NPC(this, px, py, npcData);
            this.npcs.push(npc);
        }
    }

    spawnEnemies(worldData) {
        // Hand-placed by region so danger matches the story geography, never
        // random. Player starts at Greyhollow (82,98); spawns are kept clear of it.
        const spawns = [
            // Greyhollow grassland fringe — weak early threats
            { x:  95, y: 112, id: 'goblin'          },
            { x:  68, y:  90, id: 'goblin'          },
            { x: 110, y: 106, id: 'bandit'          },
            // Aetherwood dark forest (east) — dangerous
            { x: 160, y: 100, id: 'cave_spider'     },
            { x: 173, y:  94, id: 'wraith'          },
            { x: 176, y: 112, id: 'void_hound'      },
            // Northern tundra
            { x: 112, y:  18, id: 'skeleton'        },
            { x:  58, y:  22, id: 'skeleton'        },
            // Southern swamps
            { x:  60, y: 150, id: 'swamp_crawler'   },
            { x:  92, y: 144, id: 'swamp_crawler'   },
            // Emberpeak caldera (south-east) — high level
            { x: 154, y: 164, id: 'lava_salamander' },
            // Iron Compact badlands (west)
            { x:  42, y:  76, id: 'bandit'          }
        ];
        for (const s of spawns) {
            const e = new Enemy(this, s.x * TILE_SIZE, s.y * TILE_SIZE, s.id);
            this.enemies.push(e);
        }
    }

    spawnWorldItems(worldData) {
        const pickups = [
            { x: 84, y: 100, itemId: 'health_potion_minor' },  // Greyhollow square
            { x: 86, y: 102, itemId: 'iron_ore'            },  // near smithy
            { x: 80, y:  99, itemId: 'bread'               }   // by the inn
        ];
        for (const p of pickups) {
            const sprite = this.add.rectangle(
                p.x * TILE_SIZE + 8, p.y * TILE_SIZE + 8,
                10, 10, 0xffdd44
            );
            sprite.setData('itemId',   p.itemId);
            sprite.setData('quantity', 1);
            this.worldItems.add(sprite);
        }
    }

    checkInteractions() {
        const px = this.playerEntity.sprite.x;
        const py = this.playerEntity.sprite.y;
        const range = TILE_SIZE * 1.8;

        for (const npc of this.npcs) {
            const dist = Phaser.Math.Distance.Between(px, py, npc.sprite.x, npc.sprite.y);
            if (dist < range) {
                this.hud.showInteractHint(`[E] Talk to ${npc.data.name}`);
                return;
            }
        }

        // Check for chests
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        if (this.tileMap) {
            const neighbors = [
                [tx, ty], [tx + 1, ty], [tx - 1, ty], [tx, ty + 1], [tx, ty - 1]
            ];
            for (const [nx, ny] of neighbors) {
                const tid = this.tileMap.getTileAt ? this.tileMap.getTileAt(nx, ny) : -1;
                if (tid === TILE.CHEST) {
                    this.hud.showInteractHint('[E] Open Chest');
                    return;
                }
            }
        }

        this.hud.hideInteractHint();
    }

    checkItemPickups(player) {
        const px = this.playerEntity.sprite.x;
        const py = this.playerEntity.sprite.y;

        this.worldItems.getChildren().slice().forEach(item => {
            const dist = Phaser.Math.Distance.Between(px, py, item.x, item.y);
            if (dist < TILE_SIZE * 0.9) {
                const itemId = item.getData('itemId');
                const qty    = item.getData('quantity') || 1;
                addItem(player, itemId, qty);
                item.destroy();
            }
        });
    }

    interact() {
        const px = this.playerEntity.sprite.x;
        const py = this.playerEntity.sprite.y;
        const range = TILE_SIZE * 1.8;

        for (const npc of this.npcs) {
            const dist = Phaser.Math.Distance.Between(px, py, npc.sprite.x, npc.sprite.y);
            if (dist < range) {
                this.scene.launch('Dialogue', { npcId: npc.data.id, dialogueTree: npc.data.dialogueRoot });
                this.scene.pause('Game');
                return;
            }
        }

        // Check tile under player for interactable features
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        if (this.tileMap && this.tileMap.getTileAt) {
            const tileId = this.tileMap.getTileAt(tx, ty);
            if (tileId === TILE.CHEST) {
                this.openChest(tx, ty);
            } else if (tileId === TILE.CAVE_ENTRANCE) {
                EventBus.emit('show_notification', 'A passage leads into darkness...', '#8899aa');
            }
        }
    }

    openInventory() {
        if (!this.scene.isActive('Inventory')) {
            this.scene.launch('Inventory');
        }
    }

    openMap() {
        if (!this.scene.isActive('WorldMap')) {
            this.scene.launch('WorldMap');
        }
    }

    openJournal() {
        EventBus.emit('open_journal');
        if (!this.scene.isActive('Inventory')) {
            this.scene.launch('Inventory', { tab: 'quests' });
        }
    }

    handleEsc() {
        if (this.scene.isActive('Inventory')) { this.scene.stop('Inventory'); return; }
        if (this.scene.isActive('WorldMap'))  { this.scene.stop('WorldMap');  return; }
        if (this.scene.isActive('Crafting'))  { this.scene.stop('Crafting');  return; }
    }

    onCombatEnd(result, loot) {
        if (this.scene.isPaused('Game')) this.scene.resume('Game');

        if (result === 'victory' && loot && loot.length > 0) {
            const player = this.registry.get('player');
            if (player) {
                for (const entry of loot) {
                    if (entry.itemId === 'gold_coin' || entry.itemId === 'gold') {
                        player.gold += entry.quantity;
                        EventBus.emit('show_notification', `+${entry.quantity} gold`, '#ffd700');
                    } else {
                        addItem(player, entry.itemId, entry.quantity);
                    }
                }
            }
        }

        if (result === 'defeat') {
            // Death is handled inside CombatScene; it will stop GameScene and go back to MainMenu
        }
    }

    onDialogueEnd(npcId) {
        if (this.scene.isPaused('Game')) this.scene.resume('Game');
    }

    onItemCollected(itemId, qty) {
        EventBus.emit('show_notification', `Picked up: ${itemId.replace(/_/g, ' ')} x${qty}`, '#aabb88');
    }

    showNotification(text, color = '#ffffff') {
        if (this.hud) this.hud.showNotification(text, color);
    }

    markExplored(tx, ty) {
        const player = this.registry.get('player');
        if (!player) return;
        const radius = 5;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = tx + dx, ny = ty + dy;
                if (nx >= 0 && nx < 200 && ny >= 0 && ny < 200) {
                    if (dx * dx + dy * dy <= radius * radius) {
                        player.exploredTiles[ny * 200 + nx] = 1;
                    }
                }
            }
        }
    }

    getNearestLocationName(tx, ty) {
        let nearest = 'Varethos';
        let minDist = Infinity;
        for (const [, loc] of Object.entries(WORLD_LOCATIONS)) {
            const d = Math.abs(loc.x - tx) + Math.abs(loc.y - ty);
            if (d < minDist) { minDist = d; nearest = loc.name; }
        }
        return nearest;
    }

    openChest(tx, ty) {
        EventBus.emit('show_notification', 'You found some items!', '#ffdd44');
        const player = this.registry.get('player');
        if (player) {
            addItem(player, 'health_potion_minor', 1);
        }
    }

    shutdown() {
        EventBus.off('open_inventory',    this.openInventory,    this);
        EventBus.off('open_map',          this.openMap,          this);
        EventBus.off('combat_end',        this.onCombatEnd,      this);
        EventBus.off('dialogue_end',      this.onDialogueEnd,    this);
        EventBus.off('show_notification', this.showNotification, this);
        EventBus.off('item_collected',    this.onItemCollected,  this);
    }
}
