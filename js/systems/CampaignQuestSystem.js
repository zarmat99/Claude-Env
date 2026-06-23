// CampaignQuestSystem.js — state machine for the complete main and side stories.
import EventBus from './EventBus.js';
import { QUESTS } from '../data/quests.js';
import { addItem, removeItem, getItemCount } from './InventorySystem.js';
import { changeRep } from './FactionSystem.js';

let subscribed = false;

const EVENT_TYPES = {
    npc_talked_to: new Set(['talk', 'talk_to', 'find_npc']),
    location_reached: new Set(['reach', 'visit_location', 'reach_location', 'enter_location']),
    item_collected: new Set(['collect', 'collect_item']),
    enemy_killed: new Set(['kill', 'defeat_enemies', 'destroy_target', 'defeat_or_bypass', 'optional_defeat']),
    story_interacted: new Set(['interact_with', 'search_location', 'search_area']),
    target_destroyed: new Set(['destroy_target', 'defeat_or_bypass']),
    event_witnessed: new Set(['witness_event']),
    item_used_at_location: new Set(['use_item_at_location']),
    crafted_at_location: new Set(['collect_and_craft']),
    player_choice: new Set(['player_choice', 'choice_complete'])
};

export function subscribeToEvents(getPlayerFn) {
    if (subscribed) return;
    subscribed = true;
    for (const [eventName, types] of Object.entries(EVENT_TYPES)) {
        EventBus.on(eventName, (...args) => {
            const player = getPlayerFn();
            if (player) recordQuestEvent(player, eventName, args, types);
        });
    }
}

export const isQuestActive = (player, questId) => player.quests.active.has(questId);
export const isQuestComplete = (player, questId) => player.quests.completed.has(questId);

export function startQuest(questId, player, scene = null) {
    if (isQuestActive(player, questId) || isQuestComplete(player, questId)) return false;
    const def = QUESTS[questId];
    if (!def) {
        console.warn(`[QuestSystem] Unknown quest: ${questId}`);
        return false;
    }
    player.quests.active.set(questId, 0);
    EventBus.emit('show_notification', `Quest Started: ${def.name}`, '#ffd700');
    if (def.onStart) runOnCompleteActions(def.onStart, player, scene);

    const first = def.stages[0];
    if (first?.objectives?.length === 1 && first.objectives[0].type === 'talk_to' &&
        first.objectives[0].target === def.giver) {
        markObjective(questId, 0, 0, first.objectives[0], player, 1, scene);
    } else {
        settleAutomaticStages(questId, player, scene);
    }
    EventBus.emit('hud_update');
    return true;
}

export function recordQuestEvent(player, eventName, args, allowedTypes = EVENT_TYPES[eventName] || new Set()) {
    for (const [questId, stageIndex] of Array.from(player.quests.active.entries())) {
        const stage = QUESTS[questId]?.stages?.[stageIndex];
        if (!stage) continue;

        (stage.objectives || []).forEach((obj, index) => {
            if (isObjectiveDone(player, questId, stageIndex, index, obj)) return;
            if (!allowedTypes.has(obj.type) || !matches(eventName, args, obj, player)) return;
            markObjective(
                questId, stageIndex, index, obj, player,
                eventName === 'item_collected' ? Number(args[1] || 1) : 1,
                null
            );
        });

        (stage.objectives || []).forEach((obj, index) => {
            if (obj.type !== 'choice_complete' || isObjectiveDone(player, questId, stageIndex, index, obj)) return;
            if ((obj.choices || []).some(choice => player.flags.has(choice.completedFlag))) {
                markObjective(questId, stageIndex, index, obj, player, 1, null);
            }
        });
    }
}

