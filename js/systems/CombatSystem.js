// CombatSystem.js — Turn-based combat resolution for Aethermoor
import { addXP, getSkillModifier, getSkillLevel } from './SkillSystem.js';
import EventBus from './EventBus.js';
import { ITEMS, getItem } from '../data/items.js';

// ─── Internal combat state ─────────────────────────────────────────────────────
// Not stored on player; managed per-combat by scene via startCombat return value
export function createCombatState(player, enemy) {
    return {
        active:       true,
        turn:         'player',   // 'player' | 'enemy'
        round:        1,
        player:       player,
        enemy:        { ...enemy }, // shallow clone so we can mutate HP etc.
        log:          [],
        playerStatus: [],          // active status effects on player: [{ type, duration, magnitude }]
        enemyStatus:  [],          // active status effects on enemy
        isDefending:  false        // player chose 'defend' this round
    };
}

// Start combat — returns combat state object, emits event
export function startCombat(player, enemy, scene) {
    const state = createCombatState(player, enemy);
    EventBus.emit('combat_start', enemy);
    return state;
}

// ─── Hit & Damage calculation ──────────────────────────────────────────────────

// Returns { hit: bool, damage: number, critical: bool }
export function resolveHit(attacker, defender, skillId, isMagic = false) {
    const attackerSkillLevel = attacker.skills
        ? (attacker.skills[skillId] ? attacker.skills[skillId].level : 1)
        : (attacker.skillLevel || 1);

    const defenderAGI = defender.attributes
        ? defender.attributes.AGI
        : (defender.agi || 5);

    // Hit chance clamped to [0.10, 0.95]
    const rawHitChance  = 0.6 + (attackerSkillLevel - defenderAGI) * 0.02;
    const hitChance     = Math.min(0.95, Math.max(0.10, rawHitChance));
    const roll          = Math.random();
    const hit           = roll < hitChance;

    if (!hit) return { hit: false, damage: 0, critical: false };

    // Critical check
    const critThresh = 0.05 + attackerSkillLevel / 200;
    const isCrit     = Math.random() < critThresh;

    const damage = calculateDamage(attacker, defender, isMagic, isCrit, skillId);
    return { hit: true, damage, critical: isCrit };
}

// Full damage formula with armor mitigation, skill modifier, STR bonus, randomness
export function calculateDamage(attacker, defender, isMagic = false, isCrit = false, skillId = null) {
    // Base damage from weapon stats or spell stats
    let baseDamage = 1;

    if (attacker.equipment && attacker.equipment.weapon) {
        const w = attacker.equipment.weapon;
        if (w.stats) {
            if (isMagic && typeof w.stats.magicDamage === 'number') {
                baseDamage = w.stats.magicDamage;
            } else if (Array.isArray(w.stats.damage)) {
                const [min, max] = w.stats.damage;
                baseDamage = min + Math.random() * (max - min);
            } else if (typeof w.stats.damage === 'number') {
                baseDamage = w.stats.damage;
            }
        }
    } else if (attacker.damage) {
        // Enemy with a direct damage stat
        baseDamage = Array.isArray(attacker.damage)
            ? attacker.damage[0] + Math.random() * (attacker.damage[1] - attacker.damage[0])
            : attacker.damage;
    }

    // STR bonus for physical
    const STR = attacker.attributes ? attacker.attributes.STR : (attacker.str || 5);
    const strMultiplier = isMagic ? 1 : (1 + STR / 20);

    // Skill modifier
    let skillMod = 1.0;
    if (skillId && attacker.skills) {
        skillMod = 1 + getSkillModifier(attacker, skillId);
    } else if (attacker.skillMod) {
        skillMod = attacker.skillMod;
    }

    // Armor mitigation
    const armor        = isMagic ? 0 : (defender.derived ? defender.derived.baseArmor : (defender.armor || 0));
    const armorPen     = (attacker.equipment && attacker.equipment.weapon && attacker.equipment.weapon.stats && attacker.equipment.weapon.stats.armorPen) || 0;
    const effectiveArmor = Math.max(0, armor - armorPen);
    const armorMitigation = 1 - Math.min(0.85, effectiveArmor / 100);

    // Vorrkai magic affinity (+10% spell power)
    let raceMagicMod = 1.0;
    if (isMagic && attacker.race === 'vorrkai') raceMagicMod = 1.10;

    // Random variance ±15%
    const variance = 0.85 + Math.random() * 0.30;

    let finalDamage = baseDamage * strMultiplier * skillMod * armorMitigation * raceMagicMod * variance;

    // Critical doubles damage
    if (isCrit) finalDamage *= 2;

    return Math.max(1, Math.round(finalDamage));
}

// ─── Status effects ────────────────────────────────────────────────────────────

