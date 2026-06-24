// DialogueSystem.js — Interprets and drives dialogue trees for Aethermoor NPCs
import EventBus from './EventBus.js';
import { startQuest, advanceStage, isQuestActive, isQuestComplete } from './CampaignQuestSystem.js';
import { addItem, removeItem, hasItem } from './InventorySystem.js';
import { changeRep, getRep, getDisposition } from './FactionSystem.js';

// Lazy-load dialogue trees; dialogues.js may not exist at project start
let DIALOGUES = {};
async function ensureDialogues() {
    if (Object.keys(DIALOGUES).length > 0) return;
    try {
        const mod = await import('../data/dialogues.js');
        // dialogues.js exports DIALOGUE_TREES (older code expected DIALOGUES)
        DIALOGUES = mod.DIALOGUE_TREES || mod.DIALOGUES || {};
    } catch (e) {
        // dialogues.js not yet created
    }
}

// ─── Internal state (one active conversation at a time) ───────────────────────
let _state = {
    treeId:      null,
    npcId:       null,
    player:      null,
    currentNode: null,
    tree:        null
};

// ─── Start conversation ───────────────────────────────────────────────────────

// Load a dialogue tree and set the starting node. Returns a display object.
export async function start(treeId, player, npcId) {
    await ensureDialogues();

    const tree = DIALOGUES[treeId];
    if (!tree) {
        console.warn(`[DialogueSystem] Unknown dialogue tree: ${treeId}`);
        return null;
    }

    _state.treeId      = treeId;
    _state.npcId       = npcId;
    _state.player      = player;
    _state.tree        = tree;
    _state.currentNode = tree.nodes[tree.startNode || tree.root] || tree.nodes[Object.keys(tree.nodes)[0]];

    return getCurrentDisplay(player);
}

// ─── Advance via player choice ────────────────────────────────────────────────

// Select a choice by index. Returns { done: bool, display: displayObj }
export function selectChoice(choiceIndex, player, scene) {
    if (!_state.currentNode) return { done: true, display: null };

    const visibleChoices = getVisibleChoices(player);
    const choice = visibleChoices[choiceIndex];
    if (!choice) {
        console.warn(`[DialogueSystem] Invalid choice index: ${choiceIndex}`);
        return { done: false, display: getCurrentDisplay(player) };
    }

    // Apply any effects for this choice
    if (choice.effects) {
        applyEffects(choice.effects, player, scene);
    }

    // Advance to next node or end
    const nextNodeId = choice.nextNode ?? choice.next;
    if (!nextNodeId || nextNodeId === 'END') {
        // Conversation over
        const npcId = _state.npcId;
        _clearState();
        EventBus.emit('dialogue_end', npcId);
        return { done: true, display: null };
    }

    const nextNode = _state.tree.nodes[nextNodeId];
    if (!nextNode) {
        console.warn(`[DialogueSystem] Node not found: ${nextNodeId}`);
        const npcId = _state.npcId;
        _clearState();
        EventBus.emit('dialogue_end', npcId);
        return { done: true, display: null };
    }

    _state.currentNode = nextNode;

    // Run node-level entry effects if any
    if (nextNode.onEnter) {
        applyEffects(nextNode.onEnter, player, scene);
    }

    // Auto-advance if this node has no choices (it's a terminal story beat)
    if (!nextNode.choices || nextNode.choices.length === 0) {
        const npcId = _state.npcId;
        const display = getCurrentDisplay(player);
        _clearState();
        EventBus.emit('dialogue_end', npcId);
        return { done: true, display };
    }

    return { done: false, display: getCurrentDisplay(player) };
}

// ─── Display Object ───────────────────────────────────────────────────────────

// Returns { speaker, text, portrait, choices } for the current node
export function getCurrentDisplay(player) {
    if (!_state.currentNode) return null;
    const node = _state.currentNode;

    // Resolve dynamic text (can reference player name/race/level)
    const text = resolveText(node.text || '', player);

    return {
        speaker:  node.speaker || (_state.tree ? _state.tree.npcName : 'Unknown'),
        text,
        portrait: node.portrait || (_state.tree ? _state.tree.portrait : null),
        choices:  getVisibleChoices(player)
    };
}

// ─── Choice visibility ────────────────────────────────────────────────────────

function getVisibleChoices(player) {
    if (!_state.currentNode || !_state.currentNode.choices) return [];
    return _state.currentNode.choices.filter(c => isChoiceVisible(c, player));
}

// Returns bool — whether the player meets all conditions for a choice to appear
export function isChoiceVisible(choice, player) {
    if (!choice.conditions || choice.conditions.length === 0) return true;
    return evaluateConditions(choice.conditions, player);
}

// ─── Condition Evaluation ─────────────────────────────────────────────────────

// Returns true if all conditions pass
export function evaluateConditions(conditions, player) {
    if (!Array.isArray(conditions)) return true;
    return conditions.every(cond => evaluateSingleCondition(cond, player));
}

