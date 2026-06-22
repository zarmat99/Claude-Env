// StatsSystem.js — Computes and applies player derived stats from attributes + equipment + race
import { RACES, getRaceData } from '../data/races.js';

// Race base stat references (pulled from races.js)
export function getRaceBaseHealth(race) {
    const r = getRaceData(race);
    return r ? r.health : 100;
}

export function getRaceBaseMana(race) {
    const r = getRaceData(race);
    return r ? r.mana : 80;
}

export function getRaceBaseStamina(race) {
    const r = getRaceData(race);
    return r ? r.stamina : 100;
}

// Small bonus applied to derived stats per player level
export function getLevelBonus(level) {
    return {
        health: level * 5,
        mana: level * 2,
        stamina: level * 3
    };
}

// Sum armor from all equipped items
function sumEquipmentArmor(player) {
    if (!player.equipment) return 0;
    let total = 0;
    for (const slot of Object.values(player.equipment)) {
        if (slot && slot.stats && typeof slot.stats.defense === 'number') {
            total += slot.stats.defense;
        }
    }
    return total;
}

// Collect all stat bonuses granted by equipped items (speed, health, mana bonuses etc.)
function collectEquipmentBonuses(player) {
    const bonuses = {
        health: 0,
        mana: 0,
        stamina: 0,
        carryWeight: 0,
        moveSpeed: 0,
        armor: 0
    };
    if (!player.equipment) return bonuses;
    for (const slot of Object.values(player.equipment)) {
        if (!slot || !slot.stats) continue;
        if (typeof slot.stats.bonusHealth === 'number')     bonuses.health     += slot.stats.bonusHealth;
        if (typeof slot.stats.bonusMana === 'number')       bonuses.mana       += slot.stats.bonusMana;
        if (typeof slot.stats.bonusStamina === 'number')    bonuses.stamina    += slot.stats.bonusStamina;
        if (typeof slot.stats.bonusCarry === 'number')      bonuses.carryWeight+= slot.stats.bonusCarry;
        if (typeof slot.stats.bonusSpeed === 'number')      bonuses.moveSpeed  += slot.stats.bonusSpeed;
    }
    return bonuses;
}

// applyEquipment — adds equipment armor + stat bonuses to already-computed derived stats
export function applyEquipment(player) {
    const equip     = collectEquipmentBonuses(player);
    const armorSum  = sumEquipmentArmor(player);
    const race      = getRaceData(player.race);
    const naturalArmor = (race && race.bonuses && race.bonuses.naturalArmor) ? race.bonuses.naturalArmor : 0;

    player.derived.maxHealth     += equip.health;
    player.derived.maxMana       += equip.mana;
    player.derived.maxStamina    += equip.stamina;
    player.derived.maxCarryWeight+= equip.carryWeight;
    player.derived.moveSpeed     += equip.moveSpeed;
    // baseArmor = equipment armor sum + END/4 + natural armor
    player.derived.baseArmor = armorSum + Math.floor(player.attributes.END / 4) + naturalArmor;
}

// computeDerived — full recalculation of all derived stats
export function computeDerived(player) {
    const { attributes, level, race } = player;
    const { STR, END, AGI, INT, WIL } = attributes;
    const lvBonus = getLevelBonus(level);

    // Reset derived to formula base before applying equipment
    const derived = {
        maxHealth:      getRaceBaseHealth(race)   + END * 10 + lvBonus.health,
        maxMana:        getRaceBaseMana(race)      + INT * 8  + WIL * 4 + lvBonus.mana,
        maxStamina:     getRaceBaseStamina(race)   + END * 5  + AGI * 3 + lvBonus.stamina,
        maxCarryWeight: 100 + STR * 10,
        moveSpeed:      120 + AGI * 4,
        baseArmor:      0,   // will be set in applyEquipment
        // preserve current resource values clamped to new max
        health:   player.derived ? Math.min(player.derived.health,   getRaceBaseHealth(race)  + END * 10 + lvBonus.health)  : getRaceBaseHealth(race)  + END * 10 + lvBonus.health,
        mana:     player.derived ? Math.min(player.derived.mana,     getRaceBaseMana(race)    + INT * 8  + WIL * 4 + lvBonus.mana)   : getRaceBaseMana(race)    + INT * 8  + WIL * 4 + lvBonus.mana,
        stamina:  player.derived ? Math.min(player.derived.stamina,  getRaceBaseStamina(race) + END * 5  + AGI * 3 + lvBonus.stamina) : getRaceBaseStamina(race) + END * 5  + AGI * 3 + lvBonus.stamina,
        carryWeight: player.derived ? player.derived.carryWeight : 0
    };

    player.derived = derived;
    applyEquipment(player);

    // Race-specific bonuses
    const raceData = getRaceData(race);
    if (raceData && raceData.bonuses) {
        // Vorrkai magic affinity is handled elsewhere (spell damage %)
        // Thornkin health regen is handled in the game loop
    }

    return player.derived;
}
