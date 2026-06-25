extends Node
## Staged, data-driven quests (autoload). Quests are dicts from data/quests/ (DataRegistry);
## active/completed state lives in GameState.quests. Advancement is event-driven via EventBus.
## Conditions are evaluated by Conditions.gd. Schema: docs/architecture/DATA_SCHEMAS.md.

const Conditions = preload("res://scripts/core/Conditions.gd")

func _ready() -> void:
    EventBus.item_added.connect(func(_id, _n): _recheck_active())
    EventBus.actor_died.connect(func(_a): _recheck_active())
    EventBus.map_changed.connect(_on_map_changed)
    EventBus.npc_talked.connect(_on_npc_talked)

func start_quest(quest_id: String) -> void:
    var q := DataRegistry.get_quest(quest_id)
    if q.is_empty():
        push_warning("QuestManager: unknown quest '%s'" % quest_id)
        return
    if GameState.quests["active"].has(quest_id) or GameState.quests["completed"].has(quest_id):
        return
    var first := _first_stage(q)
    GameState.quests["active"][quest_id] = {"stage": first}
    EventBus.quest_started.emit(quest_id)
    EventBus.quest_stage_updated.emit(quest_id, first)
    _try_advance(quest_id)  # in case the opening stage is already satisfied

## Force the current stage to its `next` (used by the dialogue `advance_quest` action).
func advance_quest(quest_id: String) -> void:
    if GameState.quests["active"].has(quest_id):
        _advance(quest_id)

func get_stage(quest_id: String) -> int:
    return int(GameState.quests["active"].get(quest_id, {}).get("stage", -1))

func is_active(quest_id: String) -> bool:
    return GameState.quests["active"].has(quest_id)

func is_completed(quest_id: String) -> bool:
    return GameState.quests["completed"].has(quest_id)

# ── Event handlers ────────────────────────────────────────────────────────────

func _on_map_changed(map_id: String) -> void:
    GameState.flags["entered_area_" + map_id] = true
    _recheck_active()

func _on_npc_talked(npc_id: String) -> void:
    GameState.flags["talked_to_" + npc_id] = true   # persistent fact (for dialogue gating)
    # talked_to advances only at the moment of talking (not via state recheck), so a
    # "return to X" stage isn't auto-completed by an earlier conversation.
    for quest_id in GameState.quests["active"].keys():
        var sd := _current_stage_def(quest_id)
        var cond = sd.get("advance_on", null)
        if cond and String(cond.get("type", "")) == "talked_to" and String(cond.get("target", "")) == npc_id:
            _advance(quest_id)
    _recheck_active()

# ── Advancement ───────────────────────────────────────────────────────────────

func _recheck_active() -> void:
    for quest_id in GameState.quests["active"].keys():
        _try_advance(quest_id)

func _try_advance(quest_id: String) -> void:
    var sd := _current_stage_def(quest_id)
    if sd.is_empty() or sd.get("completes", false):
        return
    var cond = sd.get("advance_on", null)
    if cond == null:
        return
    if String(cond.get("type", "")) == "talked_to":
        return  # handled momentarily in _on_npc_talked
    if Conditions.met(cond):
        _advance(quest_id)

func _advance(quest_id: String) -> void:
    var sd := _current_stage_def(quest_id)
    if sd.is_empty():
        return
    var nxt = sd.get("next", null)
    if nxt == null:
        return
    GameState.quests["active"][quest_id]["stage"] = int(nxt)
    EventBus.quest_stage_updated.emit(quest_id, int(nxt))
    var new_def := _current_stage_def(quest_id)
    if new_def.get("completes", false):
        _complete(quest_id, new_def)
    else:
        _try_advance(quest_id)  # chain if the new stage is already satisfied

func _complete(quest_id: String, stage_def: Dictionary) -> void:
    GameState.quests["active"].erase(quest_id)
    if not GameState.quests["completed"].has(quest_id):
        GameState.quests["completed"].append(quest_id)
    EventBus.quest_completed.emit(quest_id)
    _grant_rewards(stage_def.get("rewards", {}))

func _grant_rewards(rewards: Dictionary) -> void:
    if rewards.is_empty():
        return
    var xp := int(rewards.get("xp", 0))
    if xp > 0:
        EventBus.xp_gained.emit(xp)  # progression stores it from M8
    var gold := int(rewards.get("gold", 0))
    if gold > 0:
        GameState.player["gold"] = int(GameState.player.get("gold", 0)) + gold
        EventBus.gold_changed.emit(GameState.player["gold"])
    for item in rewards.get("items", []):
        InventoryManager.add(String(item.get("id", "")), int(item.get("count", 1)))

# ── Helpers ───────────────────────────────────────────────────────────────────

func _first_stage(q: Dictionary) -> int:
    var stages: Array = q.get("stages", [])
    return int(stages[0].get("stage", 0)) if stages.size() > 0 else 0

func _stage_def(quest_id: String, stage: int) -> Dictionary:
    for s in DataRegistry.get_quest(quest_id).get("stages", []):
        if int(s.get("stage", -2147483648)) == stage:
            return s
    return {}

func _current_stage_def(quest_id: String) -> Dictionary:
    return _stage_def(quest_id, get_stage(quest_id))

## Returns the human-readable description for a quest's current (or given) stage.
func stage_desc(quest_id: String, stage: int = -999) -> String:
    var s := stage if stage != -999 else get_stage(quest_id)
    return String(_stage_def(quest_id, s).get("desc", ""))
