// WorldGen.js — Story-driven world generation for Aethermoor
// The world is hand-crafted to match the narrative geography of Varethos:
// Greyhollow (player start) at center-west, with distinct zones radiating out
// toward Thornmere (NE), Grey Penitents Monastery (N), Aetherwood (E),
// Iron Compact HQ (W), Southern Swamps, and Emberpeak Caldera (SE).

import { TILE, BIOME_DATA } from './Biomes.js';

// ── Inline 2D Simplex Noise (seeded) ────────────────────────────────────────
class SimplexNoise {
    constructor(seed = 42) {
        this.perm  = new Uint8Array(512);
        this.gradP = new Array(512);
        const grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
        let s = seed >>> 0;
        const lcg = () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s; };
        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        for (let i = 255; i > 0; i--) { const j = lcg() % (i+1); const t = p[i]; p[i] = p[j]; p[j] = t; }
        for (let i = 0; i < 512; i++) { this.perm[i] = p[i&255]; this.gradP[i] = grad3[this.perm[i]%12]; }
    }
    dot2(g, x, y) { return g[0]*x + g[1]*y; }
    noise2D(xin, yin) {
        const F2 = 0.5*(Math.sqrt(3)-1), G2 = (3-Math.sqrt(3))/6;
        const s = (xin+yin)*F2;
        const i = Math.floor(xin+s), j = Math.floor(yin+s);
        const t = (i+j)*G2;
        const x0 = xin-(i-t), y0 = yin-(j-t);
        let i1, j1;
        if (x0 > y0) { i1=1; j1=0; } else { i1=0; j1=1; }
        const x1=x0-i1+G2, y1=y0-j1+G2, x2=x0-1+2*G2, y2=y0-1+2*G2;
        const ii=i&255, jj=j&255;
        const gi0=this.gradP[ii+this.perm[jj]], gi1=this.gradP[ii+i1+this.perm[jj+j1]], gi2=this.gradP[ii+1+this.perm[jj+1]];
        let n0,n1,n2;
        let t0=0.5-x0*x0-y0*y0; if(t0<0){n0=0;}else{t0*=t0;n0=t0*t0*this.dot2(gi0,x0,y0);}
        let t1=0.5-x1*x1-y1*y1; if(t1<0){n1=0;}else{t1*=t1;n1=t1*t1*this.dot2(gi1,x1,y1);}
        let t2=0.5-x2*x2-y2*y2; if(t2<0){n2=0;}else{t2*=t2;n2=t2*t2*this.dot2(gi2,x2,y2);}
        return 70*(n0+n1+n2);
    }
}

// ── World constants ──────────────────────────────────────────────────────────
const WORLD_WIDTH  = 200;
const WORLD_HEIGHT = 200;
export const WORLD_SIZE = { width: WORLD_WIDTH, height: WORLD_HEIGHT };

// ── Story-based world locations ──────────────────────────────────────────────
// Coordinates reflect narrative geography; NPC spawn tiles in npcs.js align.
export const WORLD_LOCATIONS = {
    greyhollow:               { x:  82, y:  98, name: 'Greyhollow',               type: 'town',    size: 22 },
    thornmere:                { x: 142, y:  52, name: 'Thornmere',                type: 'city',    size: 30 },
    grey_penitents_monastery: { x:  78, y:  32, name: 'Grey Penitents Monastery', type: 'special', size: 16 },
    iron_compact_hq:          { x:  30, y:  68, name: 'Iron Compact HQ',          type: 'town',    size: 22 },
    rootwarden_sanctuary:     { x: 165, y:  85, name: 'Rootwarden Sanctuary',     type: 'special', size: 16 },
    emberpeak:                { x: 158, y: 168, name: 'Emberpeak Caldera',        type: 'city',    size: 24 },
    underlurk_entrance:       { x:  88, y: 148, name: 'Underlurk Entrance',       type: 'special', size:  7 },
    abandoned_farmstead:      { x: 102, y: 115, name: 'Abandoned Farmstead',      type: 'special', size:  8 },
};

