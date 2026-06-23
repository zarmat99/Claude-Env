import { WORLD_LOCATIONS, ROOTSTONE_POSITIONS } from '../world/WorldGen.js';
import { BIOME_DATA } from '../world/Biomes.js';
import EventBus from '../systems/EventBus.js';
import { STORY_SITES } from '../systems/StoryWorldSystem.js';

// Numeric biome IDs — must match WorldGen.js BIOME_ID order
const BIOME_COLORS_BY_ID = [
    '#0a2a5a', // 0 WATER
    '#c8b46a', // 1 COASTAL
    '#2d5a1b', // 2 GRASSLAND
    '#1a4a0a', // 3 FOREST
    '#0a2a04', // 4 DARK_FOREST
    '#2a4a1a', // 5 SWAMP
    '#c8a050', // 6 DESERT
    '#a8c0c0', // 7 TUNDRA
    '#6a6a6a', // 8 MOUNTAIN
    '#8a2a0a', // 9 VOLCANIC
    '#1a0a2a'  // 10 UNDERLURK
];

const MAP_SIZE     = 200;
const PIXEL_PER_TILE = 3; // 200*3 = 600 px map
const MAP_CANVAS_W = MAP_SIZE * PIXEL_PER_TILE;
const MAP_CANVAS_H = MAP_SIZE * PIXEL_PER_TILE;

export default class MapScene extends Phaser.Scene {
    constructor() { super({ key: 'WorldMap' }); }

    create() {
        const player    = this.registry.get('player');
        const worldData = this.registry.get('worldData');

        if (!player || !worldData) { this.scene.stop(); return; }

        const W = this.scale.width;
        const H = this.scale.height;

        // ── Background ─────────────────────────────────────────────────────────
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.92)
            .setScrollFactor(0).setDepth(0);

