// WorldGen.js — Procedural world generation with inline 2D simplex noise

import { TILE, BIOME, BIOME_DATA, determineBiome } from './Biomes.js';

// ============================================================
//  Inline 2D Simplex Noise
// ============================================================

class SimplexNoise {
    constructor(seed = 42) {
        this.perm = new Uint8Array(512);
        this.gradP = new Array(512);

        const grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];

        // Build permutation table from seed via LCG
        let s = seed >>> 0;
        const lcg = () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s; };

        const p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = lcg() % (i + 1);
            const t = p[i]; p[i] = p[j]; p[j] = t;
        }

        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255];
            this.gradP[i] = grad3[this.perm[i] % 12];
        }
    }

    dot2(g, x, y) {
        return g[0] * x + g[1] * y;
    }

    noise2D(xin, yin) {
        const F2 = 0.5 * (Math.sqrt(3) - 1);
        const G2 = (3 - Math.sqrt(3)) / 6;

        const s = (xin + yin) * F2;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const t = (i + j) * G2;

        const x0 = xin - (i - t);
        const y0 = yin - (j - t);

        let i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; }
        else          { i1 = 0; j1 = 1; }

        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2;
        const y2 = y0 - 1 + 2 * G2;

        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this.gradP[ii +        this.perm[jj       ]];
        const gi1 = this.gradP[ii + i1   + this.perm[jj + j1  ]];
        const gi2 = this.gradP[ii + 1    + this.perm[jj + 1   ]];

        let n0, n1, n2;

        let t0 = 0.5 - x0*x0 - y0*y0;
        if (t0 < 0) { n0 = 0; } else { t0 *= t0; n0 = t0 * t0 * this.dot2(gi0, x0, y0); }

        let t1 = 0.5 - x1*x1 - y1*y1;
        if (t1 < 0) { n1 = 0; } else { t1 *= t1; n1 = t1 * t1 * this.dot2(gi1, x1, y1); }

        let t2 = 0.5 - x2*x2 - y2*y2;
        if (t2 < 0) { n2 = 0; } else { t2 *= t2; n2 = t2 * t2 * this.dot2(gi2, x2, y2); }

        // Scale to -1..1
        return 70 * (n0 + n1 + n2);
    }

    // Fractional Brownian Motion — layered octaves
    fbm(x, y, octaves = 4, lacunarity = 2.0, gain = 0.5) {
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;
        for (let o = 0; o < octaves; o++) {
            value += this.noise2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= gain;
            frequency *= lacunarity;
        }
        return value / maxValue; // normalised -1..1
    }
}

// ============================================================
//  World constants
// ============================================================

const WORLD_WIDTH  = 200;
const WORLD_HEIGHT = 200;

export const WORLD_SIZE = { width: WORLD_WIDTH, height: WORLD_HEIGHT };

export const WORLD_LOCATIONS = {
    greyhollow:               { x: 100, y: 102, name: 'Greyhollow',                  type: 'town',    size: 8  },
    thornmere:                { x:  60, y:  80, name: 'Thornmere',                    type: 'city',    size: 12 },
    emberpeak:                { x: 160, y: 140, name: 'Emberpeak Caldera',            type: 'city',    size: 10 },
    aetherwood:               { x:  30, y:  50, name: 'Aetherwood',                   type: 'area',    size: 20 },
    underlurk_entrance:       { x: 120, y: 160, name: 'Underlurk Entrance',           type: 'special', size:  3 },
    rootwarden_sanctuary:     { x:  80, y:  90, name: 'Rootwarden Sanctuary',         type: 'special', size:  5 },
    iron_compact_hq:          { x: 140, y:  60, name: 'Iron Compact HQ',              type: 'town',    size:  8 },
    grey_penitents_monastery: { x:  40, y: 130, name: 'Grey Penitents Monastery',     type: 'special', size:  6 }
};

export const ROOTSTONE_POSITIONS = [
    { x: 100, y:  95, name: 'Thornpillar',     health: 0.65, id: 'thornpillar' },
    { x:  25, y:  45, name: 'Aetherveil',       health: 1.0,  id: 'aetherveil'  },
    { x: 165, y: 145, name: 'Emberheart',        health: 0.9,  id: 'emberheart'  },
    { x:  55, y: 160, name: 'Mossanchor',        health: 0.85, id: 'mossanchor'  },
    { x: 140, y:  30, name: 'Crystalline Peak',  health: 0.95, id: 'crystalpeak' },
    { x:  80, y: 175, name: 'Deeproot',          health: 0.7,  id: 'deeproot'    },
    { x:  10, y: 100, name: 'Ashveil Stone',     health: 0.3,  id: 'ashveil'     }
];

