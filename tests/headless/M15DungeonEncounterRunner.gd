extends Node

const TrialDungeonScene := preload("res://scenes/maps/TrialDungeon.tscn")
const PersistentWorldObject := preload("res://scripts/world/PersistentWorldObject.gd")
const WorldScale := preload("res://scripts/core/WorldScale.gd")

const SAVE_SLOT := 97

var _failures: Array[String] = []

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    _run.call_deferred()

func _run() -> void:
    print("[M15] Dungeon/encounter runner starting")
    _test_data_validation()
    _test_dungeon_authoring_contract()
    await _test_dungeon_runtime_flow_and_persistence()
    _cleanup_save_slot(SAVE_SLOT)
    await _frames(2)

    if _failures.is_empty():
        print("[M15] Dungeon/encounter runner OK")
        get_tree().quit(0)
    else:
        for failure in _failures:
            push_error("[M15] %s" % failure)
        print("[M15] Dungeon/encounter runner FAILED with %d failure(s)" % _failures.size())
        get_tree().quit(1)

func _test_data_validation() -> void:
    _assert(DataRegistry.validate_all(), "DataRegistry validation failed: %s" % str(DataRegistry.get_validation_errors()))
    _assert(DataRegistry.has_id("maps", "map_trial_dungeon_01"), "M15 trial dungeon map should be registered")
    _assert(DataRegistry.has_id("items", "item_trial_dungeon_key"), "M15 dungeon key item should be registered")
    _assert(DataRegistry.has_id("enemies", "enemy_trial_sentinel"), "M15 boss enemy should be registered")

func _test_dungeon_authoring_contract() -> void:
    var map := DataRegistry.get_map("map_trial_dungeon_01")
    var authoring: Dictionary = map.get("authoring", {})
    _assert(String(map.get("dev_role", "")) == "dungeon_fixture", "Trial dungeon should be marked as a dungeon fixture")
    _assert((authoring.get("collision_rects", []) as Array).size() >= 4, "Dungeon should declare authored collision rectangles")
    var encounters: Array = authoring.get("encounters", [])
    _assert(encounters.size() == 1, "Dungeon should declare one boss encounter")
    if not encounters.is_empty():
        var encounter: Dictionary = encounters[0]
        _assert(String(encounter.get("id", "")) == "encounter_trial_sentinel", "Boss encounter should have a stable encounter id")
        _assert(String(encounter.get("kind", "")) == "boss", "Boss encounter should be typed as boss")
        _assert((encounter.get("enemy_persistent_ids", []) as Array).has("enemy_trial_sentinel_001"), "Boss encounter should reference the sentinel persistent id")
        _assert((encounter.get("reward_persistent_ids", []) as Array).has("chest_trial_reward_001"), "Boss encounter should reference the reward chest")