// Apply a status effect to a target (adds to playerStatus or enemyStatus array)
export function applyStatusEffect(statusArray, effect) {
    // effect: { type: 'poison'|'stun'|'slow'|'bleed'|'burn'|'chill', duration: number, magnitude: number }
    const existing = statusArray.find(e => e.type === effect.type);
    if (existing) {
        // Refresh duration if already active
        existing.duration  = Math.max(existing.duration, effect.duration);
        existing.magnitude = Math.max(existing.magnitude, effect.magnitude);
    } else {
        statusArray.push({ ...effect });
    }
}

// Tick all status effects for a combatant, return total damage dealt this tick
export function tickStatusEffects(statusArray, target) {
    let totalDamage = 0;
    for (let i = statusArray.length - 1; i >= 0; i--) {
        const fx = statusArray[i];
        switch (fx.type) {
            case 'poison':
            case 'bleed':
            case 'burn':
                totalDamage += fx.magnitude;
                if (target.derived) target.derived.health -= fx.magnitude;
                else if (typeof target.health === 'number') target.health -= fx.magnitude;
                break;
            case 'stun':
            case 'slow':
                // Handled externally (skip turn or reduce speed)
                break;
        }
        fx.duration--;
        if (fx.duration <= 0) statusArray.splice(i, 1);
    }
    return totalDamage;
}

// ─── Flee ──────────────────────────────────────────────────────────────────────

// AGI-based flee check. Returns true if player escapes.
export function checkFlee(player, enemy) {
    const playerAGI  = player.attributes.AGI;
    const enemyAGI   = enemy.attributes ? enemy.attributes.AGI : (enemy.agi || 5);
    const sneakLevel = getSkillLevel(player, 'sneak');
    // Base 40% + 2% per AGI advantage + 1% per 5 sneak levels
    const fleeChance = 0.40 + (playerAGI - enemyAGI) * 0.02 + (sneakLevel / 5) * 0.01;
    return Math.random() < Math.min(0.90, Math.max(0.10, fleeChance));
}

// ─── Loot generation ──────────────────────────────────────────────────────────

// Roll loot from enemy's lootTable array
export function generateLoot(enemy) {
    const loot = [];
    if (!enemy.lootTable || !Array.isArray(enemy.lootTable)) return loot;

    for (const entry of enemy.lootTable) {
        // entry: { itemId, chance, minQty, maxQty }
        if (Math.random() < (entry.chance || 0.5)) {
            const min = entry.minQty || 1;
            const max = entry.maxQty || 1;
            const qty = min + Math.floor(Math.random() * (max - min + 1));
            loot.push({ itemId: entry.itemId, quantity: qty });
        }
    }

    // Always drop some gold if enemy has a goldRange
    if (enemy.goldRange) {
        const [min, max] = enemy.goldRange;
        const gold = min + Math.floor(Math.random() * (max - min + 1));
        if (gold > 0) loot.push({ itemId: 'gold_coin', quantity: gold });
    }

    return loot;
}

// ─── Player action ────────────────────────────────────────────────────────────

// Returns { damage, critical, hit, message, statusApplied, combatOver, result }
export function playerAttack(state, action) {
    const { player, enemy } = state;
    let result = { damage: 0, critical: false, hit: false, message: '', statusApplied: null, combatOver: false, result: null };

    if (action === 'defend') {
        state.isDefending = true;
        result.message = 'You brace for impact. Defense increased this round.';
        return result;
    }

    if (action === 'flee') {
        const escaped = checkFlee(player, enemy);
        if (escaped) {
            state.active       = false;
            result.combatOver  = true;
            result.result      = 'fled';
            result.message     = 'You escaped from combat!';
            EventBus.emit('combat_end', 'fled', []);
        } else {
            result.message = 'You failed to escape!';
        }
        return result;
    }

    if (action === 'item') {
        // Item use is handled by InventorySystem; combat just records the action
        result.message = 'You used an item.';
        return result;
    }

    // Determine skill and whether magic
    let skillId  = 'blades';
    let isMagic  = false;
    const weapon = player.equipment && player.equipment.weapon;

    if (weapon) {
        skillId = weapon.skillUsed || 'blades';
        isMagic = weapon.subtype === 'staff' || weapon.subtype === 'orb';
    }

    // Check for mana cost on magic
    if (isMagic && weapon && weapon.stats && weapon.stats.manaCost) {
        if (player.derived.mana < weapon.stats.manaCost) {
            result.message = 'Not enough mana!';
            return result;
        }
        player.derived.mana -= weapon.stats.manaCost;
    }

    // Resolve hit
    const hitResult = resolveHit(player, enemy, skillId, isMagic);
    result.hit      = hitResult.hit;
    result.critical = hitResult.critical;
    result.damage   = hitResult.damage;

    if (!hitResult.hit) {
        result.message = `You swing at ${enemy.name} but miss!`;
        return result;
    }

    enemy.health = (enemy.health || 0) - hitResult.damage;
    result.message = `You hit ${enemy.name} for ${hitResult.damage} damage${hitResult.critical ? ' (CRITICAL!)' : ''}.`;

    // Bleed from blades_50 perk
    if (skillId === 'blades' && player.skills.blades.perksUnlocked.includes('blades_50')) {
        const bleedEffect = { type: 'bleed', duration: 3, magnitude: 3 };
        applyStatusEffect(state.enemyStatus, bleedEffect);
        result.statusApplied = 'bleed';
    }

    // Stagger from blunt_25 perk
    if (skillId === 'blunt' && player.skills.blunt.perksUnlocked.includes('blunt_25')) {
        if (Math.random() < 0.15) {
            applyStatusEffect(state.enemyStatus, { type: 'stun', duration: 1, magnitude: 0 });
            result.statusApplied = 'stun';
            result.message += ' The enemy is stunned!';
        }
    }

    // Award combat XP
    addXP(player, skillId, 5 + Math.floor(hitResult.damage / 5));

    // Check enemy death
    if (enemy.health <= 0) {
        enemy.health      = 0;
        state.active      = false;
        result.combatOver = true;
        result.result     = 'victory';

        const loot = generateLoot(enemy);
        // Track kills
        if (!player.kills) player.kills = {};
        player.kills[enemy.id] = (player.kills[enemy.id] || 0) + 1;

        // Award XP for kill
        const killXP = enemy.xpReward || 20;
        addXP(player, skillId, killXP);

        EventBus.emit('enemy_killed', enemy.id, enemy);
        EventBus.emit('combat_end', 'victory', loot);
        result.loot = loot;
    }

    return result;
}

