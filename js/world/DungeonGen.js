// DungeonGen.js — BSP dungeon generator for interior areas

import { TILE } from './Biomes.js';

const DUNGEON_WIDTH  = 50;
const DUNGEON_HEIGHT = 50;

const MIN_ROOM_W = 5;
const MIN_ROOM_H = 5;
const MAX_ROOM_W = 12;
const MAX_ROOM_H = 10;
const MIN_SPLIT_SIZE = 10; // minimum leaf size before we stop splitting

// ============================================================
//  Seeded LCG RNG (no external deps)
// ============================================================

class RNG {
    constructor(seed) {
        this.s = seed >>> 0;
    }
    next() {
        this.s = (Math.imul(1664525, this.s) + 1013904223) >>> 0;
        return this.s;
    }
    // integer in [min, max)
    int(min, max) {
        return min + (this.next() % (max - min));
    }
    // float in [0,1)
    float() {
        return (this.next() >>> 0) / 0x100000000;
    }
}

// ============================================================
//  BSP node
// ============================================================

class BSPNode {
    constructor(x, y, w, h) {
        this.x = x; this.y = y;
        this.w = w; this.h = h;
        this.left  = null;
        this.right = null;
        this.room  = null; // { x, y, w, h }
    }

    isLeaf() { return !this.left && !this.right; }
}

function bspSplit(node, rng, depth) {
    if (depth <= 0) return;
    if (node.w < MIN_SPLIT_SIZE * 2 && node.h < MIN_SPLIT_SIZE * 2) return;

    // Decide split direction: prefer splitting longest axis
    let splitH = node.h >= node.w;
    if (node.w > MIN_SPLIT_SIZE * 2 && node.h <= MIN_SPLIT_SIZE * 2) splitH = false;
    if (node.h > MIN_SPLIT_SIZE * 2 && node.w <= MIN_SPLIT_SIZE * 2) splitH = true;

    if (splitH) {
        const splitY = rng.int(MIN_SPLIT_SIZE, node.h - MIN_SPLIT_SIZE + 1);
        node.left  = new BSPNode(node.x, node.y,          node.w, splitY);
        node.right = new BSPNode(node.x, node.y + splitY, node.w, node.h - splitY);
    } else {
        const splitX = rng.int(MIN_SPLIT_SIZE, node.w - MIN_SPLIT_SIZE + 1);
        node.left  = new BSPNode(node.x,          node.y, splitX,          node.h);
        node.right = new BSPNode(node.x + splitX, node.y, node.w - splitX, node.h);
    }

    bspSplit(node.left,  rng, depth - 1);
    bspSplit(node.right, rng, depth - 1);
}

function carveRooms(node, rng, tiles, rooms) {
    if (node.isLeaf()) {
        // Create a room inside this leaf
        const maxW = Math.min(MAX_ROOM_W, node.w - 2);
        const maxH = Math.min(MAX_ROOM_H, node.h - 2);
        if (maxW < MIN_ROOM_W || maxH < MIN_ROOM_H) return;

        const rw = rng.int(MIN_ROOM_W, maxW + 1);
        const rh = rng.int(MIN_ROOM_H, maxH + 1);
        const rx = node.x + rng.int(1, node.w - rw);
        const ry = node.y + rng.int(1, node.h - rh);

        node.room = { x: rx, y: ry, w: rw, h: rh };
        rooms.push(node.room);

        for (let row = ry; row < ry + rh; row++) {
            for (let col = rx; col < rx + rw; col++) {
                tiles[row * DUNGEON_WIDTH + col] = TILE.CAVE_FLOOR;
            }
        }
    } else {
        carveRooms(node.left,  rng, tiles, rooms);
        carveRooms(node.right, rng, tiles, rooms);
    }
}

function getRoomCenter(room) {
    return {
        x: Math.floor(room.x + room.w / 2),
        y: Math.floor(room.y + room.h / 2)
    };
}

function connectRooms(nodeA, nodeB, tiles, rng) {
    const a = getLeafRoom(nodeA);
    const b = getLeafRoom(nodeB);
    if (!a || !b) return;

    const ca = getRoomCenter(a);
    const cb = getRoomCenter(b);

    // L-shaped corridor
    if (rng.int(0, 2) === 0) {
        carveHCorridor(tiles, ca.x, cb.x, ca.y);
        carveVCorridor(tiles, ca.y, cb.y, cb.x);
    } else {
        carveVCorridor(tiles, ca.y, cb.y, ca.x);
        carveHCorridor(tiles, ca.x, cb.x, cb.y);
    }
}

function getLeafRoom(node) {
    if (!node) return null;
    if (node.isLeaf()) return node.room;
    const l = getLeafRoom(node.left);
    if (l) return l;
    return getLeafRoom(node.right);
}