// Rootstones: world-pillar crystals that keep the Shards of Varethos aloft.
export const ROOTSTONE_POSITIONS = [
    { x:  82, y:  82, name: 'Thornpillar',      health: 0.65, id: 'thornpillar'  },
    { x: 165, y:  78, name: 'Aetherveil',       health: 1.00, id: 'aetherveil'   },
    { x: 162, y: 148, name: 'Emberheart',       health: 0.90, id: 'emberheart'   },
    { x:  48, y: 155, name: 'Mossanchor',       health: 0.85, id: 'mossanchor'   },
    { x: 140, y:  20, name: 'Crystalline Peak', health: 0.95, id: 'crystalpeak'  },
    { x:  75, y: 175, name: 'Deeproot',         health: 0.70, id: 'deeproot'     },
    { x:   8, y:  98, name: 'Ashveil Stone',    health: 0.30, id: 'ashveil'      },
];

// Monitoring stations — Act 1 quest target locations.
const MONITORING_STATIONS = [
    { x: 88, y: 75, id: 'station_verath', name: 'Station Verath (north foothills)' },
    { x: 80, y: 70, id: 'station_ossian', name: 'Station Ossian (Thornpillar base)' },
    { x:108, y: 88, id: 'station_keld',   name: 'Station Keld (eastern ridge)'      },
];

// Dungeon / cave entrances spread across the world.
const DUNGEON_POSITIONS = [
    { x:  88, y: 148, id: 'underlurk_mine'  },
    { x:  28, y:  52, id: 'northern_ruins'  },
    { x: 168, y:  50, id: 'eastern_cave'    },
    { x:  52, y: 125, id: 'swamp_dungeon'   },
    { x: 148, y: 130, id: 'aetherwood_cave' },
    { x: 178, y: 178, id: 'volcanic_cave'   },
    { x:  12, y: 148, id: 'western_cave'    },
    { x: 122, y:  68, id: 'hillside_cave'   },
];

const BIOME_ID = {
    WATER: 0, COASTAL: 1, GRASSLAND: 2, FOREST: 3, DARK_FOREST: 4,
    SWAMP: 5, DESERT: 6, TUNDRA: 7, MOUNTAIN: 8, VOLCANIC: 9, UNDERLURK: 10
};

// ── Zone definitions (elliptical Voronoi — nearest zone wins) ────────────────
// cx/cy = zone center, rx/ry = radii (normalize distance for ellipse comparison).
const ZONES = [
    // Northern tundra band
    { biome: 'TUNDRA',      cx: 100, cy:  16, rx: 110, ry: 18 },
    // Grey Penitents highlands (cold hills NW-center)
    { biome: 'TUNDRA',      cx:  78, cy:  36, rx:  32, ry: 22 },
    // Thornmere plateau (NE, open grassland)
    { biome: 'GRASSLAND',   cx: 142, cy:  52, rx:  45, ry: 35 },
    // Iron Compact territory (W, arid badlands)
    { biome: 'DESERT',      cx:  28, cy:  72, rx:  30, ry: 28 },
    // Greyhollow valley (center-left, gentle farmland)
    { biome: 'GRASSLAND',   cx:  82, cy:  98, rx:  42, ry: 38 },
    // Aetherwood fringe (E, lighter forest transition)
    { biome: 'FOREST',      cx: 150, cy:  88, rx:  22, ry: 32 },
    // Aetherwood core (deep magical forest)
    { biome: 'DARK_FOREST', cx: 172, cy:  92, rx:  30, ry: 52 },
    // Southern swamps (S-center)
    { biome: 'SWAMP',       cx:  58, cy: 150, rx:  42, ry: 30 },
    // Underlurk approach
    { biome: 'SWAMP',       cx:  90, cy: 148, rx:  20, ry: 18 },
    // Emberpeak volcanic (far SE)
    { biome: 'VOLCANIC',    cx: 162, cy: 172, rx:  42, ry: 34 },
    // Global fallback
    { biome: 'GRASSLAND',   cx: 100, cy: 100, rx: 200, ry: 200 },
];

