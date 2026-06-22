// SaveSystem.js — localStorage save/load with full player state serialization
import EventBus from './EventBus.js';

const SAVE_KEY     = 'aethermoor_save';
const SAVE_VERSION = 1;
export const AUTOSAVE_INTERVAL = 300000; // 5 minutes in ms

// ─── Serialization ────────────────────────────────────────────────────────────

// Convert player's non-JSON-safe structures (Set, Map, Uint8Array) to plain objects
export function serializePlayer(player) {
    return {
        name:        player.name,
        race:        player.race,
        level:       player.level,
        xp:          player.xp,
        attributes:  { ...player.attributes },
        derived:     { ...player.derived },

        // Skills: plain object copy (already JSON-safe except perksUnlocked arrays — those are arrays, fine)
        skills: Object.fromEntries(
            Object.entries(player.skills).map(([id, data]) => [
                id,
                { xp: data.xp, level: data.level, perksUnlocked: [...data.perksUnlocked] }
            ])
        ),

        equipment: Object.fromEntries(
            Object.entries(player.equipment).map(([slot, item]) => [
                slot,
                item ? { ...item, stats: item.stats ? { ...item.stats } : null } : null
            ])
        ),

        worldX: player.worldX,
        worldY: player.worldY,

        // Set → Array
        flags: Array.from(player.flags),

        quests: {
            active:    Object.fromEntries(player.quests.active.entries()),  // Map → plain obj
            completed: Array.from(player.quests.completed),                 // Set → Array
            failed:    Array.from(player.quests.failed)                     // Set → Array
        },

        inventory: player.inventory.map(slot => ({ ...slot })),
        gold:      player.gold,

        factionRep: { ...player.factionRep },

        // Uint8Array → base64 string (compact)
        exploredTiles: uint8ArrayToBase64(player.exploredTiles),

        worldTime: player.worldTime,
        kills:     { ...player.kills },
        crafted:   { ...player.crafted },

        // Objective progress tracking
        _objectiveProgress: player._objectiveProgress ? { ...player._objectiveProgress } : {}
    };
}

// Reconstruct proper typed objects from the raw JSON parse
export function deserializePlayer(data) {
    const player = {
        name:       data.name,
        race:       data.race,
        level:      data.level,
        xp:         data.xp,
        attributes: { ...data.attributes },
        derived:    { ...data.derived },

        skills: Object.fromEntries(
            Object.entries(data.skills).map(([id, d]) => [
                id,
                { xp: d.xp, level: d.level, perksUnlocked: Array.isArray(d.perksUnlocked) ? [...d.perksUnlocked] : [] }
            ])
        ),

        equipment: Object.fromEntries(
            Object.entries(data.equipment).map(([slot, item]) => [
                slot,
                item ? { ...item, stats: item.stats ? { ...item.stats } : null } : null
            ])
        ),

        worldX: data.worldX,
        worldY: data.worldY,

        // Array → Set
        flags: new Set(data.flags || []),

        quests: {
            active:    new Map(Object.entries(data.quests.active || {})),
            completed: new Set(data.quests.completed || []),
            failed:    new Set(data.quests.failed || [])
        },

        inventory:  (data.inventory || []).map(slot => ({ ...slot })),
        gold:       data.gold || 0,
        factionRep: { ...data.factionRep },

        // base64 → Uint8Array
        exploredTiles: data.exploredTiles
            ? base64ToUint8Array(data.exploredTiles)
            : new Uint8Array(40000),

        worldTime: data.worldTime || 0,
        kills:     { ...(data.kills || {}) },
        crafted:   { ...(data.crafted || {}) },

        _objectiveProgress: { ...(data._objectiveProgress || {}) }
    };

    return player;
}

// ─── Binary Encoding ──────────────────────────────────────────────────────────

