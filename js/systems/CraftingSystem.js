// CraftingSystem.js — Manages all crafting: smithing, alchemy, smelting
import {
    SMITHING_RECIPES,
    ALCHEMY_RECIPES,
    SMELTING_RECIPES,
    getRecipeById
} from '../data/recipes.js';
import { addItem, removeItem, hasItem, getItemCount } from './InventorySystem.js';
import { addXP, getSkillLevel } from './SkillSystem.js';
import { ITEMS, getItem } from '../data/items.js';
import EventBus from './EventBus.js';

// ─── Type Routing ─────────────────────────────────────────────────────────────

function getRecipeList(type) {
    switch (type) {
        case 'smithing':  return SMITHING_RECIPES;
        case 'alchemy':   return ALCHEMY_RECIPES;
        case 'smelting':  return SMELTING_RECIPES;
        default:
            console.warn(`[CraftingSystem] Unknown craft type: ${type}`);
            return [];
    }
}

// Returns the primary skill for a craft type
function getPrimarySkill(type) {
    if (type === 'alchemy') return 'alchemy';
    return 'smithing';
}

// ─── Recipe Checks ────────────────────────────────────────────────────────────

// Returns true if the player can craft this recipe right now
export function canCraft(recipeId, player, type) {
    const list   = getRecipeList(type);
    const recipe = list.find(r => r.id === recipeId);
    if (!recipe) return false;

    // Race restriction
    if (recipe.raceRestricted && !recipe.raceRestricted.includes(player.race)) return false;

    // Quest flag gate
    if (recipe.questFlag && !player.flags.has(recipe.questFlag)) return false;

    // Skill check — supports multi-skill recipes (e.g., smithing + destruction)
    if (recipe.requiresSkill) {
        for (const [skillId, needed] of Object.entries(recipe.requiresSkill)) {
            const have = getSkillLevel(player, skillId);
            if (have < needed) return false;
        }
    }

    // Ingredient check
    for (const ing of recipe.ingredients) {
        if (!hasItem(player, ing.itemId, ing.quantity)) return false;
    }

    return true;
}

// ─── Crafting Execution ───────────────────────────────────────────────────────

// Attempt to craft a recipe. Returns { success, message, output? }
export function craft(recipeId, player, scene, type) {
    const list   = getRecipeList(type);
    const recipe = list.find(r => r.id === recipeId);

    if (!recipe) {
        return { success: false, message: 'Unknown recipe.' };
    }

    if (!canCraft(recipeId, player, type)) {
        // Give a specific failure reason
        if (recipe.raceRestricted && !recipe.raceRestricted.includes(player.race)) {
            return { success: false, message: 'Your race cannot craft this item.' };
        }
        if (recipe.questFlag && !player.flags.has(recipe.questFlag)) {
            return { success: false, message: 'You have not unlocked this recipe yet.' };
        }
        if (recipe.requiresSkill) {
            for (const [skillId, needed] of Object.entries(recipe.requiresSkill)) {
                const have = getSkillLevel(player, skillId);
                if (have < needed) {
                    return { success: false, message: `Requires ${skillId} level ${needed} (you have ${have}).` };
                }
            }
        }
        // Check ingredients
        for (const ing of recipe.ingredients) {
            const have = getItemCount(player, ing.itemId);
            if (have < ing.quantity) {
                const itemDef = getItem(ing.itemId);
                return { success: false, message: `Missing: ${itemDef?.name || ing.itemId} x${ing.quantity - have}` };
            }
        }
        return { success: false, message: 'Cannot craft this item right now.' };
    }

    // Consume ingredients
    for (const ing of recipe.ingredients) {
        removeItem(player, ing.itemId, ing.quantity);
    }

    // Apply alchemy perk: potency (+20% output magnitude) for potency perk — handled at item use time
    // Apply twin_brew perk (alchemy_50): double output quantity
    let outputQuantity = recipe.output.quantity;
    if (type === 'alchemy' && player.skills.alchemy.perksUnlocked.includes('alchemy_50')) {
        outputQuantity *= 2;
    }

    // Add output to inventory
    const added = addItem(player, recipe.output.itemId, outputQuantity);
    if (!added) {
        // Inventory full / overweight — refund ingredients
        for (const ing of recipe.ingredients) {
            addItem(player, ing.itemId, ing.quantity);
        }
        return { success: false, message: 'Cannot carry the crafted item (overweight or no space).' };
    }

    // Grant XP for each skill listed in xpGain
    if (recipe.xpGain) {
        for (const [skillId, amount] of Object.entries(recipe.xpGain)) {
            addXP(player, skillId, amount);
        }
    }

    // Track crafted counts
    if (!player.crafted) player.crafted = {};
    player.crafted[recipe.output.itemId] = (player.crafted[recipe.output.itemId] || 0) + outputQuantity;

    const outputDef = getItem(recipe.output.itemId);
    const msg = `Crafted: ${outputDef?.name || recipe.output.itemId} x${outputQuantity}`;
    EventBus.emit('show_notification', msg, '#88ff88');
    EventBus.emit('hud_update');

    return { success: true, message: msg, output: { itemId: recipe.output.itemId, quantity: outputQuantity } };
}

