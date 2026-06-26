extends Node

const PlayerScene := preload("res://scenes/player/Player.tscn")
const ChestScene := preload("res://scenes/world/Chest.tscn")
const DoorScene := preload("res://scenes/world/Door.tscn")
const SwitchScene := preload("res://scenes/world/Switch.tscn")
const PersistentWorldObject := preload("res://scripts/world/PersistentWorldObject.gd")
const WorldScale := preload("res://scripts/core/WorldScale.gd")

var _failures: Array[String] = []

func _ready() -> void:
    _run.call_deferred()

func _run() -> void:
    print("[M10] World authoring quarantine runner starting")
    _test_failed_probe_is_not_active()
    _test_placeholder_collision_scale()
    await _test_world_objects_still_work()
    await _frames(2)

    if _failures.is_empty():
        print("[M10] World authoring quarantine runner OK")
        get_tree().quit(0)
    else:
        for failure in _failures:
            push_error("[M10] %s" % failure)
        print("[M10] World authoring quarantine runner FAILED with %d failure(s)" % _failures.size())
        get_tree().quit(1)

func _test_failed_probe_is_not_active() -> void:
    _assert(DataRegistry.validate_all(), "DataRegistry validation failed: %s" % str(DataRegistry.get_validation_errors()))
    _assert(not DataRegistry.has_id("maps", "map_probe_ruins"), "Failed probe map should not be active in maps.json")
    _assert(not DataRegistry.has_id("asset_sets", "asset_proxy_dark_fantasy"), "Failed proxy asset set should not be active")
    _assert(not DataRegistry.has_id("world_objects", "world_object_proxy_chest"), "Failed proxy world-object definitions should not be active")
    _assert(not FileAccess.file_exists("res://assets/tilesets/proxy_dark_fantasy_atlas.png"), "Failed proxy atlas should be removed from active assets")
    _assert(not FileAccess.file_exists("res://scenes/maps/ProbeRuins.tscn"), "Failed probe scene should be removed from active maps")
    _assert(ResourceLoader.exists("res://scenes/world/Chest.tscn"), "Chest scene should remain available")
    _assert(ResourceLoader.exists("res://scenes/world/Door.tscn"), "Door scene should remain available")
    _assert(ResourceLoader.exists("res://scenes/world/Switch.tscn"), "Switch scene should remain available")
    _assert(FileAccess.file_exists("res://scripts/world/AuthoredMap.gd"), "AuthoredMap code should remain available for the next governed asset probe")

func _test_placeholder_collision_scale() -> void:
    var player := PlayerScene.instantiate()
    var player_collision := player.get_node("CollisionShape2D") as CollisionShape2D
    var player_rect := player_collision.shape as RectangleShape2D
    _assert(_near_vec(player_rect.size, WorldScale.PLAYER_COLLISION_SIZE), "Player collision should match placeholder visual scale")
    _assert(_near_vec(player_collision.position, WorldScale.PLAYER_COLLISION_OFFSET), "Player collision should be aligned with the placeholder visual")
    player.free()

    var chest := ChestScene.instantiate()
    var chest_collision := chest.get_node("CollisionShape2D") as CollisionShape2D
    var chest_rect := chest_collision.shape as RectangleShape2D
    _assert(chest_rect.size.x >= 40.0 and chest_rect.size.y >= 30.0, "Chest collision should block its visible placeholder body")
    chest.free()

func _test_world_objects_still_work() -> void:
    GameState.reset_to_new_game()
    var root := Node2D.new()
    root.name = "M10WorldObjectSmokeRoot"
    add_child(root)

    var chest := ChestScene.instantiate() as Chest
    chest.persistent_id = "chest_m10_smoke_001"
    chest.loot_items = [{"id": "item_health_potion", "count": 1}]
    root.add_child(chest)

    var door := DoorScene.instantiate() as Door
    door.persistent_id = "door_m10_smoke_001"
    door.position = Vector2(64, 0)
    root.add_child(door)

    var switch := SwitchScene.instantiate() as Switch
    switch.persistent_id = "switch_m10_smoke_001"
    switch.target_persistent_id = "door_m10_smoke_001"
    switch.position = Vector2(128, 0)
    root.add_child(switch)
    await _frames(2)

    var potion_count := InventoryManager.get_count("item_health_potion")
    _assert(chest.open(), "Chest should open")
    _assert(InventoryManager.get_count("item_health_potion") == potion_count + 1, "Chest should grant loot")
    _assert(PersistentWorldObject.has_state("chest_m10_smoke_001", PersistentWorldObject.STATE_OPENED), "Chest state should persist")
    _assert(not door.is_open(), "Door should start closed")
    _assert(switch.activate(), "Switch should activate")
    _assert(door.is_open(), "Switch should open its target door")
    _assert(PersistentWorldObject.has_state("door_m10_smoke_001", PersistentWorldObject.STATE_OPEN), "Door state should persist")
    _assert(PersistentWorldObject.has_state("switch_m10_smoke_001", PersistentWorldObject.STATE_ON), "Switch state should persist")

    root.queue_free()

func _frames(count: int) -> void:
    for _i in range(count):
        await get_tree().process_frame

func _assert(condition: bool, message: String) -> void:
    if not condition:
        _failures.append(message)

func _near_vec(a: Vector2, b: Vector2, epsilon: float = 0.01) -> bool:
    return a.distance_to(b) <= epsilon
