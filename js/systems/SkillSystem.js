// SkillSystem.js — Manages all 18 player skills, XP, leveling, and perks
import EventBus from './EventBus.js';

// ─── Perk definitions ─────────────────────────────────────────────────────────
// Each skill has perks at levels 25, 50, 75, and 100
export const SKILL_PERKS = {
    blades: {
        25:  { id: 'blades_25',  name: 'Quick Strike',        description: 'Attack twice per turn at 20% chance.' },
        50:  { id: 'blades_50',  name: 'Bleeding Edge',       description: 'Attacks cause bleeding: 3 damage/turn for 3 turns.' },
        75:  { id: 'blades_75',  name: 'Riposte',             description: 'Counter-attack after a successful block (30% chance).' },
        100: { id: 'blades_100', name: 'Bladesmaster',        description: '+25% damage with bladed weapons and -20% stamina cost.' }
    },
    blunt: {
        25:  { id: 'blunt_25',   name: 'Stagger Blow',        description: '15% chance to stun enemy for 1 turn.' },
        50:  { id: 'blunt_50',   name: 'Armor Crusher',       description: 'Reduce enemy armor by 10 per hit (max 3 stacks).' },
        75:  { id: 'blunt_75',   name: 'Heavy Swing',         description: 'Charge attack deals 200% damage, uses extra stamina.' },
        100: { id: 'blunt_100',  name: 'Bonecrusher',         description: 'Ignore 25 points of enemy armor on every strike.' }
    },
    archery: {
        25:  { id: 'archery_25', name: 'Steady Aim',          description: '+15% damage on the first attack of combat.' },
        50:  { id: 'archery_50', name: 'Rapid Fire',          description: 'Loose two arrows per action at a 25% damage penalty each.' },
        75:  { id: 'archery_75', name: 'Piercing Shot',       description: 'Arrows ignore 30% of enemy armor.' },
        100: { id: 'archery_100',name: 'Eagle Eye',           description: '+40% range damage and 10% crit chance with bows.' }
    },
    block: {
        25:  { id: 'block_25',   name: 'Shield Bash',         description: 'Block + counter move stuns enemy for 1 turn.' },
        50:  { id: 'block_50',   name: 'Deflection',          description: '20% chance to completely negate incoming hit.' },
        75:  { id: 'block_75',   name: 'Ward Stance',         description: 'Reduce all incoming magic damage by 20% while blocking.' },
        100: { id: 'block_100',  name: 'Ironwall',            description: 'Block reduces damage by 90% and cannot be bypassed.' }
    },
    destruction: {
        25:  { id: 'destruction_25', name: 'Empowered Spells',    description: '+15% spell damage to all destruction spells.' },
        50:  { id: 'destruction_50', name: 'Dual Cast',           description: 'Spend double mana to cast two spells simultaneously.' },
        75:  { id: 'destruction_75', name: 'Elemental Mastery',   description: 'Each element (fire/frost/shock) gains an extra effect.' },
        100: { id: 'destruction_100',name: 'Arcane Devastation',  description: '+40% spell damage, 10% chance to instantly kill weak foes.' }
    },
    restoration: {
        25:  { id: 'restoration_25', name: 'Efficient Healing',   description: '-15% mana cost for all restoration spells.' },
        50:  { id: 'restoration_50', name: 'Regeneration Aura',   description: 'Passive: regen 2 HP per turn during combat.' },
        75:  { id: 'restoration_75', name: 'Barrier',             description: 'Absorb next hit once per combat (1 charge).' },
        100: { id: 'restoration_100',name: 'Divine Touch',        description: 'Healing spells also cure status effects.' }
    },
    illusion: {
        25:  { id: 'illusion_25', name: 'Calm Aura',           description: 'Non-elite enemies have 25% chance to flee instead of attack.' },
        50:  { id: 'illusion_50', name: 'Shadow Veil',         description: 'Reduce enemy hit chance by 20% for 3 turns.' },
        75:  { id: 'illusion_75', name: 'Frenzy',              description: 'Force an enemy to attack its nearest ally for 2 turns.' },
        100: { id: 'illusion_100',name: 'Mind Domination',     description: 'Charm any enemy below 20% HP to fight for you.' }
    },
    conjuration: {
        25:  { id: 'conjuration_25', name: 'Familiar Bond',    description: 'Summoned creatures have +25% HP.' },
        50:  { id: 'conjuration_50', name: 'Dual Summon',      description: 'Summon two creatures simultaneously (costs extra mana).' },
        75:  { id: 'conjuration_75', name: 'Soul Anchor',      description: 'Bound weapons absorb 10 mana per hit.' },
        100: { id: 'conjuration_100',name: 'Void Pact',        description: 'Summon a powerful Void Entity for 5 turns once per rest.' }
    },
    sneak: {
        25:  { id: 'sneak_25',   name: 'Light Foot',           description: 'No movement noise on all surfaces.' },
        50:  { id: 'sneak_50',   name: 'Shadowed Strike',      description: 'Sneak attack multiplier increased to 4x (from 3x).' },
        75:  { id: 'sneak_75',   name: 'Vanish',               description: 'Re-enter sneak once per combat for free.' },
        100: { id: 'sneak_100',  name: 'Shadow Arts',          description: 'Sneak attack multiplier is 6x; never detected while stationary.' }
    },
    lockpicking: {
        25:  { id: 'lockpicking_25', name: 'Nimble Fingers',   description: 'Lockpicks break 30% less often.' },
        50:  { id: 'lockpicking_50', name: 'Auto-Pick',        description: '15% chance to auto-open simple locks with no pick needed.' },
        75:  { id: 'lockpicking_75', name: 'Master Tumblers',  description: 'Can attempt Adept and Expert locks without failing.' },
        100: { id: 'lockpicking_100',name: 'Golden Hand',      description: 'Never break a pick; open any lock eventually.' }
    },
    pickpocket: {
        25:  { id: 'pickpocket_25', name: 'Cutpurse',          description: '+15% success chance when stealing gold.' },
        50:  { id: 'pickpocket_50', name: 'Extra Pockets',     description: 'Can steal equipped items (30% base success).' },
        75:  { id: 'pickpocket_75', name: 'Misdirection',      description: 'Plant items on targets (used to frame or set traps).' },
        100: { id: 'pickpocket_100',name: 'Invisible Hand',    description: 'Can steal any item from any NPC with 50% base success.' }
    },
    smithing: {
        25:  { id: 'smithing_25',  name: 'Temper',             description: 'Crafted weapons deal +10% damage.' },
        50:  { id: 'smithing_50',  name: 'Reinforcement',      description: 'Crafted armor has +25% durability.' },
        75:  { id: 'smithing_75',  name: 'Alloy Work',         description: 'Unlock advanced metal alloy recipes.' },
        100: { id: 'smithing_100', name: 'Master Smith',       description: 'Craft Rootstone-tier weapons and armor.' }
    },
    alchemy: {
        25:  { id: 'alchemy_25',   name: 'Potency',            description: '+20% effect magnitude on all crafted potions.' },
        50:  { id: 'alchemy_50',   name: 'Experiment',         description: 'Discover new ingredient effects without wasting them.' },
        75:  { id: 'alchemy_75',   name: 'Twin Brew',          description: 'Craft two potions from the same ingredient set.' },
        100: { id: 'alchemy_100',  name: 'Arcane Apothecary',  description: 'Potions can combine any three effects without contradiction.' }
    },
    enchanting: {
        25:  { id: 'enchanting_25',  name: 'Soul Siphon',      description: 'Enchanted weapons restore 5 mana on kill.' },
        50:  { id: 'enchanting_50',  name: 'Charge Keeper',    description: 'Enchanted items last 25% longer before recharging.' },
        75:  { id: 'enchanting_75',  name: 'Dual Enchant',     description: 'Apply two enchantments to one item.' },
        100: { id: 'enchanting_100', name: 'Grand Artificer',  description: 'No charge limit on self-crafted enchantments.' }
    },
    speech: {
        25:  { id: 'speech_25',   name: 'Persuasion',          description: '+20% success on persuade dialogue options.' },
        50:  { id: 'speech_50',   name: 'Investor',            description: 'Shop prices 10% lower universally.' },
        75:  { id: 'speech_75',   name: 'Intimidator',         description: 'Intimidate options become available even to unfriendly NPCs.' },
        100: { id: 'speech_100',  name: 'Master Orator',       description: 'Persuade or intimidate any NPC once per conversation.' }
    },
    negotiation: {
        25:  { id: 'negotiation_25', name: 'Haggler',          description: 'Buy 10% cheaper, sell 10% more at all vendors.' },
        50:  { id: 'negotiation_50', name: 'Fence Network',    description: 'Unlock fencing stolen goods at any shop.' },
        75:  { id: 'negotiation_75', name: 'Extortion',        description: 'Demand gold from weakened enemies instead of fighting.' },
        100: { id: 'negotiation_100',name: 'Trade Prince',     description: 'Buy at base cost, sell at full value; unlock exclusive traders.' }
    },
    herbalism: {
        25:  { id: 'herbalism_25',  name: 'Gatherer',          description: 'Collect double ingredients from wild plants.' },
        50:  { id: 'herbalism_50',  name: 'Wildcrafting',      description: 'Identify unknown plants without a guide.' },
        75:  { id: 'herbalism_75',  name: 'Cultivator',        description: 'Grow rare herbs at any camp (resting mechanic).' },
        100: { id: 'herbalism_100', name: 'Nature\'s Warden',  description: 'Forage any ingredient in any biome; triple harvest chance.' }
    },
    survival: {
        25:  { id: 'survival_25',  name: 'Campfire',           description: 'Build a camp to rest and recover without a bed.' },
        50:  { id: 'survival_50',  name: 'Tracker',            description: 'See enemy trails and predict patrol routes on the map.' },
        75:  { id: 'survival_75',  name: 'Pathfinder',         description: 'Move at full speed in all terrain types.' },
        100: { id: 'survival_100', name: 'Wilderness Master',  description: 'Never get lost; immune to environmental damage outdoors.' }
    }
};

