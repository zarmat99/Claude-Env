extends Node
## Serializes a GameState snapshot to user://saves/slot_N.json and restores it (autoload).
## M7: saves/restores the runtime snapshot owned by GameState. Schema:
## docs/architecture/DATA_SCHEMAS.md.

const SAVE_DIR := "user://saves/"
const SAVE_VERSION := 1

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("save_game"):
        save_game(0)
        get_viewport().set_input_as_handled()
    elif event.is_action_pressed("load_game"):
        load_game(0)
        get_viewport().set_input_as_handled()

func save_game(slot: int = 0) -> bool:
    _sync_player_from_world()
    var path := get_save_path(slot)
    var dir_err := _ensure_save_dir()
    if dir_err != OK:
        push_error("SaveManager: could not create save directory (%s)" % error_string(dir_err))
        return false

    var file := FileAccess.open(path, FileAccess.WRITE)
    if file == null:
        push_error("SaveManager: could not open %s for writing (%s)" % [path, error_string(FileAccess.get_open_error())])
        return false

    file.store_string(JSON.stringify(_build_snapshot(), "\t"))
    print("[Valdombra] Saved game to %s" % path)
    return true

func load_game(slot: int = 0) -> bool:
    var path := get_save_path(slot)
    if not FileAccess.file_exists(path):
        push_warning("SaveManager: save slot %d does not exist (%s)" % [slot, path])
        return false

    var text := FileAccess.get_file_as_string(path)
    var parsed = JSON.parse_string(text)
    if typeof(parsed) != TYPE_DICTIONARY:
        push_error("SaveManager: save file %s is not a JSON object" % path)
        return false

    var snapshot: Dictionary = parsed
    var version := int(snapshot.get("version", 0))
    if version > SAVE_VERSION:
        push_error("SaveManager: save version %d is newer than supported version %d" % [version, SAVE_VERSION])
        return false

    _apply_snapshot(snapshot)
    _apply_player_to_world()
    EventBus.interaction_prompt_changed.emit("")
    print("[Valdombra] Loaded game from %s" % path)
    return true

func get_save_path(slot: int = 0) -> String:
    return SAVE_DIR + "slot_%d.json" % max(0, slot)

func _ensure_save_dir() -> Error:
    var dir := DirAccess.open("user://")
    if dir == null:
        return ERR_CANT_OPEN
    return dir.make_dir_recursive("saves")

func _build_snapshot() -> Dictionary:
    var player: Dictionary = GameState.player
    return {
        "version": SAVE_VERSION,
        "saved_at": Time.get_datetime_string_from_system(true) + "Z",
        "current_map": String(GameState.current_map),
        "player": {
            "position": _vector_to_dict(player.get("position", Vector2.ZERO)),
            "stats": _duplicate_dict(player.get("stats", {})),
            "gold": int(player.get("gold", 0)),
            "inventory": _duplicate_array(player.get("inventory", [])),
            "equipment": _duplicate_dict(player.get("equipment", {})),
        },
        "quests": {
            "active": _duplicate_dict(GameState.quests.get("active", {})),
            "completed": _duplicate_array(GameState.quests.get("completed", [])),
        },
        "factions": _duplicate_dict(GameState.factions),
        "flags": _duplicate_dict(GameState.flags),
        "world_objects": _duplicate_dict(GameState.world_objects),
        "kills": _duplicate_dict(GameState.kills),
    }

func _apply_snapshot(snapshot: Dictionary) -> void:
    var player: Dictionary = snapshot.get("player", {})
    GameState.player = {
        "position": _dict_to_vector(player.get("position", {})),
        "stats": _normalize_stats(player.get("stats", {})),
        "gold": int(player.get("gold", 0)),
        "inventory": _normalize_inventory(player.get("inventory", [])),
        "equipment": _duplicate_dict(player.get("equipment", {})),
    }

    var quests: Dictionary = snapshot.get("quests", {})
    GameState.quests = {
        "active": _normalize_active_quests(quests.get("active", {})),
        "completed": _normalize_string_array(quests.get("completed", [])),
    }
    GameState.factions = _duplicate_dict(snapshot.get("factions", {}))
    GameState.flags = _normalize_bool_dict(snapshot.get("flags", {}))
    GameState.world_objects = _normalize_world_objects(snapshot.get("world_objects", {}))
    GameState.kills = _normalize_int_dict(snapshot.get("kills", {}))
    GameState.current_map = String(snapshot.get("current_map", ""))

    if SceneLoader.is_bound() and GameState.current_map != "":
        # Loading should restore the saved state, not fire map_changed and advance quests.
        SceneLoader.change_map(GameState.current_map, "", false)

