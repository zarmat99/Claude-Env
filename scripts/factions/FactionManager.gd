extends Node
## Runtime broker for player reputation and faction hostility. Data lives in `factions.json`;
## mutable reputation lives in GameState.factions so save/load remains centralized.

const MIN_REPUTATION := -100
const MAX_REPUTATION := 100
const HOSTILE_REPUTATION := -50
const FRIENDLY_REPUTATION := 25

func _ready() -> void:
    ensure_defaults()

func reset_to_defaults() -> void:
    GameState.factions = {}
    ensure_defaults()

func ensure_defaults() -> void:
    for raw_faction_id in DataRegistry.all("factions").keys():
        var faction_id := String(raw_faction_id)
        _ensure_faction(faction_id)

func get_reputation(faction_id: String) -> int:
    if faction_id == "":
        return 0
    _ensure_faction(faction_id)
    var state: Dictionary = GameState.factions.get(faction_id, {})
    return int(state.get("reputation", 0))

func set_reputation(faction_id: String, value: int) -> void:
    if not DataRegistry.has_id("factions", faction_id):
        push_error("FactionManager: unknown faction '%s'" % faction_id)
        return
    var old_value := get_reputation(faction_id)
    var new_value := _clamp_reputation(value)
    GameState.factions[faction_id] = {"reputation": new_value}
    if new_value != old_value:
        EventBus.faction_reputation_changed.emit(faction_id, old_value, new_value)

func change_reputation(faction_id: String, amount: int) -> void:
    set_reputation(faction_id, get_reputation(faction_id) + amount)

func is_hostile_to_player(faction_id: String) -> bool:
    if faction_id == "":
        return false
    return get_reputation(faction_id) <= HOSTILE_REPUTATION

func is_friendly_to_player(faction_id: String) -> bool:
    if faction_id == "":
        return false
    return get_reputation(faction_id) >= FRIENDLY_REPUTATION

func are_hostile(source_faction_id: String, target_faction_id: String) -> bool:
    if source_faction_id == "" or target_faction_id == "" or source_faction_id == target_faction_id:
        return false
    var source := DataRegistry.get_faction(source_faction_id)
    if source.is_empty():
        return false
    var hostile_to: Array = source.get("hostile_to", [])
    return hostile_to.has(target_faction_id)

func are_friendly(source_faction_id: String, target_faction_id: String) -> bool:
    if source_faction_id == "" or target_faction_id == "" or source_faction_id == target_faction_id:
        return source_faction_id != "" and source_faction_id == target_faction_id
    var source := DataRegistry.get_faction(source_faction_id)
    if source.is_empty():
        return false
    var friendly_to: Array = source.get("friendly_to", [])
    return friendly_to.has(target_faction_id)

func _ensure_faction(faction_id: String) -> void:
    if not DataRegistry.has_id("factions", faction_id):
        return
    var current = GameState.factions.get(faction_id, null)
    if current is Dictionary:
        var reputation := int(current.get("reputation", _default_reputation(faction_id)))
        GameState.factions[faction_id] = {"reputation": _clamp_reputation(reputation)}
    else:
        GameState.factions[faction_id] = {"reputation": _default_reputation(faction_id)}

func _default_reputation(faction_id: String) -> int:
    return _clamp_reputation(int(DataRegistry.get_faction(faction_id).get("default_reputation", 0)))

func _clamp_reputation(value: int) -> int:
    return min(MAX_REPUTATION, max(MIN_REPUTATION, value))
