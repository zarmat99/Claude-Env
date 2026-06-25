extends Node

const MainScene := preload("res://scenes/main/Main.tscn")
const PersistentWorldObject := preload("res://scripts/world/PersistentWorldObject.gd")

var _failures: Array[String] = []
var _main: Node = null

func _ready() -> void:
    _run.call_deferred()

func _run() -> void:
    seed(2)
    print("[M10] World authoring runner starting")
    _test_data_validation_and_proxy_asset()
    await _test_authored_map_generation()
    await _test_world_object_persistence()
    _cleanup_main()
    await _frames(2)

    if _failures.is_empty():
        print("[M10] World authoring runner OK")
        get_tree().quit(0)
    else:
        for failure in _failures:
            push_error("[M10] %s" % failure)
        print("[M10] World authoring runner FAILED with %d failure(s)" % _failures.size())
        get_tree().quit(1)

func _test_data_validation_and_proxy_asset() -> void:
    _assert(DataRegistry.validate_all(), "DataRegistry validation failed: %s" % str(DataRegistry.get_validation_errors()))

    var asset_set := DataRegistry.get_asset_set("asset_proxy_dark_fantasy")
    _assert(not asset_set.is_empty(), "Proxy asset set should be registered")
    _assert(int(asset_set.get("source_tile_size", 0)) == 128, "Proxy source tile size should be 128")
    _assert(int(asset_set.get("world_tile_size", 0)) == 64, "Proxy world tile size should be 64")
    _assert(int(asset_set.get("columns", 0)) == 8 and int(asset_set.get("rows", 0)) == 8, "Proxy atlas should declare an 8x8 grid")

    var texture := load(String(asset_set.get("atlas", ""))) as Texture2D
    _assert(texture != null, "Proxy atlas should load as a Texture2D")
    if texture != null:
        _assert(texture.get_width() == 1024 and texture.get_height() == 1024, "Proxy atlas should be 1024x1024")

func _test_authored_map_generation() -> void:
    await _new_game()
    SceneLoader.change_map("map_forest", "spawn_from_probe")
    await _frames(3)
    _assert(GameState.current_map == "map_forest", "Forest should load before entering probe ruins")
    _assert(_near(SceneLoader.get_player().global_position, Vector2(320, 340)), "Forest should expose spawn_from_probe")

    SceneLoader.change_map("map_probe_ruins", "spawn_probe_entry")
    await _frames(4)
    var map := SceneLoader.get_current_map_node()
    _assert(GameState.current_map == "map_probe_ruins", "Probe ruins should load")
    _assert(_near(SceneLoader.get_player().global_position, Vector2(96, 352)), "Player should use authored spawn_probe_entry")
    _assert(map != null, "Probe ruins map node should exist")
    if map == null:
        return

    var tile_solids := map.get_node_or_null("TileSolids")
    _assert(tile_solids != null, "Authored map should build tile collision root")
    _assert(tile_solids != null and tile_solids.get_child_count() > 0, "Authored map should build collision cells from tile metadata")
    _assert(map.find_children("*", "SpawnPoint", true, false).size() == 2, "Authored map should build two spawn points")
    _assert(map.find_children("*", "AreaTransition", true, false).size() == 1, "Authored map should build one transition")
    _assert(_find_by_persistent_id(map, "chest_probe_ruins_001") is Chest, "Authored map should spawn a chest")
    _assert(_find_by_persistent_id(map, "door_probe_ruins_001") is Door, "Authored map should spawn a door")
    _assert(_find_by_persistent_id(map, "switch_probe_ruins_001") is Switch, "Authored map should spawn a switch")
    _assert(_find_by_persistent_id(map, "potion_probe_ruins_001") != null, "Authored map should spawn a pickup")
    _assert(_find_by_persistent_id(map, "enemy_probe_ruins_slime_001") != null, "Authored map should spawn an enemy")