function carveHCorridor(tiles, x1, x2, y) {
    const minX = Math.max(0, Math.min(x1, x2));
    const maxX = Math.min(DUNGEON_WIDTH - 1, Math.max(x1, x2));
    for (let x = minX; x <= maxX; x++) {
        if (y >= 0 && y < DUNGEON_HEIGHT) {
            tiles[y * DUNGEON_WIDTH + x] = TILE.CAVE_FLOOR;
        }
    }
}

function carveVCorridor(tiles, y1, y2, x) {
    const minY = Math.max(0, Math.min(y1, y2));
    const maxY = Math.min(DUNGEON_HEIGHT - 1, Math.max(y1, y2));
    for (let y = minY; y <= maxY; y++) {
        if (x >= 0 && x < DUNGEON_WIDTH) {
            tiles[y * DUNGEON_WIDTH + x] = TILE.CAVE_FLOOR;
        }
    }
}

function connectAllLeaves(node, tiles, rng) {
    if (node.isLeaf()) return;
    connectAllLeaves(node.left,  tiles, rng);
    connectAllLeaves(node.right, tiles, rng);
    connectRooms(node.left, node.right, tiles, rng);
}

// ============================================================
//  Main export
// ============================================================

export function generateDungeon(seed, level = 1) {
    const rng   = new RNG(seed ^ (level * 9973));
    const tiles = new Uint8Array(DUNGEON_WIDTH * DUNGEON_HEIGHT).fill(TILE.CAVE_WALL);
    const rooms = [];

    // BSP depth scales with level
    const depth = Math.min(3 + Math.floor(level / 3), 6);

    const root = new BSPNode(0, 0, DUNGEON_WIDTH, DUNGEON_HEIGHT);
    bspSplit(root, rng, depth);
    carveRooms(root, rng, tiles, rooms);
    connectAllLeaves(root, tiles, rng);

    if (rooms.length === 0) {
        // Fallback: create one room
        const r = { x: 5, y: 5, w: 10, h: 10 };
        rooms.push(r);
        for (let row = r.y; row < r.y + r.h; row++) {
            for (let col = r.x; col < r.x + r.w; col++) {
                tiles[row * DUNGEON_WIDTH + col] = TILE.CAVE_FLOOR;
            }
        }
    }

    // Sort rooms top to bottom
    rooms.sort((a, b) => a.y - b.y);

    // Entrance in topmost room center
    const entranceRoom = rooms[0];
    const entrance = getRoomCenter(entranceRoom);
    tiles[entrance.y * DUNGEON_WIDTH + entrance.x] = TILE.CAVE_ENTRANCE;

    // Exits in bottom rooms
    const exits = [];
    const exitRoom = rooms[rooms.length - 1];
    const exitPt = getRoomCenter(exitRoom);
    // Mark exit as cave entrance tile (portal out)
    tiles[exitPt.y * DUNGEON_WIDTH + exitPt.x] = TILE.CAVE_ENTRANCE;
    exits.push(exitPt);

    // Chests in dead-end rooms (rooms with only 1 corridor connection, typically smaller ones)
    // Place chests in middle-index rooms away from entrance/exit
    const chestRooms = rooms.slice(1, -1);
    for (const room of chestRooms) {
        if (room.w * room.h < 30 && rng.float() < 0.4 + level * 0.02) {
            // Dead-end candidate — place chest
            const cx = room.x + Math.floor(room.w / 2);
            const cy = room.y + Math.floor(room.h / 2);
            tiles[cy * DUNGEON_WIDTH + cx] = TILE.CHEST;
        }
    }

    // Enemy spawn points: determined per room, returned in metadata
    const enemySpawns = [];
    const spawnsPerRoom = 1 + Math.floor(level / 4);
    for (const room of rooms) {
        if (room === entranceRoom) continue;
        for (let i = 0; i < spawnsPerRoom; i++) {
            if (rng.float() < 0.4 + level * 0.03) {
                enemySpawns.push({
                    x: room.x + rng.int(1, room.w - 1),
                    y: room.y + rng.int(1, room.h - 1),
                    level
                });
            }
        }
    }

    return { tiles, rooms, entrance, exits, enemySpawns };
}

export function getDungeonTile(tiles, x, y) {
    if (x < 0 || x >= DUNGEON_WIDTH || y < 0 || y >= DUNGEON_HEIGHT) return TILE.CAVE_WALL;
    return tiles[y * DUNGEON_WIDTH + x];
}

export function getDungeonSize() {
    return { width: DUNGEON_WIDTH, height: DUNGEON_HEIGHT };
}
