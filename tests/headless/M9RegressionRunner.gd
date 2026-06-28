extends Node

const MainScene := preload("res://scenes/main/Main.tscn")
const LootComponentScript := preload("res://scripts/components/LootComponent.gd")
const PersistentWorldObject := preload("res://scripts/world/PersistentWorldObject.gd")

const SAVE_SLOT := 91
const DYNAMIC_SAVE_SLOT := 92
const SAVE_TEST_POSITION := Vector2(123, 80)

var _failures: Array[String] = []
var _main: Node = null

func _ready() -> void:
    _run.call_deferred()

func _run() -> void:
    seed(1)
    print("[M9] Regression runner starting")
    _test_data_validation()
    await _test_boot_and_map_transitions()
    await _test_walk_on_transition_triggers()
    await _test_first_quest_flow()
    await _test_save_load()
    await _test_progression()
    await _test_dynamic_pickup_persistence()
    _cleanup_main()
    _cleanup_save_slots()
    await _frames(2)

    if _failures.is_empty():
        print("[M9] Regression runner OK")
        get_tree().quit(0)
    else:
        for failure in _failures:
            push_error("[M9] %s" % failure)
        print("[M9] Regression runner FAILED with %d failure(s)" % _failures.size())
        get_tree().quit(1)

func _test_data_validation() -> void:
    _assert(DataRegistry.validate_all(), "DataRegistry validation failed: %s" % str(DataRegistry.get_validation_errors()))
    for action in ["inventory_toggle", "quest_journal_toggle", "quest_debug_toggle", "attack_primary", "save_game", "load_game"]:
        _assert(InputMap.has_action(action), "Missing input action '%s'" % action)

func _test_boot_and_map_transitions() -> void:
    await _new_game()
    _assert(SceneLoader.is_bound(), "SceneLoader should be bound after boot")
    _assert(GameState.current_map == "map_village", "Boot should start on map_village")
    _assert(SceneLoader.get_player() != null, "Boot should create the persistent player")

    SceneLoader.change_map("map_forest", "spawn_from_village")
    await _frames(2)
    _assert(GameState.current_map == "map_forest", "SceneLoader should switch to map_forest")
    _assert(_near(SceneLoader.get_player().global_position, Vector2(96, 200)), "Player should use forest spawn_from_village")

    SceneLoader.change_map("map_cave_01", "spawn_from_forest")
    await _frames(2)
    _assert(GameState.current_map == "map_cave_01", "SceneLoader should switch to map_cave_01")
    _assert(_near(SceneLoader.get_player().global_position, Vector2(80, 160)), "Player should use cave spawn_from_forest")

func _test_walk_on_transition_triggers() -> void:
    await _new_game()
    await _wait_transition_ready()
    _trigger_current_transition("ToForest")
    await _wait_transition_ready()
    _assert(GameState.current_map == "map_forest", "Village transition should enter forest and not bounce back")
    _assert(_near(SceneLoader.get_player().global_position, Vector2(96, 200)), "Village transition should use forest spawn_from_village")

    _trigger_current_transition("ToAssetProbe")
    await _wait_transition_ready()
    _assert(GameState.current_map == "map_m10r_asset_playground", "Forest asset probe transition should enter the M10R playground")
    _assert(_near(SceneLoader.get_player().global_position, Vector2(72, 160)), "Asset probe transition should use playground spawn_from_forest")

    _trigger_current_transition("ToForest")
    await _wait_transition_ready()
    _assert(GameState.current_map == "map_forest", "M10R playground transition should return to forest")
    _assert(_near(SceneLoader.get_player().global_position, Vector2(320, 330)), "M10R playground transition should use forest spawn_from_asset_probe")

func _test_first_quest_flow() -> void:
    await _new_game()
    QuestManager.start_quest("quest_first_dungeon")
    _assert(QuestManager.get_stage("quest_first_dungeon") == 0, "First quest should start at stage 0")

    SceneLoader.change_map("map_cave_01", "spawn_from_forest")
    await _frames(2)
    _assert(QuestManager.get_stage("quest_first_dungeon") == 10, "Entering cave should advance quest to stage 10")

    _assert(InventoryManager.add("item_ancient_iron_fragment", 1), "Adding fragment should succeed")
    _assert(QuestManager.get_stage("quest_first_dungeon") == 20, "Fragment pickup should advance quest to stage 20")

    EventBus.npc_talked.emit("npc_blacksmith_valdombra")
    await _frames(1)
    _assert(QuestManager.is_completed("quest_first_dungeon"), "Talking to blacksmith should complete the first quest")
    _assert(int(GameState.player.get("gold", 0)) == 20, "Quest reward should grant 20 gold")
    _assert(InventoryManager.get_count("item_iron_sword") == 1, "Quest reward should grant an iron sword")
    _assert(int(GameState.player.get("stats", {}).get("level", 1)) == 2, "Quest XP should level the player to 2")

