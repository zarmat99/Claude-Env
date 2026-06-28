extends RefCounted
## Pure predicate evaluation against GameState. Shared by the quest system (stage advancement)
## and dialogue (choice gating). Accessed via preload (NO class_name) so it never depends on
## Godot's global class cache. Condition `type`s are documented in docs/architecture/DATA_SCHEMAS.md.

static func met(cond: Dictionary) -> bool:
    match String(cond.get("type", "")):
        "has_item":
            return _item_count(String(cond.get("target", ""))) >= int(cond.get("count", 1))
        "talked_to":
            return bool(GameState.flags.get("talked_to_" + String(cond.get("target", "")), false))
        "killed_enemy":
            return int(GameState.kills.get(String(cond.get("target", "")), 0)) >= int(cond.get("count", 1))
        "entered_area":
            var t := String(cond.get("target", ""))
            return GameState.current_map == t or bool(GameState.flags.get("entered_area_" + t, false))
        "quest_stage_is":
            return _active_stage(String(cond.get("quest", ""))) == int(cond.get("stage", -1))
        "quest_not_started":
            var qid := String(cond.get("quest", ""))
            return not GameState.quests["active"].has(qid) and not GameState.quests["completed"].has(qid)
        "quest_active":
            return GameState.quests["active"].has(String(cond.get("quest", "")))
        "quest_completed":
            return GameState.quests["completed"].has(String(cond.get("quest", "")))
        "faction_reputation_at_least":
            var f: Dictionary = GameState.factions.get(String(cond.get("faction", "")), {})
            return int(f.get("reputation", 0)) >= int(cond.get("value", 0))
        "flag_set":
            return bool(GameState.flags.get(String(cond.get("flag", "")), false))
        "flag_not_set":
            return not bool(GameState.flags.get(String(cond.get("flag", "")), false))
        _:
            push_warning("Conditions: unknown condition type '%s'" % cond.get("type", ""))
            return false

## True if every condition in the array is met (empty array = true).
static func all_met(conds: Array) -> bool:
    for c in conds:
        if not met(c):
            return false
    return true

static func _item_count(item_id: String) -> int:
    var n := 0
    for slot in GameState.player.get("inventory", []):
        if String(slot.get("id", "")) == item_id:
            n += int(slot.get("count", 0))
    return n

static func _active_stage(quest_id: String) -> int:
    return int(GameState.quests["active"].get(quest_id, {}).get("stage", -1))
