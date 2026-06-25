extends Node
## Small helper for objects whose state must survive map reloads and save/load.
## Attachable as a component later, but currently used through static helpers by pickups/enemies.

const STATE_COLLECTED := "collected"
const STATE_DEAD := "dead"

@export var persistent_id: String = ""
@export var remove_when_state: Array[String] = [STATE_COLLECTED, STATE_DEAD]

func _ready() -> void:
    if persistent_id != "" and should_remove(persistent_id, remove_when_state):
        var target := owner if owner != null else get_parent()
        if target:
            target.queue_free()

static func get_state(persistent_id: String) -> String:
    if persistent_id == "":
        return ""
    return String(GameState.world_objects.get(persistent_id, {}).get("state", ""))

static func has_state(persistent_id: String, state: String) -> bool:
    return get_state(persistent_id) == state

static func should_remove(persistent_id: String, removed_states: Array[String]) -> bool:
    return removed_states.has(get_state(persistent_id))

static func set_state(persistent_id: String, state: String) -> void:
    if persistent_id == "" or state == "":
        return
    GameState.world_objects[persistent_id] = {"state": state}
    EventBus.world_object_state_changed.emit(persistent_id, state)