function matches(eventName, args, obj, player) {
    const [target, extra] = args;
    if (obj.requiresItems && !obj.requiresItems.every(id => getItemCount(player, id) > 0)) return false;
    if (obj.requiresItem && getItemCount(player, obj.requiresItem) < 1) return false;
    switch (eventName) {
        case 'npc_talked_to': return obj.target === target;
        case 'location_reached': return obj.target === target || obj.location === target;
        case 'item_collected': return obj.itemId === target || obj.target === target;
        case 'enemy_killed': return obj.target === target || (obj.enemies || []).includes(target);
        case 'story_interacted': return obj.target === target;
        case 'target_destroyed': return obj.target === target;
        case 'event_witnessed': return obj.event === target || obj.target === target;
        case 'item_used_at_location': return obj.itemId === target && obj.location === extra;
        case 'crafted_at_location': return obj.craftLocation === target && (!obj.outputFlag || obj.outputFlag === extra);
        case 'player_choice': return obj.type === 'player_choice' || (obj.choices || []).some(c => c.id === target);
        default: return false;
    }
}

const objectiveKey = (questId, stageIndex, index) => `${questId}:${stageIndex}:${index}`;
const requiredCount = obj => Number(obj.quantity || obj.count || 1);

function isObjectiveDone(player, questId, stageIndex, index, obj) {
    if (obj.completedFlag && player.flags.has(obj.completedFlag)) return true;
    return Number(player._objectiveProgress?.[objectiveKey(questId, stageIndex, index)] || 0) >= requiredCount(obj);
}

function markObjective(questId, stageIndex, index, obj, player, amount = 1, scene = null) {
    if (!player._objectiveProgress) player._objectiveProgress = {};
    const key = objectiveKey(questId, stageIndex, index);
    player._objectiveProgress[key] = Math.min(
        requiredCount(obj),
        Number(player._objectiveProgress[key] || 0) + amount
    );
    if (player._objectiveProgress[key] >= requiredCount(obj) && obj.completedFlag) {
        player.flags.add(obj.completedFlag);
        EventBus.emit('flag_set', obj.completedFlag);
    }
    if (player.quests.active.get(questId) === stageIndex &&
        isStageComplete(QUESTS[questId].stages[stageIndex], questId, stageIndex, player)) {
        advanceStage(questId, QUESTS[questId].stages[stageIndex].id, player, scene);
    }
}

function isStageComplete(stage, questId, stageIndex, player) {
    return (stage.objectives || [])
        .map((obj, index) => ({ obj, index }))
        .filter(({ obj }) => !obj.isOptional)
        .every(({ obj, index }) => isObjectiveDone(player, questId, stageIndex, index, obj));
}

export function checkObjective(type, target, player) {
    const eventName = ({
        talk_to: 'npc_talked_to', visit_location: 'location_reached', collect_item: 'item_collected',
        destroy_target: 'target_destroyed', interact_with: 'story_interacted',
        witness_event: 'event_witnessed', player_choice: 'player_choice'
    })[type] || 'story_interacted';
    recordQuestEvent(player, eventName, [target, 1], new Set([type]));
    return true;
}

export function advanceStage(questId, stageId, player, scene = null) {
    const def = QUESTS[questId];
    if (!def || !isQuestActive(player, questId)) return;
    const currentIndex = player.quests.active.get(questId);
    const stage = def.stages[currentIndex];
    if (!stage) return;
    let nextIndex = currentIndex + 1;
    if (stageId && stage.id !== stageId) {
        const requestedIndex = def.stages.findIndex(entry => entry.id === stageId);
        if (requestedIndex !== currentIndex + 1) return;
        nextIndex = requestedIndex;
    }

    if (stage.onComplete) runOnCompleteActions(stage.onComplete, player, scene);
    EventBus.emit('quest_stage_complete', questId, stage.id, def.stages[nextIndex]?.id || null);
    if (nextIndex >= def.stages.length) {
        completeQuest(questId, player, scene);
        return;
    }
    player.quests.active.set(questId, nextIndex);
    EventBus.emit('show_notification', `Quest Updated: ${def.name}`, '#88ff88');
    EventBus.emit('hud_update');
    settleAutomaticStages(questId, player, scene);
}