// Dungeon cave entrances (12 total)
const DUNGEON_POSITIONS = [
    { x: 120, y: 160 }, { x:  35, y:  90 }, { x: 170, y:  45 },
    { x:  70, y: 145 }, { x: 150, y: 110 }, { x:  20, y: 165 },
    { x:  90, y:  35 }, { x: 180, y: 175 }, { x:  55, y:  60 },
    { x: 130, y:  85 }, { x:  10, y:  30 }, { x: 175, y: 130 }
];

// Numeric biome IDs (stored in biomeMap Uint8Array)
const BIOME_ID = {
    WATER:       0,
    COASTAL:     1,
    GRASSLAND:   2,
    FOREST:      3,
    DARK_FOREST: 4,
    SWAMP:       5,
    DESERT:      6,
    TUNDRA:      7,
    MOUNTAIN:    8,
    VOLCANIC:    9,
    UNDERLURK:   10
};

// ============================================================
//  Main generation function
// ============================================================

export function generateWorld(seed = 12345) {
    const tiles   = new Uint8Array(WORLD_WIDTH * WORLD_HEIGHT);
    const biomeMap = new Uint8Array(WORLD_WIDTH * WORLD_HEIGHT);

    // --- Noise generators (different seeds for variety) ---
    const heightNoise  = new SimplexNoise(seed);
    const moistNoise   = new SimplexNoise(seed + 137);
    const tempNoise    = new SimplexNoise(seed + 271);
    const detailNoise  = new SimplexNoise(seed + 503);

    // --- Pass 1: Generate noise maps and assign biomes + base tiles ---
    const heightMap = new Float32Array(WORLD_WIDTH * WORLD_HEIGHT);
    const moistMap  = new Float32Array(WORLD_WIDTH * WORLD_HEIGHT);
    const tempMap   = new Float32Array(WORLD_WIDTH * WORLD_HEIGHT);

    // Collect raw values first for normalisation
    let hMin = Infinity, hMax = -Infinity;
    let mMin = Infinity, mMax = -Infinity;
    let tMin = Infinity, tMax = -Infinity;

    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            const nx = x / WORLD_WIDTH;
            const ny = y / WORLD_HEIGHT;

            // Use different scales per map
            const h = heightNoise.fbm(nx * 3.5, ny * 3.5, 5, 2.0, 0.5)
                    + 0.4 * heightNoise.fbm(nx * 7, ny * 7, 2, 2.0, 0.5);
            const m = moistNoise.fbm(nx * 2.8, ny * 2.8, 4, 2.0, 0.5);
            const t = tempNoise.fbm(nx * 2.2, ny * 2.2, 3, 2.0, 0.5)
                    - 0.4 * ny; // cooler at top (north)

            const idx = y * WORLD_WIDTH + x;
            heightMap[idx] = h;
            moistMap[idx]  = m;
            tempMap[idx]   = t;

            if (h < hMin) hMin = h; if (h > hMax) hMax = h;
            if (m < mMin) mMin = m; if (m > mMax) mMax = m;
            if (t < tMin) tMin = t; if (t > tMax) tMax = t;
        }
    }

    const hRange = hMax - hMin || 1;
    const mRange = mMax - mMin || 1;
    const tRange = tMax - tMin || 1;

    // Island mask: fade to ocean at edges
    const CX = WORLD_WIDTH  / 2;
    const CY = WORLD_HEIGHT / 2;
    const maxDist = Math.min(CX, CY) * 0.85;

    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            const idx = y * WORLD_WIDTH + x;

            // Normalise to 0..1
            let h = (heightMap[idx] - hMin) / hRange;
            let m = (moistMap[idx]  - mMin) / mRange;
            let t = (tempMap[idx]   - tMin) / tRange;

            // Island mask: lower height toward world edges
            const dx = (x - CX) / CX;
            const dy = (y - CY) / CY;
            const distNorm = Math.sqrt(dx*dx + dy*dy);
            const mask = 1 - Math.pow(Math.max(0, distNorm - 0.15) / 0.85, 2);
            h = h * 0.7 + mask * 0.3;
            h = Math.max(0, Math.min(1, h));

            const biomeName = determineBiome(h, m, t);
            const biomeData = BIOME_DATA[biomeName];

            biomeMap[idx] = BIOME_ID[biomeName] ?? 2;

            // Pick tile based on biome + detail noise
            const detail = (detailNoise.noise2D(x * 0.3, y * 0.3) + 1) / 2;
            let tileId = biomeData.primaryTile;

            if (detail > 0.65) tileId = biomeData.secondaryTile || biomeData.primaryTile;

            // Feature tiles
            if (biomeData.featureTiles.length > 0 && detail > (1 - biomeData.featureChance)) {
                const fIdx = Math.floor(detail * biomeData.featureTiles.length) % biomeData.featureTiles.length;
                tileId = biomeData.featureTiles[fIdx];
            }

            tiles[idx] = tileId;
        }
    }

    // --- Pass 2: Place settlements ---
    for (const [locationId, loc] of Object.entries(WORLD_LOCATIONS)) {
        placeSettlement(tiles, loc, locationId);
    }

    // --- Pass 3: Place Rootstones ---
    for (const rs of ROOTSTONE_POSITIONS) {
        const idx = rs.y * WORLD_WIDTH + rs.x;
        tiles[idx] = TILE.ROOTSTONE;
        // Clear 1-tile radius so the rootstone is accessible
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = rs.x + dx;
                const ny = rs.y + dy;
                if (nx >= 0 && nx < WORLD_WIDTH && ny >= 0 && ny < WORLD_HEIGHT) {
                    const ni = ny * WORLD_WIDTH + nx;
                    if (tiles[ni] === TILE.MOUNTAIN || tiles[ni] === TILE.MOUNTAIN_TOP ||
                        tiles[ni] === TILE.CAVE_WALL || tiles[ni] === TILE.STONE_WALL) {
                        tiles[ni] = TILE.GRASS;
                    }
                }
            }
        }
    }

    // --- Pass 4: Place dungeon cave entrances ---
    for (const pos of DUNGEON_POSITIONS) {
        const idx = pos.y * WORLD_WIDTH + pos.x;
        tiles[idx] = TILE.CAVE_ENTRANCE;
        // Ensure surrounded by passable ground
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = pos.x + dx;
                const ny = pos.y + dy;
                if (nx >= 0 && nx < WORLD_WIDTH && ny >= 0 && ny < WORLD_HEIGHT) {
                    const ni = ny * WORLD_WIDTH + nx;
                    const t = tiles[ni];
                    if (t === TILE.MOUNTAIN || t === TILE.MOUNTAIN_TOP ||
                        t === TILE.WATER || t === TILE.CAVE_WALL) {
                        tiles[ni] = TILE.DIRT;
                    }
                }
            }
        }
    }

    // Build metadata
    const metadata = {
        towns: Object.entries(WORLD_LOCATIONS)
            .filter(([, l]) => l.type === 'town' || l.type === 'city')
            .map(([id, l]) => ({ ...l, id })),
        dungeons: DUNGEON_POSITIONS.map((p, i) => ({ ...p, id: `dungeon_${i}` })),
        rootstones: ROOTSTONE_POSITIONS.map(r => ({ ...r })),
        locations: WORLD_LOCATIONS
    };

    return { tiles, biomeMap, metadata };
}