        // ── Title ──────────────────────────────────────────────────────────────
        this.add.text(W / 2, 16, 'World Map — Varethos', {
            fontSize: '16px', color: '#00ccff', fontFamily: 'Courier New'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2);

        // ── Close hint (tappable) ──────────────────────────────────────────────
        this.add.text(W - 44, 16, '[M] or [ESC] Close', {
            fontSize: '10px', color: '#445566', fontFamily: 'Courier New'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(2);

        // ── Close button (touch) ───────────────────────────────────────────────
        const closeBtn = this.add.text(W - 16, 14, '✕', {
            fontSize: '18px', color: '#cc6666', fontFamily: 'Courier New'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(3)
          .setInteractive({ useHandCursor: true });
        closeBtn.on('pointerover', () => closeBtn.setColor('#ff8888'));
        closeBtn.on('pointerout',  () => closeBtn.setColor('#cc6666'));
        closeBtn.on('pointerdown', () => this.scene.stop('WorldMap'));

        this.input.keyboard.on('keydown-M',   () => this.scene.stop('WorldMap'));
        this.input.keyboard.on('keydown-ESC', () => this.scene.stop('WorldMap'));

        // ── Build map canvas ───────────────────────────────────────────────────
        const canvas = document.createElement('canvas');
        canvas.width  = MAP_CANVAS_W;
        canvas.height = MAP_CANVAS_H;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const tiles    = worldData.tiles;
        const biomeMap = worldData.biomeMap;
        const explored = player.exploredTiles;

        for (let ty = 0; ty < MAP_SIZE; ty++) {
            for (let tx = 0; tx < MAP_SIZE; tx++) {
                const idx     = ty * MAP_SIZE + tx;
                const biomeId = biomeMap[idx];
                const isExplored = explored[idx];

                if (!isExplored) {
                    // Fog of war — very dark
                    ctx.fillStyle = '#05050a';
                } else {
                    ctx.fillStyle = BIOME_COLORS_BY_ID[biomeId] || '#222222';
                }

                ctx.fillRect(
                    tx * PIXEL_PER_TILE,
                    ty * PIXEL_PER_TILE,
                    PIXEL_PER_TILE,
                    PIXEL_PER_TILE
                );
            }
        }

        // ── Draw roads as lighter lines ────────────────────────────────────────
        ctx.fillStyle = '#998866';
        for (let ty = 0; ty < MAP_SIZE; ty++) {
            for (let tx = 0; tx < MAP_SIZE; tx++) {
                const idx = ty * MAP_SIZE + tx;
                if (tiles[idx] === 21 && explored[idx]) { // ROAD
                    ctx.fillRect(tx * PIXEL_PER_TILE, ty * PIXEL_PER_TILE, PIXEL_PER_TILE, PIXEL_PER_TILE);
                }
            }
        }

        // ── Register and display canvas ────────────────────────────────────────
        const mapKey = 'world_minimap_canvas';
        if (this.textures.exists(mapKey)) this.textures.remove(mapKey);
        this.textures.addCanvas(mapKey, canvas);

        const mapOffX = (W - MAP_CANVAS_W) / 2;
        const mapOffY = 36;

        const mapImage = this.add.image(W / 2, mapOffY + MAP_CANVAS_H / 2, mapKey)
            .setScrollFactor(0).setDepth(1);

        // ── Draw location markers ──────────────────────────────────────────────
        this.locationLabels = [];
        this.hoverMarkers   = [];

        const gfx = this.add.graphics().setScrollFactor(0).setDepth(3);

        for (const [locId, loc] of Object.entries(WORLD_LOCATIONS)) {
            if (!explored[loc.y * MAP_SIZE + loc.x]) continue;

            const mx = mapOffX + loc.x * PIXEL_PER_TILE;
            const my = mapOffY + loc.y * PIXEL_PER_TILE;

            const dotColor = loc.type === 'city' ? 0xffdd44 :
                             loc.type === 'town' ? 0xffaa44 :
                             loc.type === 'special' ? 0x44ccff : 0x88aacc;
            const dotSize  = loc.type === 'city' ? 5 : 4;

            gfx.fillStyle(dotColor, 1);
            gfx.fillCircle(mx, my, dotSize);
            gfx.lineStyle(1, 0x000000, 0.8);
            gfx.strokeCircle(mx, my, dotSize);

            // Invisible hover zone
            const zone = this.add.zone(mx, my, 16, 16)
                .setScrollFactor(0).setDepth(4).setInteractive();

            zone.on('pointerover', () => {
                this.showLocationLabel(loc.name, mx, my + 10, dotColor);
            });
            zone.on('pointerout', () => this.hideLocationLabel());
            this.hoverMarkers.push(zone);
        }

        // ── Draw Rootstone markers ─────────────────────────────────────────────
        for (const rs of ROOTSTONE_POSITIONS) {
            if (!explored[rs.y * MAP_SIZE + rs.x]) continue;

            const mx = mapOffX + rs.x * PIXEL_PER_TILE;
            const my = mapOffY + rs.y * PIXEL_PER_TILE;

            // Teal glow dot
            gfx.fillStyle(0x00eecc, 1);
            gfx.fillCircle(mx, my, 3);
            // Glow ring
            gfx.lineStyle(1, 0x00ccff, 0.6);
            gfx.strokeCircle(mx, my, 5);

            const zone = this.add.zone(mx, my, 14, 14)
                .setScrollFactor(0).setDepth(4).setInteractive();

            const rsHealth = Math.round(rs.health * 100);
            const rsName   = rs.name;
            zone.on('pointerover', () => this.showLocationLabel(
                `${rsName} — ${rsHealth}%`, mx, my + 8, 0x00ccff
            ));
            zone.on('pointerout', () => this.hideLocationLabel());
            this.hoverMarkers.push(zone);
        }

        // Discovered story sites use a violet diamond so the campaign is navigable.
        for (const site of STORY_SITES) {
            if (!explored[site.y * MAP_SIZE + site.x]) continue;
            const mx = mapOffX + site.x * PIXEL_PER_TILE;
            const my = mapOffY + site.y * PIXEL_PER_TILE;
            gfx.fillStyle(0xcc66ff, 0.95);
            gfx.fillRect(mx - 2, my - 2, 5, 5);
            const zone = this.add.zone(mx, my, 14, 14)
                .setScrollFactor(0).setDepth(4).setInteractive();
            zone.on('pointerover', () => this.showLocationLabel(site.name, mx, my + 8, 0xcc66ff));
            zone.on('pointerout', () => this.hideLocationLabel());
            this.hoverMarkers.push(zone);
        }

        // ── Player position blinking dot ───────────────────────────────────────
        const px = mapOffX + player.worldX * PIXEL_PER_TILE;
        const py = mapOffY + player.worldY * PIXEL_PER_TILE;

        this.playerDot = this.add.graphics().setScrollFactor(0).setDepth(5);
        this.playerDot.fillStyle(0xffffff, 1);
        this.playerDot.fillCircle(px, py, 4);
        this.playerDot.lineStyle(1, 0x000000, 0.8);
        this.playerDot.strokeCircle(px, py, 4);

        // Blink player dot
        this.tweens.add({
            targets:  this.playerDot,
            alpha:    { from: 1, to: 0.2 },
            duration: 700, yoyo: true, repeat: -1
        });

        // ── Legend (bottom bar) ────────────────────────────────────────────────
        const legendY = mapOffY + MAP_CANVAS_H + 10;
        const legend = [
            { color: '#ffdd44', label: 'City'      },
            { color: '#ffaa44', label: 'Town'      },
            { color: '#44ccff', label: 'Special'   },
            { color: '#00eecc', label: 'Rootstone' },
            { color: '#ffffff', label: 'You'        }
        ];
        legend.forEach((item, i) => {
            const lx = W / 2 - legend.length * 70 / 2 + i * 70;
            gfx.fillStyle(Phaser.Display.Color.HexStringToColor(item.color).color, 1);
            gfx.fillCircle(lx - 20, legendY + 7, 4);
            this.add.text(lx - 13, legendY, item.label, {
                fontSize: '9px', color: '#778899', fontFamily: 'Courier New'
            }).setScrollFactor(0).setDepth(3);
        });

        // Tooltip text
        this.locationLabelText = this.add.text(0, 0, '', {
            fontSize: '11px', color: '#ffffff', fontFamily: 'Courier New',
            backgroundColor: '#00000099', padding: { x: 5, y: 3 }
        }).setScrollFactor(0).setDepth(10).setVisible(false);
    }

    showLocationLabel(text, x, y, hexColor) {
        const col = '#' + Phaser.Display.Color.IntegerToColor(hexColor).rgba.substring(0, 6);
        this.locationLabelText
            .setText(text)
            .setColor(typeof hexColor === 'string' ? hexColor : col)
            .setPosition(x + 6, y)
            .setVisible(true);
    }

    hideLocationLabel() {
        if (this.locationLabelText) this.locationLabelText.setVisible(false);
    }

    shutdown() {
        this.hideLocationLabel();
    }
}