function settleAutomaticStages(questId, player, scene) {
    let guard = 0;
    while (isQuestActive(player, questId) && guard++ < 10) {
        const index = player.quests.active.get(questId);
        const stage = QUESTS[questId]?.stages?.[index];
        if (!stage) break;
        syncInventoryObjectives(questId, index, stage, player);
        if (isStageComplete(stage, questId, index, player) && (stage.objectives || []).length > 0) {
            advanceStage(questId, stage.id, player, scene);
            continue;
        }
        if ((stage.objectives || []).some(obj => !obj.isOptional)) break;
        advanceStage(questId, stage.id, player, scene);
    }
}

function syncInventoryObjectives(questId, stageIndex, stage, player) {
    if (!player._objectiveProgress) player._objectiveProgress = {};
    (stage.objectives || []).forEach((obj, index) => {
        if (obj.type !== 'collect_item' || !obj.itemId) return;
        const key = objectiveKey(questId, stageIndex, index);
        player._objectiveProgress[key] = Math.min(requiredCount(obj), getItemCount(player, obj.itemId));
        if (player._objectiveProgress[key] >= requiredCount(obj) && obj.completedFlag) {
            player.flags.add(obj.completedFlag);
        }
    });
}

export function completeQuest(questId, player, scene = null) {
    const def = QUESTS[questId];
    if (!def || isQuestComplete(player, questId)) return;
    player.quests.active.delete(questId);
    player.quests.completed.add(questId);
    const rewards = def.rewards || {};
    player.gold = (player.gold || 0) + resolveGoldReward(rewards.gold, player);
    awardQuestXP(player, Number(rewards.xp || 0));
    for (const item of normalizeItems(rewards.items)) addItem(player, item.itemId, item.quantity);
    for (const rep of normalizeReputation(rewards.factionRep, player)) changeRep(player, rep.factionId, rep.amount, scene);
    for (const flag of rewards.flags || []) player.flags.add(flag);
    if (rewards.specialReward?.recipeId) player.flags.add(`recipe_${rewards.specialReward.recipeId}_unlocked`);
    if (def.onComplete) runOnCompleteActions(def.onComplete, player, scene);
    EventBus.emit('quest_complete', questId, rewards);
    EventBus.emit('show_notification', `Quest Complete: ${def.name}`, '#ffd700');
    EventBus.emit('hud_update');
    if (def.chainTo || def.chainQuest) startQuest(def.chainTo || def.chainQuest, player, scene);
}

function resolveGoldReward(gold, player) {
    if (typeof gold === 'number') return gold;
    if (!gold || typeof gold !== 'object') return 0;
    if (player.flags.has('merchant_debt_concordat_outcome')) return Number(gold.concordat || 0);
    if (player.flags.has('merchant_debt_destroyed_outcome')) return Number(gold.destroy || 0);
    if (player.flags.has('merchant_debt_blackmail_outcome')) return Number(gold.blackmail || 0);
    return Number(Object.values(gold).find(value => typeof value === 'number') || 0);
}

function awardQuestXP(player, amount) {
    player.xp = (player.xp || 0) + amount;
    let needed = (player.level || 1) * 300;
    while (player.xp >= needed) {
        player.xp -= needed;
        player.level = (player.level || 1) + 1;
        player.derived.maxHealth += 14;
        player.derived.maxMana += 6;
        player.derived.maxStamina += 6;
        player.derived.health = player.derived.maxHealth;
        player.derived.mana = player.derived.maxMana;
        player.derived.stamina = player.derived.maxStamina;
        EventBus.emit('show_notification', `Level Up! You are now level ${player.level}.`, '#88eeff');
        needed = player.level * 300;
    }
}

function normalizeItems(items) {
    if (!Array.isArray(items)) return [];
    return items.map(item => typeof item === 'string'
        ? { itemId: item, quantity: 1 }
        : { itemId: item.itemId || item.id, quantity: item.quantity || 1 }
    ).filter(item => item.itemId);
}

function normalizeReputation(value, player) {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(v => ({
        factionId: v.factionId || v.faction,
        amount: v.amount || 0
    }));
    const result = Object.entries(value)
        .filter(([, amount]) => typeof amount === 'number')
        .map(([factionId, amount]) => ({ factionId, amount }));
    if (value.conditionalFaction === 'chosen_alliance_faction' && player.chosenAllianceFaction) {
        result.push({ factionId: player.chosenAllianceFaction, amount: value.conditionalRep || 0 });
    }
    return result;
}