// ============================================================
//  Settlement placement helper
// ============================================================

function placeSettlement(tiles, loc, locationId) {
    const { x, y, size, type } = loc;
    const half = Math.floor(size / 2);

    for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
            const tx = x + dx;
            const ty = y + dy;
            if (tx < 0 || tx >= WORLD_WIDTH || ty < 0 || ty >= WORLD_HEIGHT) continue;
            const idx = ty * WORLD_WIDTH + tx;
            const adx = Math.abs(dx);
            const ady = Math.abs(dy);

            // Outer wall ring
            if (adx === half || ady === half) {
                // Gates in the cardinal directions
                if ((adx === half && ady <= 1) || (ady === half && adx <= 1)) {
                    tiles[idx] = TILE.ROAD; // gate opening
                } else {
                    tiles[idx] = TILE.STONE_WALL;
                }
            } else if (adx === 0 && ady === 0) {
                // Central landmark
                if (locationId === 'underlurk_entrance') {
                    tiles[idx] = TILE.CAVE_ENTRANCE;
                } else {
                    tiles[idx] = TILE.STONE_FLOOR;
                }
            } else {
                // Interior: roads + stone floors
                if (dx === 0 || dy === 0) {
                    tiles[idx] = TILE.ROAD;
                } else if ((adx + ady) % 4 === 0) {
                    tiles[idx] = TILE.STONE_WALL; // building walls
                } else {
                    tiles[idx] = TILE.STONE_FLOOR;
                }
            }
        }
    }
}

// ============================================================
//  Utility exports
// ============================================================

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
