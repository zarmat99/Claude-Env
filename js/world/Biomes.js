// Biomes.js — Tile constants, biome definitions, and biome determination

export const TILE = {
    WATER: 0, SHALLOWS: 1, SAND: 2, GRASS: 3, DIRT: 4,
    FOREST: 5, DARK_FOREST: 6, SNOW: 7, TUNDRA: 8,
    MOUNTAIN: 9, MOUNTAIN_TOP: 10, VOLCANIC: 11, LAVA: 12,
    SWAMP: 13, DESERT: 14, CAVE_FLOOR: 15, CAVE_WALL: 16,
    CAVE_ENTRANCE: 17, ROOTSTONE: 18, STONE_FLOOR: 19,
    STONE_WALL: 20, ROAD: 21, CHEST: 22, TREE: 23, SHRUB: 24
};

export const BIOME = {
    WATER:       'WATER',
    COASTAL:     'COASTAL',
    GRASSLAND:   'GRASSLAND',
    FOREST:      'FOREST',
    DARK_FOREST: 'DARK_FOREST',
    SWAMP:       'SWAMP',
    DESERT:      'DESERT',
    TUNDRA:      'TUNDRA',
    MOUNTAIN:    'MOUNTAIN',
    VOLCANIC:    'VOLCANIC',
    UNDERLURK:   'UNDERLURK'
};

export const BIOME_DATA = {
    WATER: {
        primaryTile:   TILE.WATER,
        secondaryTile: TILE.SHALLOWS,
        featureTiles:  [],
        featureChance: 0,
        enemySpawns:   [],
        ambientMusic:  'water',
        minimapColor:  '#0a2a5a',
        spawnDensity:  0
    },

    COASTAL: {
        primaryTile:   TILE.SAND,
        secondaryTile: TILE.SHALLOWS,
        featureTiles:  [TILE.SHRUB],
        featureChance: 0.03,
        enemySpawns:   [
            { id: 'goblin',  weight: 20, minLevel: 1, maxLevel: 2 },
            { id: 'bandit',  weight: 15, minLevel: 1, maxLevel: 3 }
        ],
        ambientMusic:  'coastal',
        minimapColor:  '#c8b46a',
        spawnDensity:  0.01
    },

    GRASSLAND: {
        primaryTile:   TILE.GRASS,
        secondaryTile: TILE.DIRT,
        featureTiles:  [TILE.SHRUB, TILE.TREE],
        featureChance: 0.05,
        enemySpawns:   [
            { id: 'goblin',  weight: 30, minLevel: 1, maxLevel: 3 },
            { id: 'bandit',  weight: 20, minLevel: 2, maxLevel: 4 }
        ],
        ambientMusic:  'plains',
        minimapColor:  '#2d5a1b',
        spawnDensity:  0.02
    },

    FOREST: {
        primaryTile:   TILE.FOREST,
        secondaryTile: TILE.GRASS,
        featureTiles:  [TILE.TREE, TILE.SHRUB],
        featureChance: 0.25,
        enemySpawns:   [
            { id: 'goblin',      weight: 25, minLevel: 2, maxLevel: 5 },
            { id: 'cave_spider', weight: 20, minLevel: 2, maxLevel: 4 },
            { id: 'bandit',      weight: 15, minLevel: 3, maxLevel: 6 }
        ],
        ambientMusic:  'forest',
        minimapColor:  '#1a4a0a',
        spawnDensity:  0.025
    },

    DARK_FOREST: {
        primaryTile:   TILE.DARK_FOREST,
        secondaryTile: TILE.FOREST,
        featureTiles:  [TILE.TREE],
        featureChance: 0.35,
        enemySpawns:   [
            { id: 'wraith',          weight: 30, minLevel: 5, maxLevel: 10 },
            { id: 'cave_spider',     weight: 25, minLevel: 4, maxLevel:  8 },
            { id: 'void_hound',      weight: 20, minLevel: 6, maxLevel: 12 },
            { id: 'kultist_acolyte', weight: 15, minLevel: 5, maxLevel: 10 }
        ],
        ambientMusic:  'dark_forest',
        minimapColor:  '#0a2a04',
        spawnDensity:  0.04
    },

    SWAMP: {
        primaryTile:   TILE.SWAMP,
        secondaryTile: TILE.DIRT,
        featureTiles:  [TILE.SHRUB, TILE.TREE],
        featureChance: 0.1,
        enemySpawns:   [
            { id: 'swamp_crawler', weight: 35, minLevel: 3, maxLevel: 7 },
            { id: 'wraith',        weight: 20, minLevel: 4, maxLevel: 8 },
            { id: 'goblin',        weight: 15, minLevel: 2, maxLevel: 5 }
        ],
        ambientMusic:  'swamp',
        minimapColor:  '#2a4a1a',
        spawnDensity:  0.03
    },

    DESERT: {
        primaryTile:   TILE.DESERT,
        secondaryTile: TILE.SAND,
        featureTiles:  [TILE.SHRUB],
        featureChance: 0.02,
        enemySpawns:   [
            { id: 'bandit',        weight: 30, minLevel: 3, maxLevel: 7 },
            { id: 'swamp_crawler', weight: 20, minLevel: 3, maxLevel: 6 },
            { id: 'skeleton',      weight: 25, minLevel: 4, maxLevel: 8 }
        ],
        ambientMusic:  'desert',
        minimapColor:  '#c8a050',
        spawnDensity:  0.015
    },

    TUNDRA: {
        primaryTile:   TILE.TUNDRA,
        secondaryTile: TILE.SNOW,
        featureTiles:  [TILE.SHRUB],
        featureChance: 0.03,
        enemySpawns:   [
            { id: 'skeleton',   weight: 30, minLevel: 4, maxLevel:  8 },
            { id: 'void_hound', weight: 25, minLevel: 5, maxLevel: 10 },
            { id: 'wraith',     weight: 20, minLevel: 6, maxLevel: 11 }
        ],
        ambientMusic:  'tundra',
        minimapColor:  '#a8c0c0',
        spawnDensity:  0.02
    },

    MOUNTAIN: {
        primaryTile:   TILE.MOUNTAIN,
        secondaryTile: TILE.MOUNTAIN_TOP,
        featureTiles:  [],
        featureChance: 0,
        enemySpawns:   [
            { id: 'stone_golem', weight: 30, minLevel: 6, maxLevel: 12 },
            { id: 'bandit',      weight: 20, minLevel: 5, maxLevel: 10 }
        ],
        ambientMusic:  'mountain',
        minimapColor:  '#6a6a6a',
        spawnDensity:  0.01
    },

    VOLCANIC: {
        primaryTile:   TILE.VOLCANIC,
        secondaryTile: TILE.LAVA,
        featureTiles:  [TILE.LAVA],
        featureChance: 0.08,
        enemySpawns:   [
            { id: 'lava_salamander', weight: 35, minLevel: 7, maxLevel: 14 },
            { id: 'stone_golem',     weight: 25, minLevel: 8, maxLevel: 15 },
            { id: 'cult_zealot',     weight: 20, minLevel: 6, maxLevel: 12 }
        ],
        ambientMusic:  'volcanic',
        minimapColor:  '#8a2a0a',
        spawnDensity:  0.035
    },

    UNDERLURK: {
        primaryTile:   TILE.CAVE_FLOOR,
        secondaryTile: TILE.CAVE_WALL,
        featureTiles:  [TILE.CHEST],
        featureChance: 0.01,
        enemySpawns:   [
            { id: 'cave_spider',     weight: 30, minLevel:  5, maxLevel: 10 },
            { id: 'skeleton',        weight: 25, minLevel:  6, maxLevel: 12 },
            { id: 'kultist_acolyte', weight: 20, minLevel:  7, maxLevel: 13 },
            { id: 'void_hound',      weight: 15, minLevel:  8, maxLevel: 15 },
            { id: 'hollow_prophet_boss', weight: 5, minLevel: 12, maxLevel: 18 }
        ],
        ambientMusic:  'underlurk',
        minimapColor:  '#1a0a2a',
        spawnDensity:  0.05
    }
};