export function failQuest(questId, player, scene = null) {
    const def = QUESTS[questId];
    player.quests.active.delete(questId);
    player.quests.failed.add(questId);
    if (def?.onFail) runOnCompleteActions(def.onFail, player, scene);
    EventBus.emit('quest_failed', questId);
    EventBus.emit('show_notification', `Quest Failed: ${def?.name || questId}`, '#ff4444');
}

export function getActiveObjectives(player) {
    const result = [];
    for (const [questId, stageIndex] of player.quests.active.entries()) {
        const def = QUESTS[questId];
        const stage = def?.stages?.[stageIndex];
        if (!stage) continue;
        result.push({
            questId,
            questName: def.name,
            stageName: stage.description || `Stage ${stageIndex + 1}`,
            objectives: (stage.objectives || []).map((obj, index) => {
                const progress = Number(player._objectiveProgress?.[objectiveKey(questId, stageIndex, index)] || 0);
                const needed = requiredCount(obj);
                const done = isObjectiveDone(player, questId, stageIndex, index, obj);
                return {
                    description: obj.description || obj.type,
                    progress: needed > 1 ? `${Math.min(progress, needed)}/${needed}` : (done ? 'Done' : ''),
                    done,
                    optional: !!obj.isOptional
                };
            })
        });
    }
    return result;
}

export function runOnCompleteActions(actions, player, scene = null) {
    if (!Array.isArray(actions)) return;
    for (const action of actions) {
        switch (action.type) {
            case 'set_flag':
                player.flags.add(action.flag);
                if (action.flag === 'concordat_alliance_offered') player.chosenAllianceFaction = 'auric_concordat';
                if (action.flag === 'iron_compact_alliance_offered') player.chosenAllianceFaction = 'iron_compact';
                if (action.flag === 'penitents_alliance_offered') player.chosenAllianceFaction = 'grey_penitents';
                EventBus.emit('flag_set', action.flag);
                break;
            case 'give_item': addItem(player, action.itemId, action.quantity || 1); break;
            case 'remove_item': removeItem(player, action.itemId, action.quantity || 1); break;
            case 'remove_items':
                for (const itemId of action.items || []) {
                    const count = getItemCount(player, itemId);
                    if (count) removeItem(player, itemId, count);
                }
                break;
            case 'change_rep':
                changeRep(player, action.factionId || action.faction, action.amount || 0, scene);
                break;
            case 'add_gold': player.gold = (player.gold || 0) + Number(action.amount || 0); break;
            case 'start_quest': startQuest(action.questId, player, scene); break;
            case 'fail_quest': failQuest(action.questId, player, scene); break;
            case 'world_state':
                player.flags.add(`world_${action.change}`);
                EventBus.emit('world_state_changed', action.change);
                break;
            case 'trigger_ending': {
                const ending = action.conditional
                    ? (player.flags.has('sathis_sacrificed') ? action.flag_sacrifice : action.flag_delay)
                    : action.ending;
                if (ending) EventBus.emit('trigger_ending', ending);
                break;
            }
            case 'npc_death':
            case 'ritual':
                if (action.npcId) {
                    player.flags.add(`${action.npcId}_dead`);
                    EventBus.emit('flag_set', `${action.npcId}_dead`);
                    EventBus.emit('npc_died', action.npcId);
                }
                break;
            case 'unlock_recipe':
                player.flags.add(`recipe_${action.recipeId}_unlocked`);
                break;
            case 'unlock_dialogue':
                player.flags.add(`dialogue_${action.dialogueId}_unlocked`);
                break;
            case 'open_scene':
                if (scene?.scene) scene.scene.start(action.sceneKey, action.data || {});
                break;
            case 'show_notification':
                EventBus.emit('show_notification', action.text, action.color || '#ffffff');
                break;
            case 'advance_stage':
                break;
            default:
                console.warn(`[QuestSystem] Unknown action type: ${action.type}`);
        }
    }
}
