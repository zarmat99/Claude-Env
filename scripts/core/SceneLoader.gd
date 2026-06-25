extends Node
## Loads/unloads maps into the world root and places the persistent player at a named SpawnPoint
## (autoload). Maps come from maps.json (DataRegistry). Emits EventBus.map_changed. Main binds the
## world root + player once at boot via bind(); AreaTransition calls change_map().

var _world: Node = null
var _player: Node2D = null
var _current_map: Node = null
var _loading := false

func bind(world_root: Node, player: Node2D) -> void:
    _world = world_root
    _player = player

func change_map(map_id: String, spawn_point_id: String = "") -> void:
    if _loading or _world == null:
        return
    var entry := DataRegistry.get_map(map_id)
    var scene_path := String(entry.get("scene", ""))
    if scene_path == "" or not ResourceLoader.exists(scene_path):
        push_warning("SceneLoader: map '%s' has no valid scene" % map_id)
        return
    _loading = true

    if _current_map and is_instance_valid(_current_map):
        _current_map.queue_free()
        _current_map = null

    var map: Node = (load(scene_path) as PackedScene).instantiate()
    _world.add_child(map)
    _current_map = map
    GameState.current_map = map_id

    if _player and is_instance_valid(_player):
        var sp := _find_spawn(map, spawn_point_id)
        if sp:
            _player.global_position = sp.global_position
        # keep the player drawn above the freshly-added map
        if _player.get_parent() == _world:
            _world.move_child(_player, _world.get_child_count() - 1)

    EventBus.map_changed.emit(map_id)
    _loading = false

func _find_spawn(map: Node, spawn_id: String) -> Node2D:
    for sp in map.find_children("*", "SpawnPoint", true, false):
        if String(sp.spawn_id) == spawn_id:
            return sp
    return null