// Road connections between settlements (drawn before placements so walls overwrite).
const ROADS = [
    { from: [ 82,  98], to: [ 78,  32] }, // Greyhollow → Monastery
    { from: [ 82,  98], to: [142,  52] }, // Greyhollow → Thornmere
    { from: [ 82,  98], to: [ 30,  68] }, // Greyhollow → Iron Compact HQ
    { from: [ 82,  98], to: [ 88, 148] }, // Greyhollow → Underlurk
    { from: [142,  52], to: [158, 168] }, // Thornmere → Emberpeak
    { from: [ 82,  98], to: [148,  82] }, // Greyhollow → Aetherwood edge
    { from: [148,  82], to: [165,  85] }, // Aetherwood edge → Rootwarden Sanctuary
];

// ── Biome assignment ─────────────────────────────────────────────────────────

function getZoneBiome(x, y) {
    if (x < 6 || x >= WORLD_WIDTH - 6 || y < 6 || y >= WORLD_HEIGHT - 6) return 'MOUNTAIN';
    let minD2 = Infinity, winner = 'GRASSLAND';
    for (const z of ZONES) {
        const dx = (x - z.cx) / z.rx;
        const dy = (y - z.cy) / z.ry;
        const d2 = dx*dx + dy*dy;
        if (d2 < minD2) { minD2 = d2; winner = z.biome; }
    }
    return winner;
}

// ── Main generation function ─────────────────────────────────────────────────

export function generateWorld(seed = 12345) {
    const tiles    = new Uint8Array(WORLD_WIDTH * WORLD_HEIGHT);
    const biomeMap = new Uint8Array(WORLD_WIDTH * WORLD_HEIGHT);
    const detNoise = new SimplexNoise(seed + 137);
    const featNoise = new SimplexNoise(seed + 503);

    // Pass 1: Zone-based biome with micro-noise texture
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            const idx    = y * WORLD_WIDTH + x;
            const biome  = getZoneBiome(x, y);
            biomeMap[idx] = BIOME_ID[biome] ?? 2;
            const bd = BIOME_DATA[biome];
            const detail = (detNoise.noise2D(x * 0.18, y * 0.18) + 1) / 2;
            const feat   = (featNoise.noise2D(x * 0.42, y * 0.42) + 1) / 2;
            let tileId = bd.primaryTile;
            if (detail > 0.62) tileId = bd.secondaryTile || tileId;
            if (bd.featureTiles.length > 0 && feat > (1 - bd.featureChance * 2.5)) {
                tileId = bd.featureTiles[Math.floor(feat * bd.featureTiles.length) % bd.featureTiles.length];
            }
            tiles[idx] = tileId;
        }
    }

    // Pass 2: Roads (before settlements so walls correctly overwrite road tiles)
    for (const road of ROADS) drawLine(tiles, road.from[0], road.from[1], road.to[0], road.to[1]);

    // Pass 3: Settlements
    for (const [id, loc] of Object.entries(WORLD_LOCATIONS)) {
        if (loc.size > 0) placeSettlement(tiles, loc, id);
    }

    // Pass 4: Monitoring stations (small stone huts in the wilderness)
    for (const st of MONITORING_STATIONS) placeStation(tiles, st.x, st.y);

    // Pass 5: Rootstones (clear impassable terrain around each)
    for (const rs of ROOTSTONE_POSITIONS) {
        tiles[rs.y * WORLD_WIDTH + rs.x] = TILE.ROOTSTONE;
        clearRing(tiles, rs.x, rs.y, 1, TILE.GRASS);
    }

    // Pass 6: Dungeon entrances
    for (const pos of DUNGEON_POSITIONS) {
        tiles[pos.y * WORLD_WIDTH + pos.x] = TILE.CAVE_ENTRANCE;
        clearRing(tiles, pos.x, pos.y, 1, TILE.DIRT);
    }

    // Shape the campaign spaces as real, traversable regions rather than isolated markers.
    placeStoryRegions(tiles);

    // Keep story-critical NPC positions and their immediate approach walkable.
    const civicPoints = [
        [85,80], [165,85], [143,50], [30,68], [78,32],
        [85,102], [83,100], [82,94], [75,104], [138,53],
        [108,80], [88,150], [148,82], [102,115], [76,33]
    ];
    for (const [x, y] of civicPoints) clearRing(tiles, x, y, 1, TILE.STONE_FLOOR);
    for (const [x, y] of civicPoints) tiles[y * WORLD_WIDTH + x] = TILE.STONE_FLOOR;

    const metadata = {
        towns:     Object.entries(WORLD_LOCATIONS)
                       .filter(([, l]) => l.type === 'town' || l.type === 'city')
                       .map(([id, l]) => ({ ...l, id })),
        dungeons:  DUNGEON_POSITIONS.map(p => ({ ...p })),
        rootstones: ROOTSTONE_POSITIONS.map(r => ({ ...r })),
        locations: WORLD_LOCATIONS,
        monitoringStations: MONITORING_STATIONS,
    };

    return { tiles, biomeMap, metadata };
}