/**
 * Determine biome from procedural noise values.
 * @param {number} height      0..1  (0=deep water, 1=peak)
 * @param {number} moisture    0..1
 * @param {number} temperature 0..1  (0=cold, 1=hot)
 * @returns {string} BIOME key
 */
export function determineBiome(height, moisture, temperature) {
    // Water bodies
    if (height < 0.25) return BIOME.WATER;
    if (height < 0.32) return BIOME.COASTAL;

    // High elevation
    if (height > 0.80) {
        if (temperature > 0.7) return BIOME.VOLCANIC;
        return BIOME.MOUNTAIN;
    }

    // Mid-high elevation with cold
    if (height > 0.65) {
        if (temperature < 0.3) return BIOME.TUNDRA;
        if (temperature > 0.65) return BIOME.VOLCANIC;
        return BIOME.MOUNTAIN;
    }

    // Cold band (northern/high areas)
    if (temperature < 0.2) return BIOME.TUNDRA;

    // Hot band
    if (temperature > 0.75) {
        if (moisture < 0.4) return BIOME.DESERT;
        return BIOME.VOLCANIC;
    }

    // Warm+dry
    if (temperature > 0.55 && moisture < 0.3) return BIOME.DESERT;

    // Wet areas
    if (moisture > 0.75) {
        if (temperature < 0.45) return BIOME.SWAMP;
        return BIOME.DARK_FOREST;
    }

    if (moisture > 0.55) {
        return BIOME.FOREST;
    }

    if (moisture > 0.35) {
        return BIOME.GRASSLAND;
    }

    // Semi-dry
    if (temperature < 0.35) return BIOME.TUNDRA;

    return BIOME.GRASSLAND;
}
