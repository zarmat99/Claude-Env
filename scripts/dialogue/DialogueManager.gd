extends Node
## Runs a data-driven dialogue graph from data/dialogues/ (autoload). Drives the DialogueBox via
## `line_changed`, filters choices by their `conditions`, executes node/choice `actions`, and pauses
## the game while a dialogue is active. Conditions/actions: docs/architecture/DATA_SCHEMAS.md.

const Conditions = preload("res://scripts/core/Conditions.gd")

signal line_changed(speaker: String, text: String, choices: Array)

var _id := ""
var _dialogue: Dictionary = {}
var _node_id := ""
var _visible_choices: Array = []

func is_active() -> bool:
    return _id != ""

func start(dialogue_id: String) -> void:
    if is_active():
        return
    _dialogue = DataRegistry.get_dialogue(dialogue_id)
    if _dialogue.is_empty():
        push_error("DialogueManager: unknown dialogue '%s'" % dialogue_id)
        return
    _id = dialogue_id
    _node_id = _resolve_entry()
    get_tree().paused = true
    EventBus.dialogue_started.emit(_id)
    _show_node()

func choose(index: int) -> void:
    if index < 0 or index >= _visible_choices.size():
        return
    var choice: Dictionary = _visible_choices[index]
    _run_actions(choice.get("actions", []))
    var nxt = choice.get("next", null)
    if nxt == null:
        _finish()
    else:
        _node_id = String(nxt)
        _show_node()

## Called by the DialogueBox "Continue" affordance when the current node has no visible choices
## (authored with none, or all gated out by conditions). Advances to the node-level `next` when
## present, otherwise ends the dialogue. Guarantees a reachable node can never soft-lock the paused
## tree (SR3-F1).
func advance() -> void:
    if not is_active():
        return
    var node := _current_node()
    var nxt = node.get("next", null)
    if nxt != null and _dialogue.get("nodes", {}).has(String(nxt)):
        _node_id = String(nxt)
        _show_node()
    else:
        _finish()

## Picks the entry node. If the dialogue declares `entry_rules`, the first rule whose conditions are
## all met selects the node (state-reactive greetings, SR3-F3); otherwise the static `entry` node is
## the guaranteed fallback.
func _resolve_entry() -> String:
    var rules = _dialogue.get("entry_rules", [])
    if rules is Array:
        for rule in rules:
            if rule is Dictionary:
                var conds = rule.get("conditions", [])
                if conds is Array and Conditions.all_met(conds):
                    return String(rule.get("node", _dialogue.get("entry", "start")))
    return String(_dialogue.get("entry", "start"))

func _show_node() -> void:
    var node := _current_node()
    if node.is_empty():
        _finish()
        return
    _run_actions(node.get("actions", []))
    _visible_choices = _filter_choices(node.get("choices", []))
    line_changed.emit(_speaker_name(String(node.get("speaker", ""))), String(node.get("text", "")), _visible_choices)

func _filter_choices(raw: Array) -> Array:
    var out: Array = []
    for c in raw:
        var conds = c.get("conditions", [])
        if conds is Array and not Conditions.all_met(conds):
            continue
        out.append(c)
    return out

func _current_node() -> Dictionary:
    return _dialogue.get("nodes", {}).get(_node_id, {})

func _finish() -> void:
    var ended_id := _id
    _id = ""
    _dialogue = {}
    _node_id = ""
    _visible_choices = []
    get_tree().paused = false
    EventBus.dialogue_ended.emit(ended_id)

func _run_actions(actions: Array) -> void:
    for a in actions:
        match String(a.get("type", "")):
            "set_flag":
                _set_flag(String(a.get("flag", "")), true)
            "clear_flag":
                _clear_flag(String(a.get("flag", "")))
            "start_quest":
                QuestManager.start_quest(String(a.get("quest", "")))
            "advance_quest":
                QuestManager.advance_quest(String(a.get("quest", "")))
            "set_quest_stage":
                QuestManager.set_stage(String(a.get("quest", "")), int(a.get("stage", -2147483648)))
            "give_item":
                _give_item(String(a.get("id", "")), int(a.get("count", 1)))
            "take_item":
                _take_item(String(a.get("id", "")), int(a.get("count", 1)))
            "give_reward":
                QuestManager.grant_rewards(a.get("rewards", {}))
            "change_reputation":
                FactionManager.change_reputation(String(a.get("faction", "")), int(a.get("amount", 0)))
            "set_reputation":
                FactionManager.set_reputation(String(a.get("faction", "")), int(a.get("value", 0)))
            "buy_item":
                EconomyManager.buy(String(a.get("id", "")), int(a.get("count", 1)))
            "sell_item":
                EconomyManager.sell(String(a.get("id", "")), int(a.get("count", 1)))
            _:
                push_error("DialogueManager: unsupported action type '%s'" % a.get("type", ""))

func _set_flag(flag: String, value: bool) -> void:
    if flag == "":
        push_error("DialogueManager: set_flag requires a non-empty flag")
        return
    GameState.flags[flag] = value

func _clear_flag(flag: String) -> void:
    if flag == "":
        push_error("DialogueManager: clear_flag requires a non-empty flag")
        return
    GameState.flags.erase(flag)

func _give_item(item_id: String, count: int) -> void:
    if not InventoryManager.add(item_id, count):
        push_error("DialogueManager: give_item failed for '%s' x%d" % [item_id, count])

func _take_item(item_id: String, count: int) -> void:
    if not InventoryManager.remove(item_id, count):
        push_error("DialogueManager: take_item failed for '%s' x%d" % [item_id, count])

func _speaker_name(speaker_id: String) -> String:
    if speaker_id == "" or speaker_id == "player":
        return "You"
    return String(DataRegistry.get_npc(speaker_id).get("name", speaker_id))