// ── Settlement placement ─────────────────────────────────────────────────────

function placeSettlement(tiles, loc, locationId) {
    const { x, y, size } = loc;
    const half = Math.floor(size / 2);

    if (locationId === 'rootwarden_sanctuary') { placeSanctuary(tiles, x, y, half); return; }
    if (locationId === 'abandoned_farmstead')  { placeFarmstead(tiles, x, y, half); return; }
    if (locationId === 'underlurk_entrance')   { placeUnderlurk(tiles, x, y, half); return; }

    // General walled settlement with broad avenues, districts and enterable buildings.
    for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
            const tx = x + dx, ty = y + dy;
            if (tx < 0 || tx >= WORLD_WIDTH || ty < 0 || ty >= WORLD_HEIGHT) continue;
            const idx = ty * WORLD_WIDTH + tx;
            const adx = Math.abs(dx), ady = Math.abs(dy);

            // Outer perimeter wall (with gates)
            if (adx === half || ady === half) {
                tiles[idx] = isGate(dx, dy, half, locationId) ? TILE.ROAD : TILE.STONE_WALL;
                continue;
            }

            // Main cross-roads are three tiles wide in larger settlements.
            const avenue = size >= 20 ? 1 : 0;
            tiles[idx] = (adx <= avenue || ady <= avenue) ? TILE.ROAD : TILE.STONE_FLOOR;
        }
    }

    // Larger settlements get a navigable inner ring road.
    if (size >= 16) {
        const ring = Math.max(4, half - 4);
        for (let dz = -ring; dz <= ring; dz++) {
            const tx1 = x + dz, ty1 = y + ring;
            const tx2 = x + dz, ty2 = y - ring;
            const tx3 = x + ring, ty3 = y + dz;
            const tx4 = x - ring, ty4 = y + dz;
            for (const [tx, ty] of [[tx1,ty1],[tx2,ty2],[tx3,ty3],[tx4,ty4]]) {
                if (tx >= 0 && tx < WORLD_WIDTH && ty >= 0 && ty < WORLD_HEIGHT) {
                    tiles[ty * WORLD_WIDTH + tx] = TILE.ROAD;
                }
            }
        }
    }

    // Stamp many small buildings between the roads. Every building has a real door.
    const stride = size >= 26 ? 6 : 7;
    for (let by = -half + 2; by <= half - 5; by += stride) {
        for (let bx = -half + 2; bx <= half - 5; bx += stride) {
            const cx = bx + 2;
            const cy = by + 2;
            const avenue = size >= 20 ? 2 : 1;
            if (Math.abs(cx) <= avenue || Math.abs(cy) <= avenue) continue;
            if (size >= 16) {
                const ring = Math.max(4, half - 4);
                if (Math.abs(Math.abs(cx) - ring) <= 2 || Math.abs(Math.abs(cy) - ring) <= 2) continue;
            }
            placeBuilding(tiles, x + bx, y + by, 5, 5, cx, cy);
        }
    }

    // Place extra outer features around specific settlements
    placeOuterFeatures(tiles, x, y, half, locationId);

    // Central landmark tile
    if (y >= 0 && y < WORLD_HEIGHT && x >= 0 && x < WORLD_WIDTH) {
        tiles[y * WORLD_WIDTH + x] = centralLandmark(locationId);
    }
}

