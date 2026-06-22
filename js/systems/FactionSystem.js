// FactionSystem.js — Manages faction reputation, disposition, shop modifiers
import { FACTIONS, getFactionDisposition } from '../data/factions.js';
import EventBus from './EventBus.js';

// ─── Core rep manipulation ────────────────────────────────────────────────────

// Change rep by delta. Clamps to [-100, 100]. Also propagates allied/rival rep changes.
export function changeRep(player, factionId, delta, scene) {
    if (!player.factionRep.hasOwnProperty(factionId)) {
        console.warn(`[FactionSystem] Unknown factionId: ${factionId}`);
        return;
    }

    const before = player.factionRep[factionId];
    const after  = Math.min(100, Math.max(-100, before + delta));
    player.factionRep[factionId] = after;

    EventBus.emit('faction_rep_changed', factionId, delta, after);

    // Propagate to allied/rival factions based on faction disposition table
    const factionDef = FACTIONS[factionId];
    if (factionDef && factionDef.disposition) {
        for (const [otherFactionId, dispositionScore] of Object.entries(factionDef.disposition)) {
            if (!player.factionRep.hasOwnProperty(otherFactionId)) continue;
            // Allied factions (positive disposition): small sympathy bonus
            // Rival factions (negative disposition): small sympathy penalty
            if (dispositionScore >= 40 && delta !== 0) {
                // Close allies: +25% of delta
                const spillover = Math.round(delta * 0.25);
                if (spillover !== 0) {
                    const prevOther = player.factionRep[otherFactionId];
                    const newOther  = Math.min(100, Math.max(-100, prevOther + spillover));
                    player.factionRep[otherFactionId] = newOther;
                    if (spillover !== 0) EventBus.emit('faction_rep_changed', otherFactionId, spillover, newOther);
                }
            } else if (dispositionScore <= -60 && delta !== 0) {
                // Bitter rivals: -15% of delta (opposing direction)
                const spillover = Math.round(delta * -0.15);
                if (spillover !== 0) {
                    const prevOther = player.factionRep[otherFactionId];
                    const newOther  = Math.min(100, Math.max(-100, prevOther + spillover));
                    player.factionRep[otherFactionId] = newOther;
                    EventBus.emit('faction_rep_changed', otherFactionId, spillover, newOther);
                }
            }
        }
    }

    EventBus.emit('hud_update');
}

// Return current rep value
export function getRep(player, factionId) {
    return player.factionRep.hasOwnProperty(factionId) ? player.factionRep[factionId] : 0;
}

// ─── Disposition ──────────────────────────────────────────────────────────────

// Returns 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'honored' | 'exalted'
export function getDisposition(player, factionId) {
    const rep     = getRep(player, factionId);
    const faction = FACTIONS[factionId];
    if (!faction) return 'neutral';

    const t = faction.repThresholds;
    if (rep < t.hostile)     return 'hostile';
    if (rep < t.unfriendly)  return 'unfriendly';
    if (rep < t.neutral)     return 'neutral';
    if (rep < t.friendly)    return 'friendly';
    if (rep < t.honored)     return 'honored';
    return 'exalted';
}

// Returns true if faction disposition toward player is hostile
export function isHostile(player, factionId) {
    return getDisposition(player, factionId) === 'hostile';
}

// ─── Shop pricing ─────────────────────────────────────────────────────────────

// Returns a price multiplier for buying from a faction shop
// exalted = 0.80, honored = 0.90, friendly = 0.95, neutral = 1.00,
// unfriendly = 1.20, hostile = 1.50
export function getShopPriceModifier(player, factionId) {
    const disp = getDisposition(player, factionId);
    switch (disp) {
        case 'exalted':    return 0.80;
        case 'honored':    return 0.90;
        case 'friendly':   return 0.95;
        case 'neutral':    return 1.00;
        case 'unfriendly': return 1.20;
        case 'hostile':    return 1.50;
        default:           return 1.00;
    }
}

// ─── Faction membership checks ────────────────────────────────────────────────

// Returns true if the player meets all joining requirements for the faction
export function canJoinFaction(player, factionId) {
    const faction = FACTIONS[factionId];
    if (!faction) return false;
    if (!faction.joinable) return false;

    const req = faction.joinRequirements || {};
    const rep = getRep(player, factionId);

    // Rep threshold
    if (typeof req.rep === 'number' && rep < req.rep) return false;

    // Skill requirement
    if (req.skill) {
        const { id, level } = req.skill;
        if (!player.skills[id] || player.skills[id].level < level) return false;
    }

    // Vorrkai cannot initially join Auric Concordat
    if (factionId === 'auric_concordat' && player.race === 'vorrkai') {
        if (!player.flags.has('concordat_vorrkai_exception')) return false;
    }

    return true;
}

// ─── Initialization ───────────────────────────────────────────────────────────

// Set starting faction rep based on race from factions.js startingRep tables
export function initializeRep(player, raceId) {
    for (const [factionId, factionDef] of Object.entries(FACTIONS)) {
        const startRep = factionDef.startingRep[raceId] ?? 0;
        player.factionRep[factionId] = Math.min(100, Math.max(-100, startRep));
    }
}

// Get a human-readable title for the player within a faction
export function getFactionTitle(player, factionId) {
    const faction = FACTIONS[factionId];
    if (!faction) return 'Unknown';
    const rep    = getRep(player, factionId);
    const t      = faction.repThresholds;
    const titles = faction.playerTitle;
    if (rep < t.unfriendly) return titles[0];
    if (rep < t.neutral)    return titles[1];
    if (rep < t.friendly)   return titles[2];
    if (rep < t.honored)    return titles[3];
    if (rep < t.exalted)    return titles[4];
    return titles[5];
}
