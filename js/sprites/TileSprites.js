// TileSprites.js — Generates all 25 tile textures into a single atlas

import { SpriteFactory } from './SpriteFactory.js';
import { TILE } from '../world/Biomes.js';

const TILE_SIZE  = 16;
const TILE_COUNT = 25; // IDs 0–24

export function generateTileAtlas(scene) {
    const totalW = TILE_SIZE * TILE_COUNT; // 400px wide, 16px tall
    const { canvas, ctx } = SpriteFactory.createCanvas(totalW, TILE_SIZE);

    // Draw each tile at x = tileId * TILE_SIZE
    drawWater(ctx,         TILE.WATER         * TILE_SIZE, 0);
    drawShallows(ctx,      TILE.SHALLOWS      * TILE_SIZE, 0);
    drawSand(ctx,          TILE.SAND          * TILE_SIZE, 0);
    drawGrass(ctx,         TILE.GRASS         * TILE_SIZE, 0);
    drawDirt(ctx,          TILE.DIRT          * TILE_SIZE, 0);
    drawForest(ctx,        TILE.FOREST        * TILE_SIZE, 0);
    drawDarkForest(ctx,    TILE.DARK_FOREST   * TILE_SIZE, 0);
    drawSnow(ctx,          TILE.SNOW          * TILE_SIZE, 0);
    drawTundra(ctx,        TILE.TUNDRA        * TILE_SIZE, 0);
    drawMountain(ctx,      TILE.MOUNTAIN      * TILE_SIZE, 0);
    drawMountainTop(ctx,   TILE.MOUNTAIN_TOP  * TILE_SIZE, 0);
    drawVolcanic(ctx,      TILE.VOLCANIC      * TILE_SIZE, 0);
    drawLava(ctx,          TILE.LAVA          * TILE_SIZE, 0);
    drawSwamp(ctx,         TILE.SWAMP         * TILE_SIZE, 0);
    drawDesert(ctx,        TILE.DESERT        * TILE_SIZE, 0);
    drawCaveFloor(ctx,     TILE.CAVE_FLOOR    * TILE_SIZE, 0);
    drawCaveWall(ctx,      TILE.CAVE_WALL     * TILE_SIZE, 0);
    drawCaveEntrance(ctx,  TILE.CAVE_ENTRANCE * TILE_SIZE, 0);
    drawRootstone(ctx,     TILE.ROOTSTONE     * TILE_SIZE, 0);
    drawStoneFloor(ctx,    TILE.STONE_FLOOR   * TILE_SIZE, 0);
    drawStoneWall(ctx,     TILE.STONE_WALL    * TILE_SIZE, 0);
    drawRoad(ctx,          TILE.ROAD          * TILE_SIZE, 0);
    drawChest(ctx,         TILE.CHEST         * TILE_SIZE, 0);
    drawTree(ctx,          TILE.TREE          * TILE_SIZE, 0);
    drawShrub(ctx,         TILE.SHRUB         * TILE_SIZE, 0);

    // Register atlas
    SpriteFactory.register(scene, 'tiles', canvas);
    const tex = scene.textures.get('tiles');
    tex.add('__BASE', 0, 0, 0, totalW, TILE_SIZE);

    // Add individual numeric frames (frame = tileId)
    for (let i = 0; i < TILE_COUNT; i++) {
        tex.add(i, 0, i * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
    }
}

// ============================================================
//  Individual tile draw functions
// ============================================================

// 0 — WATER: deep blue with wave stripes
function drawWater(ctx, ox, oy) {
    ctx.fillStyle = '#0a2a5a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#1a4a8a';
    ctx.fillRect(ox, oy + 4, 16, 2);
    ctx.fillRect(ox, oy + 10, 16, 2);
    ctx.fillStyle = '#2a5aaa';
    ctx.fillRect(ox + 1, oy + 5, 7, 1);
    ctx.fillRect(ox + 9, oy + 11, 5, 1);
    ctx.fillStyle = '#0d3570';
    ctx.fillRect(ox + 3, oy + 1, 4, 1);
    ctx.fillRect(ox + 11, oy + 8, 3, 1);
}

// 1 — SHALLOWS: lighter blue with sandy undertone
function drawShallows(ctx, ox, oy) {
    ctx.fillStyle = '#1a5a8a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#2a7aaa';
    ctx.fillRect(ox, oy + 3, 16, 2);
    ctx.fillRect(ox, oy + 9, 16, 2);
    ctx.fillStyle = '#4a9aca';
    ctx.fillRect(ox + 2, oy + 4, 5, 1);
    ctx.fillRect(ox + 9, oy + 10, 4, 1);
    // Sandy floor hint
    ctx.fillStyle = '#4a7a6a';
    ctx.fillRect(ox + 4, oy + 13, 3, 1);
    ctx.fillRect(ox + 10, oy + 7, 2, 1);
}

// 2 — SAND: warm sandy beige with pebbles
function drawSand(ctx, ox, oy) {
    ctx.fillStyle = '#d4b86a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#c4a85a';
    ctx.fillRect(ox + 2, oy + 2, 3, 2);
    ctx.fillRect(ox + 9, oy + 7, 2, 2);
    ctx.fillRect(ox + 5, oy + 12, 4, 2);
    ctx.fillStyle = '#e8cc80';
    ctx.fillRect(ox + 6, oy + 0, 2, 1);
    ctx.fillRect(ox + 0, oy + 8, 1, 2);
    ctx.fillRect(ox + 13, oy + 3, 2, 1);
    ctx.fillStyle = '#b89850';
    ctx.fillRect(ox + 4, oy + 5, 1, 1);
    ctx.fillRect(ox + 11, oy + 11, 1, 1);
}

// 3 — GRASS: green with blade details
function drawGrass(ctx, ox, oy) {
    ctx.fillStyle = '#3a7a1a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#4a8a2a';
    ctx.fillRect(ox + 1, oy + 2, 1, 3);
    ctx.fillRect(ox + 5, oy + 8, 1, 3);
    ctx.fillRect(ox + 9, oy + 1, 1, 3);
    ctx.fillRect(ox + 13, oy + 9, 1, 3);
    ctx.fillRect(ox + 3, oy + 12, 1, 3);
    ctx.fillStyle = '#2a6a0a';
    ctx.fillRect(ox + 3, oy + 4, 2, 1);
    ctx.fillRect(ox + 7, oy + 10, 2, 1);
    ctx.fillRect(ox + 11, oy + 3, 2, 1);
    ctx.fillStyle = '#5a9a3a';
    ctx.fillRect(ox + 6, oy + 5, 1, 1);
    ctx.fillRect(ox + 14, oy + 13, 1, 1);
    ctx.fillRect(ox + 0, oy + 14, 1, 1);
}

// 4 — DIRT: brown with darker spots
function drawDirt(ctx, ox, oy) {
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(ox + 2, oy + 3, 3, 2);
    ctx.fillRect(ox + 10, oy + 8, 2, 3);
    ctx.fillRect(ox + 5, oy + 13, 4, 2);
    ctx.fillStyle = '#9a7a5a';
    ctx.fillRect(ox + 6, oy + 1, 2, 1);
    ctx.fillRect(ox + 1, oy + 11, 1, 2);
    ctx.fillRect(ox + 13, oy + 5, 2, 1);
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(ox + 4, oy + 7, 1, 1);
    ctx.fillRect(ox + 12, oy + 12, 1, 1);
}

// 5 — FOREST: dark green canopy
function drawForest(ctx, ox, oy) {
    ctx.fillStyle = '#1a5a0a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#2a6a1a';
    ctx.fillRect(ox + 2, oy + 2, 5, 5);
    ctx.fillRect(ox + 9, oy + 8, 5, 5);
    ctx.fillStyle = '#0a4a00';
    ctx.fillRect(ox + 0, oy + 5, 3, 3);
    ctx.fillRect(ox + 10, oy + 1, 4, 4);
    ctx.fillRect(ox + 4, oy + 11, 3, 3);
    ctx.fillStyle = '#3a7a2a';
    ctx.fillRect(ox + 5, oy + 4, 2, 2);
    ctx.fillRect(ox + 12, oy + 10, 2, 2);
    ctx.fillRect(ox + 1, oy + 13, 2, 2);
    // Shadow spots
    ctx.fillStyle = '#0a3000';
    ctx.fillRect(ox + 7, oy + 6, 2, 2);
    ctx.fillRect(ox + 13, oy + 3, 2, 2);
}

// 6 — DARK_FOREST: very dark green
function drawDarkForest(ctx, ox, oy) {
    ctx.fillStyle = '#0a2a04';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#1a3a0a';
    ctx.fillRect(ox + 1, oy + 1, 4, 4);
    ctx.fillRect(ox + 8, oy + 7, 5, 5);
    ctx.fillStyle = '#0a1a04';
    ctx.fillRect(ox + 0, oy + 4, 2, 4);
    ctx.fillRect(ox + 9, oy + 1, 4, 4);
    ctx.fillRect(ox + 3, oy + 11, 3, 4);
    ctx.fillStyle = '#2a4a14';
    ctx.fillRect(ox + 5, oy + 3, 1, 2);
    ctx.fillRect(ox + 12, oy + 9, 1, 2);
    // Eerie glow dots
    ctx.fillStyle = '#4a8a14';
    ctx.fillRect(ox + 7, oy + 5, 1, 1);
    ctx.fillRect(ox + 2, oy + 13, 1, 1);
    ctx.fillRect(ox + 14, oy + 2, 1, 1);
}

// 7 — SNOW: white-blue with sparkle pixels
function drawSnow(ctx, ox, oy) {
    ctx.fillStyle = '#dce8f0';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#c8d8e8';
    ctx.fillRect(ox + 1, oy + 3, 4, 2);
    ctx.fillRect(ox + 9, oy + 10, 5, 2);
    ctx.fillRect(ox + 4, oy + 13, 6, 2);
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(ox + 3, oy + 1, 1, 1);
    ctx.fillRect(ox + 11, oy + 5, 1, 1);
    ctx.fillRect(ox + 7, oy + 9, 1, 1);
    ctx.fillRect(ox + 1, oy + 14, 1, 1);
    ctx.fillRect(ox + 14, oy + 12, 1, 1);
    ctx.fillStyle = '#a8c0d0';
    ctx.fillRect(ox + 6, oy + 6, 3, 1);
    ctx.fillRect(ox + 0, oy + 10, 2, 1);
}

// 8 — TUNDRA: pale grey with frost
function drawTundra(ctx, ox, oy) {
    ctx.fillStyle = '#9aacb0';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#8a9ca0';
    ctx.fillRect(ox + 2, oy + 4, 4, 2);
    ctx.fillRect(ox + 10, oy + 9, 4, 2);
    ctx.fillStyle = '#b0c0c8';
    ctx.fillRect(ox + 5, oy + 1, 2, 1);
    ctx.fillRect(ox + 1, oy + 10, 1, 2);
    ctx.fillRect(ox + 13, oy + 4, 2, 1);
    ctx.fillStyle = '#d0dce0';
    ctx.fillRect(ox + 7, oy + 7, 1, 1);
    ctx.fillRect(ox + 3, oy + 13, 1, 1);
    ctx.fillRect(ox + 12, oy + 14, 2, 1);
    // Frost crystals
    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(ox + 9, oy + 3, 1, 1);
    ctx.fillRect(ox + 0, oy + 7, 1, 1);
}

// 9 — MOUNTAIN: grey rocky
function drawMountain(ctx, ox, oy) {
    ctx.fillStyle = '#6a6a6a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(ox + 2, oy + 1, 5, 4);
    ctx.fillRect(ox + 9, oy + 6, 5, 5);
    ctx.fillRect(ox + 4, oy + 11, 6, 3);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(ox + 1, oy + 4, 3, 3);
    ctx.fillRect(ox + 9, oy + 1, 4, 3);
    ctx.fillRect(ox + 0, oy + 10, 3, 4);
    ctx.fillStyle = '#9a9a9a';
    ctx.fillRect(ox + 6, oy + 3, 2, 2);
    ctx.fillRect(ox + 12, oy + 8, 2, 2);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(ox + 7, oy + 13, 2, 2);
    ctx.fillRect(ox + 13, oy + 2, 2, 2);
}

// 10 — MOUNTAIN_TOP: light grey + snow cap
function drawMountainTop(ctx, ox, oy) {
    ctx.fillStyle = '#8a8a9a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(ox + 2, oy + 2, 5, 4);
    ctx.fillRect(ox + 9, oy + 7, 4, 4);
    // Snow cap at top
    ctx.fillStyle = '#e8eef8';
    ctx.fillRect(ox + 5, oy + 0, 6, 4);
    ctx.fillRect(ox + 3, oy + 2, 3, 2);
    ctx.fillRect(ox + 10, oy + 1, 2, 3);
    ctx.fillStyle = '#f8feff';
    ctx.fillRect(ox + 6, oy + 0, 4, 2);
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(ox + 0, oy + 9, 3, 4);
    ctx.fillRect(ox + 12, oy + 5, 3, 5);
}

// 11 — VOLCANIC: dark red/orange with glow cracks
function drawVolcanic(ctx, ox, oy) {
    ctx.fillStyle = '#2a0a00';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#4a1a00';
    ctx.fillRect(ox + 1, oy + 2, 4, 3);
    ctx.fillRect(ox + 9, oy + 8, 5, 4);
    ctx.fillRect(ox + 4, oy + 12, 5, 3);
    ctx.fillStyle = '#8a2a00';
    ctx.fillRect(ox + 3, oy + 5, 2, 2);
    ctx.fillRect(ox + 10, oy + 3, 3, 2);
    // Glow lines
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(ox + 0, oy + 7, 5, 1);
    ctx.fillRect(ox + 8, oy + 11, 6, 1);
    ctx.fillStyle = '#ff9900';
    ctx.fillRect(ox + 2, oy + 8, 2, 1);
    ctx.fillRect(ox + 11, oy + 12, 2, 1);
    // Hot spots
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(ox + 1, oy + 7, 1, 1);
    ctx.fillRect(ox + 13, oy + 11, 1, 1);
}

// 12 — LAVA: bright orange-red flowing
function drawLava(ctx, ox, oy) {
    ctx.fillStyle = '#cc3300';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#ff5500';
    ctx.fillRect(ox + 0, oy + 2, 16, 3);
    ctx.fillRect(ox + 0, oy + 9, 16, 3);
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(ox + 2, oy + 3, 5, 1);
    ctx.fillRect(ox + 9, oy + 10, 4, 1);
    ctx.fillRect(ox + 0, oy + 6, 7, 1);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(ox + 3, oy + 3, 2, 1);
    ctx.fillRect(ox + 11, oy + 10, 1, 1);
    ctx.fillRect(ox + 1, oy + 6, 2, 1);
    ctx.fillStyle = '#992200';
    ctx.fillRect(ox + 7, oy + 0, 3, 2);
    ctx.fillRect(ox + 0, oy + 13, 4, 3);
    ctx.fillRect(ox + 12, oy + 5, 4, 3);
}

// 13 — SWAMP: murky green-brown
function drawSwamp(ctx, ox, oy) {
    ctx.fillStyle = '#2a4a1a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#3a5a2a';
    ctx.fillRect(ox + 2, oy + 3, 4, 3);
    ctx.fillRect(ox + 9, oy + 8, 4, 3);
    ctx.fillStyle = '#1a3a0a';
    ctx.fillRect(ox + 0, oy + 7, 3, 4);
    ctx.fillRect(ox + 11, oy + 2, 4, 4);
    // Murky water patches
    ctx.fillStyle = '#1a3a3a';
    ctx.fillRect(ox + 5, oy + 9, 3, 3);
    ctx.fillRect(ox + 1, oy + 13, 4, 2);
    ctx.fillStyle = '#2a5a4a';
    ctx.fillRect(ox + 6, oy + 10, 1, 2);
    ctx.fillRect(ox + 3, oy + 14, 2, 1);
    // Bubbles
    ctx.fillStyle = '#4a7a3a';
    ctx.fillRect(ox + 7, oy + 5, 1, 1);
    ctx.fillRect(ox + 12, oy + 12, 1, 1);
    ctx.fillRect(ox + 0, oy + 1, 1, 1);
}

// 14 — DESERT: sandy with pebble details
function drawDesert(ctx, ox, oy) {
    ctx.fillStyle = '#c8a050';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#b89040';
    ctx.fillRect(ox + 3, oy + 2, 4, 3);
    ctx.fillRect(ox + 10, oy + 9, 4, 3);
    ctx.fillStyle = '#d8b060';
    ctx.fillRect(ox + 6, oy + 0, 3, 2);
    ctx.fillRect(ox + 0, oy + 11, 2, 3);
    ctx.fillRect(ox + 13, oy + 5, 2, 3);
    // Pebbles
    ctx.fillStyle = '#a07838';
    ctx.fillRect(ox + 1, oy + 6, 2, 2);
    ctx.fillRect(ox + 9, oy + 3, 2, 2);
    ctx.fillRect(ox + 6, oy + 13, 2, 2);
    ctx.fillStyle = '#e8c070';
    ctx.fillRect(ox + 5, oy + 7, 1, 1);
    ctx.fillRect(ox + 12, oy + 14, 1, 1);
}

// 15 — CAVE_FLOOR: dark grey
function drawCaveFloor(ctx, ox, oy) {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(ox + 2, oy + 4, 3, 2);
    ctx.fillRect(ox + 9, oy + 9, 4, 2);
    ctx.fillRect(ox + 1, oy + 12, 3, 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(ox + 7, oy + 2, 3, 2);
    ctx.fillRect(ox + 12, oy + 7, 3, 2);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(ox + 5, oy + 8, 1, 1);
    ctx.fillRect(ox + 13, oy + 13, 1, 1);
}

// 16 — CAVE_WALL: near-black with mineral inclusions
function drawCaveWall(ctx, ox, oy) {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(ox + 2, oy + 1, 5, 4);
    ctx.fillRect(ox + 9, oy + 7, 5, 5);
    ctx.fillRect(ox + 1, oy + 10, 4, 5);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(ox + 5, oy + 4, 3, 3);
    ctx.fillRect(ox + 12, oy + 2, 3, 3);
    // Mineral inclusions
    ctx.fillStyle = '#3a5a7a';
    ctx.fillRect(ox + 3, oy + 7, 1, 1);
    ctx.fillRect(ox + 11, oy + 12, 1, 1);
    ctx.fillStyle = '#2a4a3a';
    ctx.fillRect(ox + 8, oy + 3, 1, 1);
    ctx.fillRect(ox + 0, oy + 13, 1, 1);
}

// 17 — CAVE_ENTRANCE: dark arch shape
function drawCaveEntrance(ctx, ox, oy) {
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(ox, oy, 16, 16);
    // Arch frame
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(ox + 2, oy + 2, 12, 2);  // top of arch
    ctx.fillRect(ox + 2, oy + 2, 2, 10);  // left pillar
    ctx.fillRect(ox + 12, oy + 2, 2, 10); // right pillar
    // Dark void inside
    ctx.fillStyle = '#060608';
    ctx.fillRect(ox + 4, oy + 4, 8, 10);
    // Arch curve hints
    ctx.fillStyle = '#8a8a9a';
    ctx.fillRect(ox + 3, oy + 3, 2, 1);
    ctx.fillRect(ox + 11, oy + 3, 2, 1);
    // Keystone
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(ox + 7, oy + 1, 2, 2);
    // Ground floor inside
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(ox + 4, oy + 12, 8, 2);
}

// 18 — ROOTSTONE: dark with glowing teal veins
function drawRootstone(ctx, ox, oy) {
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(ox + 2, oy + 2, 5, 5);
    ctx.fillRect(ox + 9, oy + 8, 5, 5);
    // Teal vein lines
    ctx.fillStyle = '#00ccaa';
    ctx.fillRect(ox + 0, oy + 5, 16, 1);
    ctx.fillRect(ox + 5, oy + 0, 1, 16);
    ctx.fillRect(ox + 2, oy + 8, 5, 1);
    ctx.fillRect(ox + 9, oy + 3, 1, 5);
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(ox + 3, oy + 5, 2, 1);
    ctx.fillRect(ox + 5, oy + 3, 1, 2);
    ctx.fillRect(ox + 10, oy + 7, 2, 1);
    ctx.fillRect(ox + 11, oy + 5, 1, 2);
    // Bright nodes at intersections
    ctx.fillStyle = '#80ffee';
    ctx.fillRect(ox + 5, oy + 5, 1, 1);
    ctx.fillRect(ox + 10, oy + 8, 1, 1);
}

// 19 — STONE_FLOOR: cobblestone pattern
function drawStoneFloor(ctx, ox, oy) {
    ctx.fillStyle = '#5a5a6a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(ox + 1, oy + 1, 6, 6);
    ctx.fillRect(ox + 9, oy + 1, 6, 6);
    ctx.fillRect(ox + 5, oy + 9, 6, 6);
    ctx.fillRect(ox + 0, oy + 9, 4, 6);
    // Mortar lines
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(ox, oy + 7, 16, 1);
    ctx.fillRect(ox + 7, oy, 1, 7);
    ctx.fillRect(ox + 7, oy + 8, 1, 8);
    ctx.fillRect(ox + 4, oy + 8, 1, 8);
    // Highlight corners
    ctx.fillStyle = '#7a7a8a';
    ctx.fillRect(ox + 1, oy + 1, 2, 1);
    ctx.fillRect(ox + 9, oy + 1, 2, 1);
}

// 20 — STONE_WALL: darker grey with mortar
function drawStoneWall(ctx, ox, oy) {
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(ox + 0, oy + 0, 7, 5);
    ctx.fillRect(ox + 9, oy + 0, 7, 5);
    ctx.fillRect(ox + 0, oy + 8, 16, 5);
    // Mortar lines
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(ox, oy + 5, 16, 1);
    ctx.fillRect(ox, oy + 13, 16, 1);
    ctx.fillRect(ox + 8, oy, 1, 5);
    ctx.fillRect(ox + 4, oy + 6, 1, 7);
    ctx.fillRect(ox + 12, oy + 6, 1, 7);
    // Top highlight
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(ox + 1, oy + 1, 5, 1);
    ctx.fillRect(ox + 10, oy + 1, 4, 1);
}

// 21 — ROAD: packed dirt, lighter brown
function drawRoad(ctx, ox, oy) {
    ctx.fillStyle = '#9a8060';
    ctx.fillRect(ox, oy, 16, 16);
    ctx.fillStyle = '#8a7050';
    ctx.fillRect(ox + 1, oy + 3, 4, 2);
    ctx.fillRect(ox + 9, oy + 9, 5, 2);
    ctx.fillStyle = '#aaa070';
    ctx.fillRect(ox + 5, oy + 0, 2, 2);
    ctx.fillRect(ox + 0, oy + 11, 2, 2);
    ctx.fillRect(ox + 13, oy + 6, 2, 2);
    // Wheel rut lines
    ctx.fillStyle = '#7a6040';
    ctx.fillRect(ox + 2, oy + 6, 12, 1);
    ctx.fillRect(ox + 2, oy + 10, 12, 1);
    ctx.fillStyle = '#b0906a';
    ctx.fillRect(ox + 3, oy + 5, 8, 1);
}

// 22 — CHEST: brown box with gold clasp
function drawChest(ctx, ox, oy) {
    // Shadow
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(ox + 3, oy + 13, 11, 2);
    // Box body
    ctx.fillStyle = '#8a5a2a';
    ctx.fillRect(ox + 2, oy + 5, 12, 8);
    // Lid
    ctx.fillStyle = '#aa7a3a';
    ctx.fillRect(ox + 2, oy + 3, 12, 4);
    // Dark outline
    ctx.fillStyle = '#3a2a0a';
    ctx.fillRect(ox + 2, oy + 3, 12, 1);   // lid top
    ctx.fillRect(ox + 2, oy + 12, 12, 1);  // bottom
    ctx.fillRect(ox + 2, oy + 3, 1, 10);   // left
    ctx.fillRect(ox + 13, oy + 3, 1, 10);  // right
    // Lid line
    ctx.fillRect(ox + 2, oy + 7, 12, 1);
    // Gold clasp
    ctx.fillStyle = '#d4aa00';
    ctx.fillRect(ox + 7, oy + 6, 2, 3);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(ox + 7, oy + 7, 2, 1);
    // Hinges
    ctx.fillStyle = '#d4aa00';
    ctx.fillRect(ox + 3, oy + 7, 2, 1);
    ctx.fillRect(ox + 11, oy + 7, 2, 1);
    // Wood grain
    ctx.fillStyle = '#7a4a1a';
    ctx.fillRect(ox + 3, oy + 9, 10, 1);
    ctx.fillRect(ox + 3, oy + 11, 10, 1);
}

// 23 — TREE: dark green canopy overhead view
function drawTree(ctx, ox, oy) {
    // Background grass undertone
    ctx.fillStyle = '#2a5a0a';
    ctx.fillRect(ox, oy, 16, 16);
    // Shadow
    ctx.fillStyle = '#0a2a00';
    ctx.fillRect(ox + 4, oy + 6, 8, 8);
    // Outer canopy
    ctx.fillStyle = '#1a5a0a';
    ctx.fillRect(ox + 2, oy + 2, 12, 12);
    // Inner canopy layers
    ctx.fillStyle = '#2a7a1a';
    ctx.fillRect(ox + 4, oy + 3, 8, 8);
    ctx.fillStyle = '#3a8a2a';
    ctx.fillRect(ox + 5, oy + 4, 6, 6);
    // Highlight
    ctx.fillStyle = '#4a9a3a';
    ctx.fillRect(ox + 6, oy + 4, 3, 3);
    ctx.fillStyle = '#5aaa4a';
    ctx.fillRect(ox + 7, oy + 4, 1, 2);
    ctx.fillRect(ox + 6, oy + 5, 1, 1);
    // Edge details
    ctx.fillStyle = '#0a3a00';
    ctx.fillRect(ox + 2, oy + 2, 2, 2);
    ctx.fillRect(ox + 12, oy + 2, 2, 2);
    ctx.fillRect(ox + 2, oy + 12, 2, 2);
    ctx.fillRect(ox + 12, oy + 12, 2, 2);
}

// 24 — SHRUB: medium green bush
function drawShrub(ctx, ox, oy) {
    ctx.fillStyle = '#3a7a1a';
    ctx.fillRect(ox, oy, 16, 16);
    // Shrub clusters
    ctx.fillStyle = '#2a6a0a';
    ctx.fillRect(ox + 3, oy + 5, 4, 5);
    ctx.fillRect(ox + 8, oy + 6, 5, 4);
    ctx.fillStyle = '#3a8a2a';
    ctx.fillRect(ox + 4, oy + 4, 3, 4);
    ctx.fillRect(ox + 9, oy + 5, 3, 3);
    ctx.fillRect(ox + 6, oy + 8, 3, 3);
    ctx.fillStyle = '#4a9a3a';
    ctx.fillRect(ox + 5, oy + 5, 2, 2);
    ctx.fillRect(ox + 10, oy + 6, 1, 2);
    ctx.fillStyle = '#1a4a0a';
    ctx.fillRect(ox + 3, oy + 9, 2, 1);
    ctx.fillRect(ox + 10, oy + 9, 2, 1);
    // Berries/flowers
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(ox + 6, oy + 4, 1, 1);
    ctx.fillRect(ox + 11, oy + 7, 1, 1);
}