function uint8ArrayToBase64(arr) {
    if (!arr || arr.length === 0) return '';
    let binary = '';
    const bytes = new Uint8Array(arr.buffer || arr);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToUint8Array(base64) {
    try {
        const binary = atob(base64);
        const arr    = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            arr[i] = binary.charCodeAt(i);
        }
        return arr;
    } catch (e) {
        console.warn('[SaveSystem] Failed to decode exploredTiles, resetting.');
        return new Uint8Array(40000);
    }
}

// ─── Save ─────────────────────────────────────────────────────────────────────

// Serialize and write to localStorage
export function save(player, worldData) {
    try {
        const saveObj = {
            version:   SAVE_VERSION,
            timestamp: Date.now(),
            player:    serializePlayer(player),
            world:     serializeWorldData(worldData)
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveObj));
        EventBus.emit('show_notification', 'Game Saved', '#88ff88');
        return true;
    } catch (e) {
        console.error('[SaveSystem] Save failed:', e);
        EventBus.emit('show_notification', 'Save Failed!', '#ff4444');
        return false;
    }
}

// ─── Load ─────────────────────────────────────────────────────────────────────

// Deserialize from localStorage. Returns { player, world } or null.
export function load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    try {
        const saveObj = JSON.parse(raw);
        if (!saveObj || !saveObj.player) return null;

        // Version migration hook (future)
        if (saveObj.version < SAVE_VERSION) {
            migrateData(saveObj);
        }

        return {
            player: deserializePlayer(saveObj.player),
            world:  deserializeWorldData(saveObj.world || {})
        };
    } catch (e) {
        console.error('[SaveSystem] Load failed:', e);
        return null;
    }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

export function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
    EventBus.emit('show_notification', 'Save Deleted', '#ffaa00');
}

// Return save metadata without full deserialization (for menu display)
export function getSaveInfo() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
        const saveObj = JSON.parse(raw);
        return {
            timestamp:  saveObj.timestamp,
            playerName: saveObj.player?.name || 'Unknown',
            playerRace: saveObj.player?.race || 'Unknown',
            level:      saveObj.player?.level || 1,
            worldTime:  saveObj.player?.worldTime || 0,
            version:    saveObj.version
        };
    } catch (e) {
        return null;
    }
}

// ─── World Data Serialization ─────────────────────────────────────────────────

function serializeWorldData(worldData) {
    if (!worldData) return {};
    // Serialize any Maps/Sets in worldData
    const out = {};
    for (const [key, val] of Object.entries(worldData)) {
        if (val instanceof Map) {
            out[key] = { __type: 'Map', data: Array.from(val.entries()) };
        } else if (val instanceof Set) {
            out[key] = { __type: 'Set', data: Array.from(val) };
        } else {
            out[key] = val;
        }
    }
    return out;
}

function deserializeWorldData(data) {
    if (!data) return {};
    const out = {};
    for (const [key, val] of Object.entries(data)) {
        if (val && val.__type === 'Map') {
            out[key] = new Map(val.data);
        } else if (val && val.__type === 'Set') {
            out[key] = new Set(val.data);
        } else {
            out[key] = val;
        }
    }
    return out;
}

// ─── Migration ────────────────────────────────────────────────────────────────

function migrateData(saveObj) {
    // Placeholder for future save format migrations
    // e.g., if version 0 → 1 added a new field, populate it here
    saveObj.version = SAVE_VERSION;
}

// ─── Event Wiring ─────────────────────────────────────────────────────────────

// Listen for manual save trigger from other systems
EventBus.on('save_game', () => {
    // The caller must pass player + worldData via a registry or direct ref
    // Scenes should call save(player, worldData) directly; this is a fallback signal
    EventBus.emit('show_notification', 'Auto-save triggered (use save() directly from scene).', '#888888');
});

EventBus.on('load_game', (saveData) => {
    // saveData is the pre-loaded object from calling load()
    // Scenes handle the actual reconstruction; this event is for coordination
    if (saveData && saveData.player) {
        EventBus.emit('show_notification', 'Game Loaded', '#88ff88');
    }
});
