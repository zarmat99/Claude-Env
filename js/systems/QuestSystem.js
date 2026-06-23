// QuestSystem.js — State machine for all quests in Aethermoor
// Subscribes to EventBus events to auto-check quest objectives.
import EventBus from './EventBus.js';
import { addItem } from './InventorySystem.js';
import { changeRep } from './FactionSystem.js';

// Lazy-load quests data; quests.js may not exist at project start
let QUESTS = {};
async function ensureQuests() {
    if (Object.keys(QUESTS).length > 0) return;
    try {
        const mod = await import('../data/quests.js');
        QUESTS = mod.QUESTS || {};
    } catch (e) {
        // quests.js not yet created; will retry on next call
    }
}
// Synchronous fallback for systems that call us synchronously
function getQuestDef(questId) {
    return QUESTS[questId] || null;
}

// ─── Subscription Setup ───────────────────────────────────────────────────────
// Called once at game boot to wire up auto-objective-checking
let _subscribed = false;
export function subscribeToEvents(getPlayerFn, scene) {
    if (_subscribed) return;
    _subscribed = true;

    // Objective type aliases — quests.js uses descriptive names (talk_to,
    // visit_location, collect_item…) while gameplay emits coarse events.
    // Map each event to the set of objective types it can satisfy.
    const dispatch = (eventName, typeSet) => {
        EventBus.on(eventName, (targetId) => {
            const player = getPlayerFn();
            if (!player) return;
            for (const [questId, stageIndex] of player.quests.active.entries()) {
                const def = getQuestDef(questId);
                if (!def) continue;
                const stage = def.stages[stageIndex];
                if (!stage) continue;
                for (const obj of (stage.objectives || [])) {
                    // Pass obj.type through so progress keys stay consistent.
                    if (typeSet.has(obj.type) && obj.target === targetId) {
                        checkObjective(obj.type, obj.target, player, { questId, stageIndex, obj });
                    }
                }
            }
        });
    };

    dispatch('enemy_killed',    new Set(['kill', 'defeat_enemies', 'destroy_target', 'optional_defeat']));
    dispatch('item_collected',  new Set(['collect', 'collect_item']));
    dispatch('npc_talked_to',   new Set(['talk', 'talk_to', 'find_npc', 'interact_with']));
    dispatch('location_reached', new Set(['reach', 'visit_location', 'reach_location', 'enter_location', 'search_location', 'search_area']));

    // NOTE: we intentionally do NOT listen to 'quest_stage_complete' here.
    // advanceStage() emits that event, so re-calling advanceStage() from a
    // listener caused unbounded recursion. Stage advancement is driven by
    // checkObjective()/advanceStage() directly.
}

// ─── Core Quest API ───────────────────────────────────────────────────────────

export function isQuestActive(player, questId) {
    return player.quests.active.has(questId);
}

export function isQuestComplete(player, questId) {
    return player.quests.completed.has(questId);
}

// Start a quest — initializes it in player.quests.active at stage 0
export async function startQuest(questId, player, scene) {
    await ensureQuests();
    if (player.quests.active.has(questId) || player.quests.completed.has(questId)) return false;
    const def = getQuestDef(questId);
    if (!def) {
        console.warn(`[QuestSystem] Unknown questId: ${questId}`);
        return false;
    }

    player.quests.active.set(questId, 0);
    const firstStage = def.stages[0];
    EventBus.emit('show_notification', `Quest Started: ${def.name}`, '#ffd700');

    // Run onStart actions if any
    if (def.onStart) runOnCompleteActions(def.onStart, player, scene);

    EventBus.emit('hud_update');
    return true;
}

// Check whether a specific objective is completed; advance stage if all objectives done
export function checkObjective(type, target, player, context) {
    const { questId, stageIndex, obj } = context;
    const def = getQuestDef(questId);
    if (!def) return false;

    const stage = def.stages[stageIndex];
    if (!stage) return false;

    // Mark objective as fulfilled in player tracking
    if (!player._objectiveProgress) player._objectiveProgress = {};
    const key = `${questId}_${stageIndex}_${type}_${target}`;

    // For kill/collect objectives with required counts
    if (typeof obj.quantity === 'number') {
        player._objectiveProgress[key] = (player._objectiveProgress[key] || 0) + 1;
        if (player._objectiveProgress[key] < obj.quantity) return false;
    } else {
        player._objectiveProgress[key] = true;
    }

    // Check if ALL objectives in this stage are now done
    const allDone = (stage.objectives || []).every(o => {
        const k = `${questId}_${stageIndex}_${o.type}_${o.target}`;
        if (typeof o.quantity === 'number') {
            return (player._objectiveProgress[k] || 0) >= o.quantity;
        }
        return !!player._objectiveProgress[k];
    });

    if (allDone) {
        advanceStage(questId, stage.id, player, null);
    }

    return allDone;
}

// Advance a quest past the given stageId to the next stage (or complete it)
export function advanceStage(questId, stageId, player, scene) {
    const def = getQuestDef(questId);
    if (!def) return;
    if (!player.quests.active.has(questId)) return;

    const currentIndex = player.quests.active.get(questId);
    const currentStage = def.stages[currentIndex];
    if (!currentStage) return;

    // Run onComplete actions for the current stage
    if (currentStage.onComplete) runOnCompleteActions(currentStage.onComplete, player, scene);

    const nextIndex = currentIndex + 1;
    EventBus.emit('quest_stage_complete', questId, stageId, def.stages[nextIndex]?.id || null);

    if (nextIndex >= def.stages.length) {
        // All stages done — complete the quest
        completeQuest(questId, player, scene);
    } else {
        player.quests.active.set(questId, nextIndex);
        const nextStage = def.stages[nextIndex];
        EventBus.emit('show_notification', `Quest Updated: ${def.name}`, '#88ff88');
        EventBus.emit('hud_update');
    }
}