// ─── Enemy AI turn ────────────────────────────────────────────────────────────

// Returns { damage, hit, message, statusApplied, combatOver }
export function enemyTurn(state) {
    const { player, enemy } = state;
    let result = { damage: 0, hit: false, message: '', statusApplied: null, combatOver: false };

    // Tick enemy status effects
    const statusDmg = tickStatusEffects(state.enemyStatus, enemy);
    if (statusDmg > 0 && enemy.health <= 0) {
        state.active      = false;
        result.combatOver = true;
        result.result     = 'victory';
        result.message    = `${enemy.name} succumbed to status effects!`;
        const loot = generateLoot(enemy);
        if (!player.kills) player.kills = {};
        player.kills[enemy.id] = (player.kills[enemy.id] || 0) + 1;
        EventBus.emit('enemy_killed', enemy.id, enemy);
        EventBus.emit('combat_end', 'victory', loot);
        result.loot = loot;
        return result;
    }

    // Tick player status effects
    tickStatusEffects(state.playerStatus, player);

    // Check if enemy is stunned
    const isStunned = state.enemyStatus.some(e => e.type === 'stun');
    if (isStunned) {
        result.message = `${enemy.name} is stunned and cannot act!`;
        return result;
    }

    // Simple enemy AI: always attack (future: could choose special moves based on HP)
    const enemySkillLevel = enemy.skillLevel || 10;
    const playerAGI       = player.attributes.AGI;
    const hitChance       = Math.min(0.95, Math.max(0.10, 0.6 + (enemySkillLevel - playerAGI) * 0.02));

    if (Math.random() > hitChance) {
        result.message = `${enemy.name} attacks but misses!`;
        return result;
    }

    // Enemy damage calculation
    let baseDamage = 5;
    if (enemy.damage) {
        baseDamage = Array.isArray(enemy.damage)
            ? enemy.damage[0] + Math.random() * (enemy.damage[1] - enemy.damage[0])
            : enemy.damage;
    }

    const enemySTR      = enemy.attributes ? enemy.attributes.STR : (enemy.str || 5);
    const playerArmor   = player.derived.baseArmor || 0;
    const mitigation    = 1 - Math.min(0.85, playerArmor / 100);
    const variance      = 0.85 + Math.random() * 0.30;
    const isCrit        = Math.random() < 0.05;
    let finalDamage     = baseDamage * (1 + enemySTR / 20) * mitigation * variance;
    if (isCrit) finalDamage *= 2;
    finalDamage = Math.max(1, Math.round(finalDamage));

    // Defending player takes 50% damage
    if (state.isDefending) finalDamage = Math.max(1, Math.floor(finalDamage * 0.5));

    player.derived.health -= finalDamage;
    result.hit    = true;
    result.damage = finalDamage;
    result.message = `${enemy.name} hits you for ${finalDamage} damage${isCrit ? ' (CRITICAL!)' : ''}${state.isDefending ? ' (blocked!)' : ''}.`;

    if (player.derived.health <= 0) {
        player.derived.health = 0;
        state.active          = false;
        result.combatOver     = true;
        result.result         = 'defeat';
        EventBus.emit('player_died');
        EventBus.emit('combat_end', 'defeat', []);
    }

    return result;
}

// Advance combat round counter and reset per-round flags
export function nextRound(state) {
    state.round++;
    state.isDefending = false;
    state.turn = 'player';
}