func _sync_player_from_world() -> void:
    var player := SceneLoader.get_player() if SceneLoader.is_bound() else get_tree().get_first_node_in_group("player")
    if player == null or not is_instance_valid(player):
        return
    GameState.player["position"] = player.global_position
    var health := player.get_node_or_null("HealthComponent")
    if health:
        var stats: Dictionary = GameState.player.get("stats", {})
        stats["max_health"] = int(health.max_health)
        stats["health"] = int(health.health)
        GameState.player["stats"] = stats

func _apply_player_to_world() -> void:
    var player := SceneLoader.get_player() if SceneLoader.is_bound() else get_tree().get_first_node_in_group("player")
    if player == null or not is_instance_valid(player):
        return
    player.global_position = GameState.player.get("position", Vector2.ZERO)
    var health := player.get_node_or_null("HealthComponent")
    if health and health.has_method("setup"):
        var stats: Dictionary = GameState.player.get("stats", {})
        health.setup(int(stats.get("max_health", 30)), int(stats.get("health", 30)))

func _vector_to_dict(value) -> Dictionary:
    if value is Vector2:
        return {"x": value.x, "y": value.y}
    if value is Dictionary:
        return {"x": float(value.get("x", 0.0)), "y": float(value.get("y", 0.0))}
    return {"x": 0.0, "y": 0.0}

func _dict_to_vector(value) -> Vector2:
    if value is Vector2:
        return value
    if value is Dictionary:
        return Vector2(float(value.get("x", 0.0)), float(value.get("y", 0.0)))
    return Vector2.ZERO

func _normalize_stats(value) -> Dictionary:
    var stats := _duplicate_dict(value)
    stats["level"] = int(stats.get("level", 1))
    stats["xp"] = int(stats.get("xp", 0))
    stats["max_health"] = int(stats.get("max_health", 30))
    stats["health"] = int(stats.get("health", stats.get("max_health", 30)))
    stats["damage"] = int(stats.get("damage", 6))
    return stats

func _normalize_inventory(value) -> Array:
    var out: Array = []
    if not (value is Array):
        return out
    for slot in value:
        if not (slot is Dictionary):
            continue
        var item_id := String(slot.get("id", ""))
        var count := int(slot.get("count", 0))
        if item_id != "" and count > 0:
            out.append({"id": item_id, "count": count})
    return out

func _normalize_active_quests(value) -> Dictionary:
    var out: Dictionary = {}
    if not (value is Dictionary):
        return out
    for quest_id in value.keys():
        var state = value[quest_id]
        if state is Dictionary:
            out[String(quest_id)] = {"stage": int(state.get("stage", 0))}
    return out

func _normalize_world_objects(value) -> Dictionary:
    var out: Dictionary = {}
    if not (value is Dictionary):
        return out
    for persistent_id in value.keys():
        var state = value[persistent_id]
        if state is Dictionary:
            out[String(persistent_id)] = _duplicate_dict(state)
        else:
            out[String(persistent_id)] = {"state": String(state)}
    return out

func _normalize_string_array(value) -> Array:
    var out: Array = []
    if not (value is Array):
        return out
    for entry in value:
        out.append(String(entry))
    return out

func _normalize_bool_dict(value) -> Dictionary:
    var out: Dictionary = {}
    if not (value is Dictionary):
        return out
    for key in value.keys():
        out[String(key)] = bool(value[key])
    return out

func _normalize_int_dict(value) -> Dictionary:
    var out: Dictionary = {}
    if not (value is Dictionary):
        return out
    for key in value.keys():
        out[String(key)] = int(value[key])
    return out

func _duplicate_dict(value) -> Dictionary:
    return value.duplicate(true) if value is Dictionary else {}

func _duplicate_array(value) -> Array:
    return value.duplicate(true) if value is Array else []