func _test_world_object_persistence() -> void:
    await _new_game()
    SceneLoader.change_map("map_probe_ruins", "spawn_probe_entry")
    await _frames(4)
    var map := SceneLoader.get_current_map_node()
    var chest := _find_by_persistent_id(map, "chest_probe_ruins_001") as Chest
    var door := _find_by_persistent_id(map, "door_probe_ruins_001") as Door
    var switch := _find_by_persistent_id(map, "switch_probe_ruins_001") as Switch

    _assert(chest != null, "Probe chest should exist before opening")
    _assert(door != null, "Probe door should exist before switch activation")
    _assert(switch != null, "Probe switch should exist before activation")
    if chest == null or door == null or switch == null:
        return

    var potion_count := InventoryManager.get_count("item_health_potion")
    _assert(chest.open(), "Opening the probe chest should succeed")
    _assert(InventoryManager.get_count("item_health_potion") == potion_count + 2, "Probe chest should grant two health potions")
    _assert(PersistentWorldObject.has_state("chest_probe_ruins_001", PersistentWorldObject.STATE_OPENED), "Opened chest state should persist")

    SceneLoader.change_map("map_probe_ruins", "spawn_probe_entry", false)
    await _frames(4)
    chest = _find_by_persistent_id(SceneLoader.get_current_map_node(), "chest_probe_ruins_001") as Chest
    _assert(chest != null and chest.is_opened(), "Reloaded probe chest should remain opened")

    door = _find_by_persistent_id(SceneLoader.get_current_map_node(), "door_probe_ruins_001") as Door
    switch = _find_by_persistent_id(SceneLoader.get_current_map_node(), "switch_probe_ruins_001") as Switch
    _assert(door != null and not door.is_open(), "Probe door should start closed before switch activation")
    _assert(switch != null and switch.activate(), "Probe switch should activate")
    _assert(door != null and door.is_open(), "Probe switch should open its target door")
    _assert(PersistentWorldObject.has_state("door_probe_ruins_001", PersistentWorldObject.STATE_OPEN), "Opened door state should persist")
    _assert(PersistentWorldObject.has_state("switch_probe_ruins_001", PersistentWorldObject.STATE_ON), "Activated switch state should persist")

    SceneLoader.change_map("map_probe_ruins", "spawn_probe_entry", false)
    await _frames(4)
    door = _find_by_persistent_id(SceneLoader.get_current_map_node(), "door_probe_ruins_001") as Door
    switch = _find_by_persistent_id(SceneLoader.get_current_map_node(), "switch_probe_ruins_001") as Switch
    _assert(door != null and door.is_open(), "Reloaded probe door should remain open")
    _assert(switch != null and switch.is_on(), "Reloaded probe switch should remain on")

func _new_game() -> void:
    _cleanup_main()
    await _frames(2)
    get_tree().paused = false
    GameState.reset_to_new_game()
    _main = MainScene.instantiate()
    get_tree().root.add_child(_main)
    await _frames(4)

func _cleanup_main() -> void:
    if _main != null and is_instance_valid(_main):
        _main.queue_free()
    _main = null
    get_tree().paused = false

func _find_by_persistent_id(root: Node, persistent_id: String) -> Node:
    if root == null:
        return null
    var nodes: Array[Node] = [root]
    var index := 0
    while index < nodes.size():
        var node := nodes[index]
        var node_persistent_id = node.get("persistent_id")
        if node_persistent_id != null and str(node_persistent_id) == persistent_id:
            return node
        for child in node.get_children():
            if child is Node:
                nodes.append(child)
        index += 1
    return null

func _frames(count: int) -> void:
    for _i in range(count):
        await get_tree().process_frame

func _near(a: Vector2, b: Vector2, tolerance: float = 0.1) -> bool:
    return a.distance_to(b) <= tolerance

func _assert(condition: bool, message: String) -> void:
    if not condition:
        _failures.append(message)