function placeStoryRegions(tiles) {
    // Underlurk: a broad carved cavern with two surface connections.
    for (let y = 146; y <= 164; y++) {
        for (let x = 86; x <= 104; x++) {
            const edge = x === 86 || x === 104 || y === 146 || y === 164;
            tiles[y * WORLD_WIDTH + x] = edge ? TILE.CAVE_WALL : TILE.CAVE_FLOOR;
        }
    }
    for (const [x, y] of [[88,146], [88,148], [104,160]]) {
        tiles[y * WORLD_WIDTH + x] = TILE.CAVE_ENTRANCE;
    }
    drawLine(tiles, 88, 148, 100, 160);

    // Deep Aetherwood trail and Heart Grove.
    drawLine(tiles, 165, 85, 180, 100);
    for (const [cx, cy, radius, fill] of [
        [174,92,3,TILE.DARK_FOREST], [180,100,4,TILE.GRASS],
        [173,103,3,TILE.GRASS], [102,115,3,TILE.DIRT],
        [82,82,3,TILE.DIRT], [84,84,2,TILE.DIRT]
    ]) {
        clearArea(tiles, cx, cy, radius, fill);
    }
    tiles[82 * WORLD_WIDTH + 82] = TILE.ROOTSTONE;
    // Connect Aetherwood void anchor (173,103) to the trail — the surrounding
    // dark forest has 35% tree density which creates impassable pockets.
    drawLine(tiles, 173, 93, 173, 103);

    // Emberpeak pilgrimage path: volcanic ground remains dramatic but walkable.
    drawLine(tiles, 158, 168, 158, 178);
    clearArea(tiles, 158, 173, 6, TILE.VOLCANIC);
    tiles[173 * WORLD_WIDTH + 156] = TILE.LAVA;
    tiles[175 * WORLD_WIDTH + 161] = TILE.LAVA;
}

function clearArea(tiles, cx, cy, radius, fill) {
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            if (dx * dx + dy * dy > radius * radius) continue;
            const x = cx + dx, y = cy + dy;
            if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT) continue;
            tiles[y * WORLD_WIDTH + x] = fill;
        }
    }
}

function placeBuilding(tiles, left, top, width, height, relCenterX, relCenterY) {
    const doorOnVerticalSide = Math.abs(relCenterX) > Math.abs(relCenterY);
    const doorX = doorOnVerticalSide ? (relCenterX > 0 ? left : left + width - 1) : left + Math.floor(width / 2);
    const doorY = doorOnVerticalSide ? top + Math.floor(height / 2) : (relCenterY > 0 ? top : top + height - 1);

    for (let y = top; y < top + height; y++) {
        for (let x = left; x < left + width; x++) {
            if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT) continue;
            const edge = x === left || x === left + width - 1 || y === top || y === top + height - 1;
            tiles[y * WORLD_WIDTH + x] = edge ? TILE.STONE_WALL : TILE.STONE_FLOOR;
        }
    }
    if (doorX >= 0 && doorX < WORLD_WIDTH && doorY >= 0 && doorY < WORLD_HEIGHT) {
        tiles[doorY * WORLD_WIDTH + doorX] = TILE.ROAD;
    }
}