func _test_dungeon_runtime_flow_and_persistence() -> void:
    GameState.reset_to_new_game()
    GameState.current_map = "map_trial_dungeon_01"
    FactionManager.ensure_defaults()
    var dungeon: Node2D = await _spawn_dungeon()

    var locked_door: Door = _find_by_persistent_id(dungeon, "door_trial_locked_001") as Door
    var reward_gate: Door = _find_by_persistent_id(dungeon, "door_trial_reward_gate_001") as Door
    var gate_switch: Switch = _find_by_persistent_id(dungeon, "switch_trial_reward_gate_001") as Switch
    var reward_chest: Chest = _find_by_persistent_id(dungeon, "chest_trial_reward_001") as Chest
    var boss: Node2D = _find_by_persistent_id(dungeon, "enemy_trial_sentinel_001") as Node2D

    _assert(locked_door != null, "Locked dungeon door should exist")
    _assert(reward_gate != null, "Reward gate should exist")
    _assert(gate_switch != null, "Gate switch should exist")
    _assert(reward_chest != null, "Reward chest should exist")
    _assert(boss != null, "Boss enemy should exist")

    _assert(locked_door != null and locked_door.is_locked(), "Locked door should require the dungeon key")
    _assert(locked_door != null and not locked_door.open(), "Locked door should refuse opening without the key")
    _assert(InventoryManager.add("item_trial_dungeon_key", 1), "Dungeon key should be addable to inventory")
    _assert(locked_door != null and locked_door.open(), "Locked door should open with the key")
    _assert(InventoryManager.get_count("item_trial_dungeon_key") == 0, "Dungeon key should be consumed by the locked door")
    _assert(PersistentWorldObject.has_state("door_trial_locked_001", PersistentWorldObject.STATE_OPEN), "Locked door open state should persist")

    _assert(reward_gate != null and not reward_gate.is_open(), "Reward gate should start closed")
    _assert(gate_switch != null and gate_switch.activate(), "Gate switch should activate")
    _assert(reward_gate != null and reward_gate.is_open(), "Gate switch should open reward gate")
    _assert(PersistentWorldObject.has_state("switch_trial_reward_gate_001", PersistentWorldObject.STATE_ON), "Switch on state should persist")

    if boss != null:
        CombatSystem.damage_actor(null, boss, 999, "fire", 99)
    await _frames(30)
    _assert(PersistentWorldObject.has_state("enemy_trial_sentinel_001", PersistentWorldObject.STATE_DEAD), "Boss death state should persist")
    _assert(int(GameState.kills.get("enemy_trial_sentinel", 0)) == 1, "Boss kill should update kill state")

    var core_count := InventoryManager.get_count("item_sentinel_core")
    var potion_count := InventoryManager.get_count("item_health_potion")
    _assert(reward_chest != null and reward_chest.open(), "Reward chest should open")
    _assert(InventoryManager.get_count("item_sentinel_core") == core_count + 1, "Reward chest should grant sentinel core")
    _assert(InventoryManager.get_count("item_health_potion") == potion_count + 2, "Reward chest should grant potions")
    _assert(PersistentWorldObject.has_state("chest_trial_reward_001", PersistentWorldObject.STATE_OPENED), "Reward chest state should persist")

    _assert(SaveManager.save_game(SAVE_SLOT), "Dungeon state save should succeed")
    dungeon.queue_free()
    await _frames(2)

    GameState.reset_to_new_game()
    _assert(SaveManager.load_game(SAVE_SLOT), "Dungeon state load should succeed")
    var reloaded: Node2D = await _spawn_dungeon()
    await _frames(3)

    var reloaded_locked: Door = _find_by_persistent_id(reloaded, "door_trial_locked_001") as Door
    var reloaded_gate: Door = _find_by_persistent_id(reloaded, "door_trial_reward_gate_001") as Door
    var reloaded_switch: Switch = _find_by_persistent_id(reloaded, "switch_trial_reward_gate_001") as Switch
    var reloaded_chest: Chest = _find_by_persistent_id(reloaded, "chest_trial_reward_001") as Chest
    var reloaded_boss := _find_by_persistent_id(reloaded, "enemy_trial_sentinel_001")

    _assert(reloaded_locked != null and reloaded_locked.is_open(), "Loaded locked door should remain open")
    _assert(reloaded_gate != null and reloaded_gate.is_open(), "Loaded reward gate should remain open")
    _assert(reloaded_switch != null and reloaded_switch.is_on(), "Loaded switch should remain on")
    _assert(reloaded_chest != null and reloaded_chest.is_opened(), "Loaded reward chest should remain opened")
    _assert(reloaded_boss == null, "Loaded dead boss should not respawn")

    reloaded.queue_free()

func _spawn_dungeon() -> Node2D:
    var dungeon := TrialDungeonScene.instantiate() as Node2D
    add_child(dungeon)
    await _frames(3)
    return dungeon

func _find_by_persistent_id(root: Node, target_id: String) -> Node:
    if root == null:
        return null
    var nodes: Array[Node] = [root]
    var index := 0
    while index < nodes.size():
        var node := nodes[index]
        var node_id = node.get("persistent_id")
        if node_id != null and String(node_id) == target_id:
            return node
        for child in node.get_children():
            if child is Node:
                nodes.append(child)
        index += 1
    return null

func _frames(count: int) -> void:
    for _i in range(count):
        await get_tree().process_frame

func _cleanup_save_slot(slot: int) -> void:
    var dir := DirAccess.open("user://saves")
    if dir:
        dir.remove("slot_%d.json" % slot)

func _assert(condition: bool, message: String) -> void:
    if not condition:
        _failures.append(message)
