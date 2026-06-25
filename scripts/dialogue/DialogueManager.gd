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
    _node_id = String(_dialogue.get("entry", "start"))
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
                GameState.flags[String(a.get("flag", ""))] = true
            "start_quest":
                QuestManager.start_quest(String(a.get("quest", "")))
            "advance_quest":
                QuestManager.advance_quest(String(a.get("quest", "")))
            _:
                push_error("DialogueManager: unsupported action type '%s'" % a.get("type", ""))

func _speaker_name(speaker_id: String) -> String:
    if speaker_id == "" or speaker_id == "player":
        return "You"
    return String(DataRegistry.get_npc(speaker_id).get("name", speaker_id))