function isGate(dx, dy, half, locationId) {
    const adx = Math.abs(dx), ady = Math.abs(dy);
    const onNS = (ady === half && adx <= 1);
    const onEW = (adx === half && ady <= 1);
    if (locationId === 'grey_penitents_monastery') return dy === half && adx <= 1; // S gate only
    if (locationId === 'iron_compact_hq')          return onEW;                    // E and W only
    return onNS || onEW;
}

function centralLandmark(locationId) {
    if (locationId === 'grey_penitents_monastery') return TILE.ROOTSTONE;
    if (locationId === 'emberpeak')                return TILE.LAVA;
    return TILE.STONE_FLOOR;
}

function placeOuterFeatures(tiles, x, y, half, locationId) {
    if (locationId === 'greyhollow') {
        // Farm plots to the west of the town walls
        for (let fy = -3; fy <= 3; fy++) {
            for (let fx = half + 2; fx <= half + 6; fx++) {
                const tx = x - fx, ty = y + fy;
                if (tx < 0 || tx >= WORLD_WIDTH || ty < 0 || ty >= WORLD_HEIGHT) continue;
                tiles[ty * WORLD_WIDTH + tx] = (Math.abs(fy) === 3) ? TILE.DIRT : TILE.GRASS;
            }
        }
    }
    if (locationId === 'thornmere') {
        // Market square outside eastern gate
        for (let fy = -2; fy <= 2; fy++) {
            for (let fx = half + 1; fx <= half + 4; fx++) {
                const tx = x + fx, ty = y + fy;
                if (tx >= 0 && tx < WORLD_WIDTH && ty >= 0 && ty < WORLD_HEIGHT) {
                    tiles[ty * WORLD_WIDTH + tx] = TILE.STONE_FLOOR;
                }
            }
        }
    }
    if (locationId === 'grey_penitents_monastery') {
        // Graveyard / garden south of monastery
        for (let gy = half + 2; gy <= half + 5; gy++) {
            for (let gx = -3; gx <= 3; gx++) {
                const tx = x + gx, ty = y + gy;
                if (tx >= 0 && tx < WORLD_WIDTH && ty >= 0 && ty < WORLD_HEIGHT) {
                    tiles[ty * WORLD_WIDTH + tx] = (Math.abs(gx) % 2 === 0) ? TILE.STONE_FLOOR : TILE.GRASS;
                }
            }
        }
    }
}

function placeSanctuary(tiles, x, y, half) {
    // Organic circular clearing: rootstone altar, stone paths, surrounding forest
    for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
            const tx = x+dx, ty = y+dy;
            if (tx < 0 || tx >= WORLD_WIDTH || ty < 0 || ty >= WORLD_HEIGHT) continue;
            const r = Math.sqrt(dx*dx + dy*dy);
            const idx = ty * WORLD_WIDTH + tx;
            if (r === 0) {
                tiles[idx] = TILE.ROOTSTONE;
            } else if (r <= 2) {
                tiles[idx] = TILE.STONE_FLOOR;
            } else if (Math.abs(dx) <= 1 || Math.abs(dy) <= 1) {
                tiles[idx] = TILE.ROAD;
            } else if (r <= half) {
                tiles[idx] = TILE.FOREST;
            }
        }
    }
}

function placeFarmstead(tiles, x, y, half) {
    for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
            const tx = x+dx, ty = y+dy;
            if (tx < 0 || tx >= WORLD_WIDTH || ty < 0 || ty >= WORLD_HEIGHT) continue;
            const adx = Math.abs(dx), ady = Math.abs(dy);
            const onEdge = (adx === half || ady === half);
            tiles[ty * WORLD_WIDTH + tx] = onEdge ? TILE.DIRT : TILE.STONE_FLOOR;
        }
    }
    if (y >= 0 && y < WORLD_HEIGHT && x >= 0 && x < WORLD_WIDTH)
        tiles[y * WORLD_WIDTH + x] = TILE.CHEST;
}

