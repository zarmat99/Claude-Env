extends Node
## Loads/unloads maps into the world root and places the persistent player at a named SpawnPoint
## (autoload). Maps come from maps.json (DataRegistry). Emits EventBus.map_changed. Main binds the
## world root + player once at boot via bind(); AreaTransition calls change_map().

const PickupItemScene := preload("res://scenes/items/PickupItem.tscn")
const PersistentWorldObject = preload("res://scripts/world/PersistentWorldObject.gd")

const TRANSITION_COOLDOWN_MSEC := 250

var _world: Node = null
var _player: Node2D = null
var _current_map: Node = null
var _loading := false
var _transition_locked_until_msec := 0

func bind(world_root: Node, player: Node2D) -> void:
    _world = world_root
    _player = player

func change_map(map_id: String, spawn_point_id: String = "", emit_event: bool = true) -> void:
    if _loading or _world == null:
        return
    var entry := DataRegistry.get_map(map_id)
    if entry.is_empty():
        push_error("SceneLoader: unknown map '%s'" % map_id)
        return
    var scene_path := String(entry.get("scene", ""))
    if scene_path == "" or not ResourceLoader.exists(scene_path):
        push_error("SceneLoader: map '%s' has no valid scene" % map_id)
        return
    _loading = true
    _transition_locked_until_msec = Time.get_ticks_msec() + TRANSITION_COOLDOWN_MSEC

    if _current_map and is_instance_valid(_current_map):
        _current_map.queue_free()
        _current_map = null

    var map: Node = (load(scene_path) as PackedScene).instantiate()
    _world.add_child(map)
    _current_map = map
    GameState.current_map = map_id
    _spawn_dynamic_world_objects(map_id, map)

    if _player and is_instance_valid(_player):
        var sp := _find_spawn(map, spawn_point_id)
        if sp:
            _player.global_position = sp.global_position
        elif spawn_point_id != "":
            push_error("SceneLoader: spawn '%s' not found in map '%s'" % [spawn_point_id, map_id])
        # keep the player drawn above the freshly-added map
        if _player.get_parent() == _world:
            _world.move_child(_player, _world.get_child_count() - 1)

    if emit_event:
        EventBus.map_changed.emit(map_id)
    _loading = false

func is_bound() -> bool:
    return _world != null and _player != null

func is_transition_locked() -> bool:
    return _loading or Time.get_ticks_msec() < _transition_locked_until_msec

func get_player() -> Node2D:
    return _player

func get_current_map_node() -> Node:
    return _current_map

func _find_spawn(map: Node, spawn_id: String) -> Node2D:
    for sp in map.find_children("*", "SpawnPoint", true, false):
        if String(sp.spawn_id) == spawn_id:
            return sp
    return null

func _spawn_dynamic_world_objects(map_id: String, map: Node) -> void:
    for persistent_id in GameState.world_objects.keys():
        var state: Dictionary = GameState.world_objects.get(persistent_id, {})
        if String(state.get("kind", "")) != PersistentWorldObject.KIND_PICKUP:
            continue
        if String(state.get("state", "")) != PersistentWorldObject.STATE_ACTIVE:
            continue
        if String(state.get("map_id", "")) != map_id:
            continue
        var item_id := String(state.get("item_id", ""))
        if not DataRegistry.has_id("items", item_id):
            push_error("SceneLoader: dynamic pickup '%s' has unknown item '%s'" % [persistent_id, item_id])
            continue
        var pos = state.get("position", {})
        var pickup := PickupItemScene.instantiate()
        pickup.item_id = item_id
        pickup.count = int(state.get("count", 1))
        pickup.persistent_id = String(persistent_id)
        map.add_child(pickup)
        if pos is Dictionary:
            pickup.global_position = Vector2(float(pos.get("x", 0.0)), float(pos.get("y", 0.0)))