function evaluateSingleCondition(cond, player) {
    switch (cond.type) {
        case 'has_flag':
            return player.flags.has(cond.flag);

        case 'not_flag':
            return !player.flags.has(cond.flag);

        case 'skill_gte':
            return (player.skills[cond.skillId || cond.skill]?.level || 0) >= (cond.value ?? cond.level ?? 0);

        case 'attribute_gte':
            return (player.attributes[cond.attribute] || 0) >= (cond.value ?? cond.level ?? 0);

        case 'rep_gte': {
            const rep = player.factionRep[cond.factionId || cond.faction] || 0;
            return rep >= (cond.value ?? cond.level ?? 0);
        }

        case 'disposition_gte': {
            const dispOrder = ['hostile', 'unfriendly', 'neutral', 'friendly', 'honored', 'exalted'];
            const actual   = getDisposition(player, cond.factionId);
            return dispOrder.indexOf(actual) >= dispOrder.indexOf(cond.value);
        }

        case 'has_item':
            return hasItem(player, cond.itemId, cond.quantity || 1);

        case 'quest_active':
            return isQuestActive(player, cond.questId);

        case 'quest_complete':
            return isQuestComplete(player, cond.questId);

        case 'quest_not_started':
            return !isQuestActive(player, cond.questId) && !isQuestComplete(player, cond.questId);

        case 'level_gte':
            return (player.level || 1) >= cond.value;

        case 'race':
            return cond.races.includes(player.race);

        case 'gold_gte':
        case 'has_gold':
            return (player.gold || 0) >= (cond.value ?? cond.amount ?? 0);

        default:
            console.warn(`[DialogueSystem] Unknown condition type: ${cond.type}`);
            return true;
    }
}

// ─── Effect Application ───────────────────────────────────────────────────────

// Applies an array of effects to the player
export function applyEffects(effects, player, scene) {
    if (!Array.isArray(effects)) return;
    for (const effect of effects) {
        applySingleEffect(effect, player, scene);
    }
}

function applySingleEffect(effect, player, scene) {
    switch (effect.type) {
        case 'set_flag':
            player.flags.add(effect.flag);
            if (effect.flag === 'concordat_alliance_offered') player.chosenAllianceFaction = 'auric_concordat';
            if (effect.flag === 'iron_compact_alliance_offered') player.chosenAllianceFaction = 'iron_compact';
            if (effect.flag === 'penitents_alliance_offered') player.chosenAllianceFaction = 'grey_penitents';
            EventBus.emit('flag_set', effect.flag);
            break;

        case 'remove_flag':
            player.flags.delete(effect.flag);
            break;

        case 'give_item':
            addItem(player, effect.itemId, effect.quantity || 1);
            EventBus.emit('show_notification', `Received: ${effect.itemId} x${effect.quantity || 1}`, '#88ff88');
            break;

        case 'remove_item':
            removeItem(player, effect.itemId, effect.quantity || 1);
            break;

        case 'change_rep':
            changeRep(player, effect.factionId || effect.faction, effect.amount, scene);
            break;

        case 'add_gold':
            player.gold = (player.gold || 0) + effect.amount;
            EventBus.emit('show_notification', `+${effect.amount} gold`, '#ffd700');
            break;

        case 'remove_gold':
            player.gold = Math.max(0, (player.gold || 0) - effect.amount);
            break;

        case 'start_quest':
            startQuest(effect.questId, player, scene);
            break;

        case 'advance_quest':
            advanceStage(effect.questId, effect.stageId, player, scene);
            break;

        case 'set_hostile': {
            // Mark the NPC's faction as hostile to the player
            if (effect.factionId) {
                const currentRep = player.factionRep[effect.factionId] || 0;
                const drop = -100 - currentRep; // Force to -100
                changeRep(player, effect.factionId, drop, scene);
            }
            break;
        }

        case 'heal':
            player.derived.health = Math.min(player.derived.maxHealth, player.derived.health + effect.magnitude);
            break;

        case 'show_notification':
            EventBus.emit('show_notification', effect.text, effect.color || '#ffffff');
            break;

        case 'open_shop':
            if (scene && scene.events) scene.events.emit('open_shop', effect.shopId || effect.npcId || _state.npcId, _state.npcId);
            break;

        case 'open_scene':
            if (scene && scene.scene) scene.scene.start(effect.sceneKey, effect.data || {});
            break;

        default:
            console.warn(`[DialogueSystem] Unknown effect type: ${effect.type}`);
    }

    EventBus.emit('hud_update');
}

// ─── Text Resolution ──────────────────────────────────────────────────────────

// Replaces {{player.name}}, {{player.race}}, {{player.level}} etc. in dialogue text
function resolveText(text, player) {
    return text
        .replace(/\{\{player\.name\}\}/g,  player.name  || 'Traveler')
        .replace(/\{\{player\.race\}\}/g,  player.race  || 'unknown')
        .replace(/\{\{player\.level\}\}/g, player.level || 1);
}

// ─── Internal cleanup ─────────────────────────────────────────────────────────

function _clearState() {
    _state.treeId      = null;
    _state.npcId       = null;
    _state.player      = null;
    _state.currentNode = null;
    _state.tree        = null;
}

// Export getter for current state (useful for UI)
export function isDialogueActive() {
    return _state.treeId !== null;
}

export function getCurrentNpcId() {
    return _state.npcId;
}