// ─── Recipe Discovery ─────────────────────────────────────────────────────────

// Return all recipes the player has the skill to attempt (even if missing ingredients)
export function getAvailableRecipes(player, type) {
    const list = getRecipeList(type);
    return list.filter(recipe => {
        // Race restriction
        if (recipe.raceRestricted && !recipe.raceRestricted.includes(player.race)) return false;
        // Quest flag gate
        if (recipe.questFlag && !player.flags.has(recipe.questFlag)) return false;
        // Skill check only (not ingredients)
        if (recipe.requiresSkill) {
            for (const [skillId, needed] of Object.entries(recipe.requiresSkill)) {
                if (getSkillLevel(player, skillId) < needed) return false;
            }
        }
        return true;
    });
}

// Return ALL recipes of a type (for displaying locked/unlocked status in UI)
export function getKnownRecipes(player, type) {
    const list = getRecipeList(type);
    return list.map(recipe => {
        const skillOk = !recipe.requiresSkill || Object.entries(recipe.requiresSkill).every(
            ([skillId, needed]) => getSkillLevel(player, skillId) >= needed
        );
        const raceOk    = !recipe.raceRestricted || recipe.raceRestricted.includes(player.race);
        const flagOk    = !recipe.questFlag || player.flags.has(recipe.questFlag);
        const craftable = skillOk && raceOk && flagOk && recipe.ingredients.every(
            ing => hasItem(player, ing.itemId, ing.quantity)
        );

        return {
            ...recipe,
            locked:    !skillOk || !raceOk || !flagOk,
            craftable,
            skillOk,
            raceOk,
            flagOk
        };
    });
}

// Mark a recipe as discovered (for manual discovery systems, e.g., found a recipe book)
export function discoverRecipe(player, recipeId) {
    if (!player.flags) player.flags = new Set();
    const discoveryFlag = `recipe_known_${recipeId}`;
    if (!player.flags.has(discoveryFlag)) {
        player.flags.add(discoveryFlag);
        EventBus.emit('flag_set', discoveryFlag);
        const recipe = getRecipeById(recipeId);
        EventBus.emit('show_notification', `Recipe Learned: ${recipe?.name || recipeId}`, '#ffd700');
        return true;
    }
    return false;
}

// ─── Freeform Alchemy ─────────────────────────────────────────────────────────

// Alchemy effect combinations — shared effect results when two herbs share an effect tag
const SHARED_EFFECT_OUTCOMES = {
    'healing+healing':          { type: 'heal',           magnitude: 40,  duration: 0,  outputName: 'Healing Brew' },
    'healing+mana_restore':     { type: 'restore_mana',   magnitude: 30,  duration: 0,  outputName: 'Restoration Tonic' },
    'healing+stamina_boost':    { type: 'restore_stamina', magnitude: 35, duration: 0,  outputName: 'Vitality Draught' },
    'mana_restore+mana_restore':{ type: 'restore_mana',   magnitude: 50,  duration: 0,  outputName: 'Mana Concentrate' },
    'mana_restore+magic_boost': { type: 'restore_mana',   magnitude: 40,  duration: 0,  outputName: 'Arcane Infusion' },
    'fire_resistance+stamina_boost': { type: 'restore_stamina', magnitude: 45, duration: 0, outputName: 'Emberpetal Tonic' },
    'sneak_boost+poison':       { type: 'poison',         magnitude: 8,   duration: 4,  outputName: 'Shadow Venom' },
    'poison+poison':            { type: 'poison',         magnitude: 12,  duration: 5,  outputName: 'Concentrated Toxin' },
    'magic_boost+healing':      { type: 'heal',           magnitude: 50,  duration: 0,  outputName: 'Rootstone Elixir' },
    'magic_boost+magic_boost':  { type: 'spell_power',    magnitude: 20,  duration: 60, outputName: 'Void Essence' },
    'sneak_boost+sneak_boost':  { type: 'sneak_boost',    magnitude: 25,  duration: 90, outputName: 'Shadow Draught' }
};