// XP required to reach the next level from currentLevel
export function getXPToNextLevel(currentLevel) {
    return 100 * currentLevel * currentLevel;
}

// Get the current numeric level of a skill
export function getSkillLevel(player, skillId) {
    const skill = player.skills[skillId];
    return skill ? skill.level : 1;
}

// Returns a combat/check modifier based on skill level (0-based fractional)
export function getSkillModifier(player, skillId) {
    const level = getSkillLevel(player, skillId);
    // Each level above 1 grants +0.01 modifier (e.g., level 50 = +0.49)
    return (level - 1) * 0.01;
}

// Check and unlock a perk at the given skill level milestone (25/50/75/100)
export function checkPerkUnlock(player, skillId, level) {
    const milestones = [25, 50, 75, 100];
    if (!milestones.includes(level)) return null;

    const skill  = player.skills[skillId];
    const perk   = SKILL_PERKS[skillId] && SKILL_PERKS[skillId][level];
    if (!perk) return null;
    if (skill.perksUnlocked.includes(perk.id)) return null;

    skill.perksUnlocked.push(perk.id);
    EventBus.emit('show_notification', `Perk Unlocked: ${perk.name}`, '#ffd700');
    return perk;
}

// Level up a skill, apply perk checks, and contribute to overall player XP/level
export function levelUp(player, skillId) {
    const skill = player.skills[skillId];
    if (!skill) return;

    skill.level = Math.min(skill.level + 1, 100);
    skill.xp   -= getXPToNextLevel(skill.level - 1);  // remove spent XP
    if (skill.xp < 0) skill.xp = 0;

    const newPerk = checkPerkUnlock(player, skillId, skill.level);

    EventBus.emit('skill_level_up', skillId, skill.level);

    // Each skill level-up also contributes toward the player's character level
    // Every 10 combined skill levels = +1 player level (handled via XP accumulation)
    player.xp = (player.xp || 0) + 10;
    const xpNeeded = 100 * player.level * player.level;
    if (player.xp >= xpNeeded) {
        player.xp   -= xpNeeded;
        player.level = Math.min(player.level + 1, 50);
        EventBus.emit('player_leveled_up', player.level);
        EventBus.emit('show_notification', `Level Up! You are now level ${player.level}`, '#ffd700');
        // Attribute point granted — handled by CharacterScene
    }

    return newPerk;
}

// Add XP to a skill, handle level-up cascade, fire events
export function addXP(player, skillId, amount) {
    const skill = player.skills[skillId];
    if (!skill) {
        console.warn(`[SkillSystem] Unknown skillId: ${skillId}`);
        return;
    }
    if (skill.level >= 100) return;   // Already maxed

    skill.xp += amount;

    // Loop in case bulk XP crosses multiple level thresholds
    while (skill.level < 100 && skill.xp >= getXPToNextLevel(skill.level)) {
        levelUp(player, skillId);
    }
}