// Complete a quest — mark done, give rewards, chain quests
export function completeQuest(questId, player, scene) {
    const def = getQuestDef(questId);
    if (!def) return;

    player.quests.active.delete(questId);
    player.quests.completed.add(questId);

    const rewards = def.rewards || {};

    // Gold reward
    if (rewards.gold) {
        player.gold += rewards.gold;
    }

    // Item rewards
    if (rewards.items && Array.isArray(rewards.items)) {
        for (const { itemId, quantity } of rewards.items) {
            addItem(player, itemId, quantity || 1);
        }
    }

    // XP reward (contributes to player level)
    if (rewards.xp) {
        player.xp = (player.xp || 0) + rewards.xp;
    }

    // Faction rep rewards
    if (rewards.factionRep && Array.isArray(rewards.factionRep)) {
        for (const { factionId, amount } of rewards.factionRep) {
            changeRep(player, factionId, amount, scene);
        }
    }

    // Set flag rewards
    if (rewards.flags && Array.isArray(rewards.flags)) {
        for (const flag of rewards.flags) {
            player.flags.add(flag);
            EventBus.emit('flag_set', flag);
        }
    }

    EventBus.emit('quest_complete', questId, rewards);
    EventBus.emit('show_notification', `Quest Complete: ${def.name}`, '#ffd700');

    // Chain to follow-up quest
    if (def.chainQuest) {
        startQuest(def.chainQuest, player, scene);
    }

    // Run global onComplete actions
    if (def.onComplete) runOnCompleteActions(def.onComplete, player, scene);

    EventBus.emit('hud_update');
}

// Fail a quest
export function failQuest(questId, player, scene) {
    const def = getQuestDef(questId);
    player.quests.active.delete(questId);
    player.quests.failed.add(questId);

    if (def && def.onFail) runOnCompleteActions(def.onFail, player, scene);

    EventBus.emit('quest_failed', questId);
    EventBus.emit('show_notification', `Quest Failed: ${def ? def.name : questId}`, '#ff4444');
    EventBus.emit('hud_update');
}

// Return an array of { questId, questName, stageName, objectives } for current active quests HUD display
export function getActiveObjectives(player) {
    const result = [];
    for (const [questId, stageIndex] of player.quests.active.entries()) {
        const def = getQuestDef(questId);
        if (!def) continue;
        const stage = def.stages[stageIndex];
        if (!stage) continue;
        result.push({
            questId,
            questName:  def.name,
            stageName:  stage.name || `Stage ${stageIndex + 1}`,
            objectives: (stage.objectives || []).map(obj => {
                const key = `${questId}_${stageIndex}_${obj.type}_${obj.target}`;
                const progress = player._objectiveProgress
                    ? (player._objectiveProgress[key] || 0)
                    : 0;
                const needed = obj.quantity || 1;
                return {
                    description: obj.description || `${obj.type} ${obj.target}`,
                    progress:    typeof obj.quantity === 'number' ? `${Math.min(progress, needed)}/${needed}` : (progress ? 'Done' : ''),
                    done:        typeof obj.quantity === 'number' ? progress >= needed : !!progress
                };
            })
        });
    }
    return result;
}

// ─── Action Runner ────────────────────────────────────────────────────────────

// Runs an array of action objects, dispatching each to the correct system
export function runOnCompleteActions(actions, player, scene) {
    if (!Array.isArray(actions)) return;
    for (const action of actions) {
        switch (action.type) {
            case 'set_flag':
                player.flags.add(action.flag);
                EventBus.emit('flag_set', action.flag);
                break;
            case 'give_item':
                addItem(player, action.itemId, action.quantity || 1);
                break;
            case 'remove_item':
                // handled by InventorySystem
                import('./InventorySystem.js').then(m => m.removeItem(player, action.itemId, action.quantity || 1));
                break;
            case 'remove_items':
                // Plural form used in quests.js: remove every copy of each listed item
                import('./InventorySystem.js').then(m => {
                    for (const itemId of (action.items || [])) {
                        const count = (player.inventory || [])
                            .filter(s => s.itemId === itemId)
                            .reduce((n, s) => n + s.quantity, 0);
                        if (count > 0) m.removeItem(player, itemId, count);
                    }
                });
                break;
            case 'advance_stage':
                // No-op: the quest engine auto-advances to the next stage when a
                // stage's objectives complete. This action exists in quest data as
                // an authoring hint and must NOT call advanceStage() (double-advance).
                break;
            case 'world_state':
            case 'trigger_ending':
                // Narrative hooks handled by scenes; safe to ignore in the engine.
                break;
            case 'change_rep':
                changeRep(player, action.factionId, action.amount, scene);
                break;
            case 'add_gold':
                player.gold = (player.gold || 0) + action.amount;
                break;
            case 'start_quest':
                startQuest(action.questId, player, scene);
                break;
            case 'fail_quest':
                failQuest(action.questId, player, scene);
                break;
            case 'open_scene':
                if (scene && scene.scene) scene.scene.start(action.sceneKey);
                break;
            case 'show_notification':
                EventBus.emit('show_notification', action.text, action.color || '#ffffff');
                break;
            default:
                console.warn(`[QuestSystem] Unknown action type: ${action.type}`);
        }
    }
}