// Freeform combination of 2–3 ingredients. Returns { success, effect, outputName, message }
export function applyAlchemyEffects(ingredients, player) {
    if (!Array.isArray(ingredients) || ingredients.length < 2 || ingredients.length > 3) {
        return { success: false, message: 'Alchemy requires 2–3 ingredients.' };
    }

    const alchemyLevel = getSkillLevel(player, 'alchemy');

    // Collect all alchemy effect tags from the provided ingredient item IDs
    const effectTags = [];
    for (const itemId of ingredients) {
        const def = getItem(itemId);
        if (!def || !def.alchemyEffects) {
            return { success: false, message: `${itemId} has no alchemy properties.` };
        }
        // Verify player has ingredient
        if (!hasItem(player, itemId, 1)) {
            return { success: false, message: `You do not have ${def.name}.` };
        }
        effectTags.push(...def.alchemyEffects);
    }

    // Find shared effects (ingredients must have at least one matching effect tag)
    const tagCounts = {};
    for (const tag of effectTags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
    const sharedTags = Object.entries(tagCounts)
        .filter(([, count]) => count >= 2)
        .map(([tag]) => tag);

    if (sharedTags.length === 0) {
        return { success: false, message: 'These ingredients have no compatible effects. Experiment more.' };
    }

    // Look up the best matching outcome
    let bestOutcome = null;
    for (const tag of sharedTags) {
        const key = `${tag}+${tag}`;
        if (SHARED_EFFECT_OUTCOMES[key]) {
            bestOutcome = SHARED_EFFECT_OUTCOMES[key];
            break;
        }
    }

    // Try cross-tag combinations
    if (!bestOutcome && sharedTags.length === 0) {
        for (const [combo, outcome] of Object.entries(SHARED_EFFECT_OUTCOMES)) {
            const parts = combo.split('+');
            if (parts.every(p => effectTags.includes(p))) {
                bestOutcome = outcome;
                break;
            }
        }
    }

    if (!bestOutcome) {
        // Generic fallback — minor healing
        bestOutcome = { type: 'heal', magnitude: 15, duration: 0, outputName: 'Crude Brew' };
    }

    // Consume ingredients
    for (const itemId of ingredients) {
        removeItem(player, itemId, 1);
    }

    // Scale magnitude with alchemy level (potency perk: +20% at alchemy_25)
    let magnitude = bestOutcome.magnitude;
    if (player.skills.alchemy.perksUnlocked.includes('alchemy_25')) {
        magnitude = Math.round(magnitude * 1.20);
    }

    // Grant alchemy XP
    addXP(player, 'alchemy', 20 + alchemyLevel);
    if (player.race === 'sylveni' && Math.random() < 0.5) {
        // Sylveni 50% bonus herbalism/alchemy XP
        addXP(player, 'alchemy', 10);
        addXP(player, 'herbalism', 5);
    }

    // Add result as a "custom potion" carried effect in inventory
    // We map common effects to existing item IDs for simplicity
    let outputItemId = null;
    switch (bestOutcome.type) {
        case 'heal':              outputItemId = 'health_potion_minor'; break;
        case 'restore_mana':      outputItemId = 'mana_potion';         break;
        case 'restore_stamina':   outputItemId = 'stamina_potion';      break;
        case 'poison':
        case 'sneak_boost':
        case 'spell_power':
            outputItemId = 'stamina_potion'; // fallback; real impl would create custom item
            break;
        default:
            outputItemId = 'health_potion_minor';
    }

    addItem(player, outputItemId, 1);

    const msg = `Brewed: ${bestOutcome.outputName} (${bestOutcome.type} +${magnitude})`;
    EventBus.emit('show_notification', msg, '#88ffcc');
    EventBus.emit('hud_update');

    return {
        success:    true,
        effect:     { ...bestOutcome, magnitude },
        outputName: bestOutcome.outputName,
        outputItemId,
        message:    msg
    };
}
