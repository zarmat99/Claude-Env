extends Node
## Runs a data-driven dialogue graph from data/dialogues/ (autoload). Drives the DialogueBox via
## `line_changed`, executes node/choice `actions`, and pauses the game while a dialogue is active.
## M2: choice `conditions` are not evaluated yet (all choices shown) - that arrives with quests (M3).

signal line_changed(speaker: String, text: String, choices: Array)

var _id := ""
var _dialogue: Dictionary = {}
var _node_id := ""

func is_active() -> bool:
    return _id != ""

func start(dialogue_id: String) -> void:
    if is_active():
        return
    _dialogue = DataRegistry.get_dialogue(dialogue_id)
    if _dialogue.is_empty():
        push_warning("DialogueManager: unknown dialogue '%s'" % dialogue_id)
        return
    _id = dialogue_id
    _node_id = String(_dialogue.get("entry", "start"))
    get_tree().paused = true
    EventBus.dialogue_started.emit(_id)
    _show_node()

func choose(index: int) -> void:
    var node := _current_node()
    var choices: Array = node.get("choices", [])
    if index < 0 or index >= choices.size():
        return
    var choice: Dictionary = choices[index]
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
    var speaker := _speaker_name(String(node.get("speaker", "")))
    line_changed.emit(speaker, String(node.get("text", "")), node.get("choices", []))

func _current_node() -> Dictionary:
    return _dialogue.get("nodes", {}).get(_node_id, {})

func _finish() -> void:
    var ended_id := _id
    _id = ""
    _dialogue = {}
    _node_id = ""
    get_tree().paused = false
    EventBus.dialogue_ended.emit(ended_id)

func _run_actions(actions: Array) -> void:
    for a in actions:
        match String(a.get("type", "")):
            "set_flag":
                GameState.flags[String(a.get("flag", ""))] = true
            _:
                pass  # start_quest / give_item / ... handled from M3+

func _speaker_name(speaker_id: String) -> String:
    if speaker_id == "" or speaker_id == "player":
        return "You"
    return String(DataRegistry.get_npc(speaker_id).get("name", speaker_id))