function placeUnderlurk(tiles, x, y, half) {
    for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
            const tx = x+dx, ty = y+dy;
            if (tx < 0 || tx >= WORLD_WIDTH || ty < 0 || ty >= WORLD_HEIGHT) continue;
            tiles[ty * WORLD_WIDTH + tx] = TILE.DIRT;
        }
    }
    if (y >= 0 && y < WORLD_HEIGHT && x >= 0 && x < WORLD_WIDTH)
        tiles[y * WORLD_WIDTH + x] = TILE.CAVE_ENTRANCE;
}

function placeStation(tiles, x, y) {
    // 5×5 monitoring hut with an actual southern doorway and interior console.
    for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            const tx = x+dx, ty = y+dy;
            if (tx < 0 || tx >= WORLD_WIDTH || ty < 0 || ty >= WORLD_HEIGHT) continue;
            const onEdge = (Math.abs(dx) === 2 || Math.abs(dy) === 2);
            tiles[ty * WORLD_WIDTH + tx] = onEdge ? TILE.STONE_WALL : TILE.STONE_FLOOR;
        }
    }
    tiles[(y + 2) * WORLD_WIDTH + x] = TILE.ROAD;
    // Data crystal chest inside
    if (y >= 0 && y < WORLD_HEIGHT && x >= 0 && x < WORLD_WIDTH)
        tiles[y * WORLD_WIDTH + x] = TILE.CHEST;
}

function clearRing(tiles, x, y, radius, fill) {
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            if (dx === 0 && dy === 0) continue;
            const tx = x+dx, ty = y+dy;
            if (tx < 0 || tx >= WORLD_WIDTH || ty < 0 || ty >= WORLD_HEIGHT) continue;
            const t = tiles[ty * WORLD_WIDTH + tx];
            if (t === TILE.MOUNTAIN || t === TILE.MOUNTAIN_TOP ||
                t === TILE.CAVE_WALL || t === TILE.STONE_WALL) {
                tiles[ty * WORLD_WIDTH + tx] = fill;
            }
        }
    }
}

// Bresenham line — places ROAD tiles, does not overwrite walls or Rootstones.
function drawLine(tiles, x0, y0, x1, y1) {
    let dx = Math.abs(x1-x0), dy = Math.abs(y1-y0);
    let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy, cx = x0, cy = y0;
    while (true) {
        if (cx >= 0 && cx < WORLD_WIDTH && cy >= 0 && cy < WORLD_HEIGHT) {
            const t = tiles[cy * WORLD_WIDTH + cx];
            if (t !== TILE.STONE_WALL && t !== TILE.CAVE_ENTRANCE &&
                t !== TILE.ROOTSTONE  && t !== TILE.MOUNTAIN &&
                t !== TILE.MOUNTAIN_TOP) {
                tiles[cy * WORLD_WIDTH + cx] = TILE.ROAD;
            }
        }
        if (cx === x1 && cy === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; cx += sx; }
        if (e2 <  dx) { err += dx; cy += sy; }
    }
}

// ── Utility exports ──────────────────────────────────────────────────────────

export function getTile(tiles, x, y) {
    if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT) return TILE.MOUNTAIN;
    return tiles[y * WORLD_WIDTH + x];
}

export function isPassable(tileId) {
    const impassable = [
        TILE.WATER, TILE.SHALLOWS, TILE.MOUNTAIN, TILE.MOUNTAIN_TOP,
        TILE.CAVE_WALL, TILE.STONE_WALL, TILE.TREE
    ];
    return !impassable.includes(tileId);
}

export function getLocation(locationId) {
    return WORLD_LOCATIONS[locationId] || null;
}
