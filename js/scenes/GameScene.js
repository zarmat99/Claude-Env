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
import { subscribeToEvents } from '../systems/CampaignQuestSystem.js';
import { save as saveGame } from '../systems/SaveSystem.js';
import { addItem } from '../systems/InventorySystem.js';
import { StoryWorldSystem } from '../systems/StoryWorldSystem.js';
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
        if (player.flags.has('cael_dead')) this.setNpcVisible('cael', false);
        if (player.flags.has('elder_sathis_dead')) this.setNpcVisible('elder_sathis', false);

        // Spawn enemies
        this.enemies = [];
        this.spawnEnemies(worldData);

        // Physical story sites, bosses, rituals, herbs and side-quest encounters.
        this.storyWorld = new StoryWorldSystem(this);

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
        EventBus.on('trigger_ending',    this.onTriggerEnding,  this);
        EventBus.on('flag_set',          this.onFlagSet,        this);
        EventBus.on('world_state_changed', this.onWorldStateChanged, this);
        EventBus.on('quest_stage_complete', this.onQuestStageComplete, this);

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
        // story location. Spawn all of them; those with spawnCondition start hidden
        // and are revealed when the required flag is set.
        const player = this.registry.get('player');
        const flags  = (player && player.flags) || new Set();
        for (const npcData of Object.values(NPCS)) {
            if (!npcData.spawnTile) continue;
            const px = npcData.spawnTile.x * TILE_SIZE + TILE_SIZE / 2;
            const py = npcData.spawnTile.y * TILE_SIZE + TILE_SIZE / 2;
            const npc = new NPC(this, px, py, npcData);
            // NPCs with spawnCondition start hidden until the flag is set
            if (npcData.spawnCondition?.flag && !flags.has(npcData.spawnCondition.flag)) {
                npc.sprite.setVisible(false);
                npc._spawnFlag = npcData.spawnCondition.flag;
            }
            this.npcs.push(npc);
        }
    }

    revealFlagNPCs(flag) {
        for (const npc of this.npcs) {
            if (npc._spawnFlag === flag) {
                npc.sprite.setVisible(true);
                npc._spawnFlag = null;
            }
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
            if (npc.sprite.visible === false) continue;
            const dist = Phaser.Math.Distance.Between(px, py, npc.sprite.x, npc.sprite.y);
            if (dist < range) {
                this.hud.showInteractHint(`[E] Talk to ${npc.data.name}`);
                return;
            }
        }

        const storyHint = this.storyWorld?.getHint();
        if (storyHint) {
            this.hud.showInteractHint(storyHint);
            return;
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
            if (npc.sprite.visible === false) continue;
            const dist = Phaser.Math.Distance.Between(px, py, npc.sprite.x, npc.sprite.y);
            if (dist < range) {
                if (this.storyWorld?.tryNpcChoice(npc.data.id)) return;
                this.scene.launch('Dialogue', {
                    npcId: npc.data.id,
                    dialogueTree: this.resolveDialogueTree(npc.data)
                });
                this.scene.pause('Game');
                return;
            }
        }

        if (this.storyWorld?.interactNearest()) return;

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
        if (this.scene.isPaused('Game') && !this.scene.isActive('Story') && !this.scene.isActive('Ending')) {
            this.scene.resume('Game');
        }

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
        if (this.scene.isPaused('Game') && !this.scene.isActive('Story') && !this.scene.isActive('Ending')) {
            this.scene.resume('Game');
        }
    }

    onItemCollected(itemId, qty) {
        EventBus.emit('show_notification', `Picked up: ${itemId.replace(/_/g, ' ')} x${qty}`, '#aabb88');
    }

    onTriggerEnding(endingId) {
        if (!this.scene.isActive('Ending')) {
            this.scene.launch('Ending', { endingId });
            this.scene.pause('Game');
        }
    }

    onFlagSet(flag) {
        if (flag === 'cael_dead') this.setNpcVisible('cael', false);
        if (flag === 'elder_sathis_dead') this.setNpcVisible('elder_sathis', false);
        // Reveal flag-gated NPCs when their unlock condition is met
        this.revealFlagNPCs(flag);
    }

    setNpcVisible(npcId, visible) {
        const npc = this.npcs.find(entry => entry.data.id === npcId);
        if (!npc) return;
        npc.sprite.setVisible(visible);
        npc.nameLabel.setVisible(visible);
        if (npc.titleLabel) npc.titleLabel.setVisible(visible);
    }

    onWorldStateChanged(change) {
        if (change !== 'thornpillar_destroyed') return;
        const worldData = this.registry.get('worldData');
        if (worldData?.tiles) {
            worldData.tiles[82 * 200 + 82] = TILE.CAVE_ENTRANCE;
            this.tileMap.setTiles(worldData.tiles);
        }
    }

    onQuestStageComplete(questId, stageId, nextStageId) {
        // Act 1 → 2: Night after the samples are collected
        if (questId === 'main_act1' && stageId === 'act1_complete') {
            this.scene.launch('Story', {
                mode: 'narrative',
                title: 'Night, Greyhollow',
                body: 'Elder Sathis does not sleep. You find him on the Sanctuary roof that night, watching the Thornpillar\'s light. It pulses now — irregular, like a slowing heartbeat.\n\n"Three stations," he says. "Three samples. Enough to know the frequency of what is taking it." He does not thank you. He does not need to. The weight he carries is acknowledgement enough.'
            });
            this.scene.pause('Game');
        }
        // Act 2 → Cael's death
        if (questId === 'main_act2' && nextStageId === 'cael_assassination') {
            this.setNpcVisible('cael', false);
            this.scene.launch('Story', {
                mode: 'narrative',
                title: 'A Light Extinguished',
                body: 'A Greyhollow bell sounds before dawn. Warden Cael has been murdered at Station Verath. The wound is precise; the arcane residue is not. Whatever he discovered frightened someone enough to silence him.\n\nYou knew him for less than a season. He trusted you faster than anyone should. You think about that as they wrap his body in Rootwarden grey — how quickly trust travels when there is not much time left for it.'
            });
            this.scene.pause('Game');
        }
        // Act 3 escape
        if (questId === 'main_act3' && nextStageId === 'escape_underlurk') {
            EventBus.emit('show_notification', 'Cult bells sound through the Chasm. Reach the northern exit!', '#ff7777');
        }
        // Act 4 → Thornpillar falls (expanded scene)
        if (questId === 'main_act4' && nextStageId === 'thornpillar_falls') {
            this.scene.launch('Story', {
                mode: 'narrative',
                title: 'The Thornpillar Falls',
                body: 'The Void Anchor ruptures — not with violence but with a sound like held breath released.\n\nThe Thornpillar shudders. You have time to look up before it goes: a column of teal crystal the size of a city, alive for twelve generations, made of something the world grew to hold itself together. Then it leans. Then it descends.\n\nThe impact is felt in Thornmere as an earthquake. In Greyhollow as a colour in the sky. In the Underlurk as a sound that the Vorrkai will not speak of afterwards. Three Rootwardens die in the collapse. None of them ran.\n\nYou did what was necessary. You are not sure that is the same as doing what was right.'
            });
            this.scene.pause('Game');
        }
        // Act 4 → 5: Return to surface
        if (questId === 'main_act4' && stageId === 'act4_complete') {
            this.scene.launch('Story', {
                mode: 'narrative',
                title: 'Greyhollow, After',
                body: 'You have been gone long enough that the inn has changed its menu. The Thornpillar gap in the northern sky is a wound that Greyhollow cannot look away from. People have started calling it the Window.\n\nSathis meets you at the Sanctuary gate. He is older. Not in years — in decisions.\n\n"I know what must happen next," he says. "I have known for two hundred years. I have simply been waiting for someone who could make it possible." He looks at the sky through the Window. "And for the courage to ask."'
            });
            this.scene.pause('Game');
        }
        // Act 5 → Sathis reveals the Kindling
        if (questId === 'main_act5' && nextStageId === 'final_choice') {
            this.scene.launch('Story', {
                mode: 'narrative',
                title: 'The Kindling',
                body: 'Sathis speaks in the Sanctuary at dusk, the light coming in green and cold through the root-ceiling.\n\n"The Type-48 engine requires a living catalyst," he says. "A being with Rootstone-attuned biology who is willing to become part of the lattice. Not a sacrifice — a transition. I would not cease to be. I would become something the Rootstones can hear."\n\nHe has clearly thought about how to say this for a very long time. He has clearly also decided that there is no way to say it that does not sound like what it is.\n\n"I am asking you to help me choose this. I am not asking you to choose it for me."'
            });
            this.scene.pause('Game');
        }
    }

    resolveDialogueTree(npcData) {
        const player = this.registry.get('player');
        if (!player) return npcData.dialogueRoot;
        const flags    = player.flags;
        const active   = player.quests.active;
        const completed = player.quests.completed;

        if (npcData.id === 'cael' && active.has('main_act1')) {
            return npcData.dialogueActiveQuest || npcData.dialogueRoot;
        }
        if (npcData.id === 'elder_sathis') {
            return flags.has('sathis_met') || completed.has('main_act1')
                ? (npcData.dialogueOngoing || npcData.dialogueRoot)
                : npcData.dialogueRoot;
        }
        // NPCs whose dialogueActiveQuest fires when their linked quest is active
        const activeQuestNpcs = ['maren_ashveil', 'syllis_vaar', 'gerran_solt', 'aelindra'];
        if (activeQuestNpcs.includes(npcData.id) && npcData.questGiver) {
            const hasActiveQuest = npcData.questGiver.some(qid => active.has(qid));
            if (hasActiveQuest && npcData.dialogueActiveQuest) return npcData.dialogueActiveQuest;
        }
        // Zeth Mirrak uses ongoing tree after first meeting
        if (npcData.id === 'zeth_mirrak' && flags.has('talked_to_zeth_mirrak')) {
            return npcData.dialogueOngoing || npcData.dialogueRoot;
        }
        // Varenne Osel — conflict tree when Oren's journal is found
        if (npcData.id === 'varenne_osel' && flags.has('oren_journal_found') && npcData.dialogueConflict) {
            return npcData.dialogueConflict;
        }
        return npcData.dialogueRoot;
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
        EventBus.off('trigger_ending',    this.onTriggerEnding,  this);
        EventBus.off('flag_set',          this.onFlagSet,        this);
        EventBus.off('world_state_changed', this.onWorldStateChanged, this);
        EventBus.off('quest_stage_complete', this.onQuestStageComplete, this);
        if (this.storyWorld) this.storyWorld.destroy();
    }
}