func _test_save_load() -> void:
    await _new_game()
    SceneLoader.change_map("map_cave_01", "spawn_from_forest")
    await _frames(2)
    SceneLoader.get_player().global_position = SAVE_TEST_POSITION
    GameState.player["gold"] = 7
    _assert(InventoryManager.add("item_health_potion", 3), "Adding potions before save should succeed")
    PersistentWorldObject.set_state("test_world_object_001", PersistentWorldObject.STATE_COLLECTED)
    _assert(SaveManager.save_game(SAVE_SLOT), "SaveManager.save_game should succeed")

    GameState.reset_to_new_game()
    _assert(SaveManager.load_game(SAVE_SLOT), "SaveManager.load_game should succeed")
    await _frames(3)
    _assert(GameState.current_map == "map_cave_01", "Load should restore current map")
    _assert(_near(SceneLoader.get_player().global_position, SAVE_TEST_POSITION), "Load should restore player position")
    _assert(int(GameState.player.get("gold", 0)) == 7, "Load should restore gold")
    _assert(InventoryManager.get_count("item_health_potion") == 3, "Load should restore inventory")
    _assert(PersistentWorldObject.has_state("test_world_object_001", PersistentWorldObject.STATE_COLLECTED), "Load should restore world object state")

func _test_progression() -> void:
    await _new_game()
    ProgressionManager.add_xp(50)
    var stats: Dictionary = GameState.player.get("stats", {})
    _assert(int(stats.get("level", 1)) == 2, "50 XP should level the player to 2")
    _assert(int(stats.get("max_health", 0)) == 35, "Level 2 should increase max health")
    _assert(int(stats.get("damage", 0)) == 7, "Level 2 should increase damage")

func _test_dynamic_pickup_persistence() -> void:
    await _new_game()
    var loot = LootComponentScript.new()
    loot.loot_table = [{"id": "item_health_potion", "chance": 1.0, "count": 2}]
    loot.drop(Vector2(150, 150), SceneLoader.get_current_map_node(), "enemy_test_slime_001")
    loot.free()
    await _frames(2)

    var persistent_id := "drop_enemy_test_slime_001_00"
    var state: Dictionary = GameState.world_objects.get(persistent_id, {})
    _assert(String(state.get("state", "")) == PersistentWorldObject.STATE_ACTIVE, "Dynamic pickup should be registered active")
    _assert(String(state.get("kind", "")) == PersistentWorldObject.KIND_PICKUP, "Dynamic pickup should store kind=pickup")
    _assert(String(state.get("map_id", "")) == "map_village", "Dynamic pickup should store its source map")
    _assert(_find_by_persistent_id(SceneLoader.get_current_map_node(), persistent_id) != null, "Dynamic pickup should exist in the live map")
    _assert(SaveManager.save_game(DYNAMIC_SAVE_SLOT), "Dynamic pickup save should succeed")

    GameState.reset_to_new_game()
    _assert(SaveManager.load_game(DYNAMIC_SAVE_SLOT), "Dynamic pickup load should succeed")
    await _frames(3)
    _assert(_find_by_persistent_id(SceneLoader.get_current_map_node(), persistent_id) != null, "Active dynamic pickup should respawn on load")

    PersistentWorldObject.set_state(persistent_id, PersistentWorldObject.STATE_COLLECTED)
    SceneLoader.change_map("map_village", "spawn_default", false)
    await _frames(3)
    _assert(_find_by_persistent_id(SceneLoader.get_current_map_node(), persistent_id) == null, "Collected dynamic pickup should not respawn")

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

func _cleanup_save_slots() -> void:
    var dir := DirAccess.open("user://saves")
    if dir == null:
        return
    dir.remove("slot_%d.json" % SAVE_SLOT)
    dir.remove("slot_%d.json" % DYNAMIC_SAVE_SLOT)

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

func _wait_transition_ready() -> void:
    await get_tree().create_timer(0.3).timeout
    await _frames(2)

func _trigger_current_transition(node_name: String) -> void:
    var map := SceneLoader.get_current_map_node()
    var transition := map.get_node_or_null(node_name) if map != null else null
    _assert(transition != null, "Expected transition node '%s' on current map" % node_name)
    if transition != null:
        transition.call("_on_body_entered", SceneLoader.get_player())

func _near(a: Vector2, b: Vector2, tolerance: float = 0.1) -> bool:
    return a.distance_to(b) <= tolerance

func _assert(condition: bool, message: String) -> void:
    if not condition:
        _failures.append(message)
