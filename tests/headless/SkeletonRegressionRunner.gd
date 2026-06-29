extends Node
## Headless regression for the content-stripped RPG skeleton. It verifies the scalable systems
## without depending on production maps, story, generated art, or prototype content.

const PlayerScene := preload("res://scenes/player/Player.tscn")
const EnemyScene := preload("res://scenes/enemies/EnemyBase.tscn")

const SAVE_SLOT := 0

var _failures: Array[String] = []
var _world: Node2D = null
var _player: Node2D = null

func _ready() -> void:
    print("[Skeleton] Regression runner starting")
    _cleanup_saves()
    _reset_runtime()
    _test_data_contract()
    await _test_bootstrap_map_loading()
    _test_inventory_equipment_economy()
    _test_quest_dialogue_faction()
    await _test_combat_skills_save_game_over()

    if _failures.is_empty():
        print("[Skeleton] Regression runner OK")
        get_tree().quit(0)
    else:
        for failure in _failures:
            push_error(failure)
        print("[Skeleton] Regression runner FAILED with %d failure(s)" % _failures.size())
        get_tree().quit(1)

func _reset_runtime() -> void:
    get_tree().paused = false
    GameOverManager.is_game_over = false
    GameState.reset_to_new_game()
    FactionManager.reset_to_defaults()
    SkillManager.ensure_player_skills()

func _test_data_contract() -> void:
    _assert(DataRegistry.is_valid(), "DataRegistry should validate the stripped skeleton data")
    _assert(DataRegistry.all("maps").size() == 1, "Only the bootstrap map should remain active")
    _assert(DataRegistry.has_id("maps", "map_bootstrap"), "Bootstrap map should be registered")
    _assert(DataRegistry.all("asset_sets").is_empty(), "Active asset sets should be empty after purge")
    _assert(DataRegistry.all("generated_assets").is_empty(), "Generated asset registry should be empty after purge")
    _assert(DataRegistry.has_id("quests", "quest_fixture_flow"), "Neutral quest fixture should be registered")
    _assert(DataRegistry.has_id("dialogues", "dialogue_fixture_actions"), "Neutral dialogue fixture should be registered")
    _assert(DataRegistry.has_id("enemies", "enemy_fixture_sentinel"), "Neutral enemy fixture should be registered")

func _test_bootstrap_map_loading() -> void:
    _reset_runtime()
    _world = Node2D.new()
    _world.name = "TestWorldRoot"
    add_child(_world)
    _player = PlayerScene.instantiate() as Node2D
    _world.add_child(_player)

    SceneLoader.bind(_world, _player)
    SceneLoader.change_map("map_bootstrap", "spawn_default")
    await get_tree().process_frame

    _assert(GameState.current_map == "map_bootstrap", "SceneLoader should load the bootstrap map")
    _assert(SceneLoader.get_current_map_node() != null, "SceneLoader should expose the current map node")
    _assert(_player.global_position.distance_to(Vector2.ZERO) < 0.01, "Player should spawn at the bootstrap spawn")

func _test_inventory_equipment_economy() -> void:
    _reset_runtime()
    _assert(InventoryManager.add("item_fixture_weapon", 1), "Fixture weapon should be addable")
    _assert(InventoryManager.add("item_fixture_armor", 1), "Fixture armor should be addable")
    _assert(EquipmentManager.equip("item_fixture_weapon"), "Fixture weapon should equip")
    _assert(EquipmentManager.equip("item_fixture_armor"), "Fixture armor should equip")
    _assert(EquipmentManager.get_effective_stat("damage") == 12, "Equipped weapon should add damage")
    _assert(EquipmentManager.get_effective_stat("max_health") == 40, "Equipped armor should add max health")

    GameState.player["gold"] = 20
    _assert(EconomyManager.buy("item_fixture_consumable", 1, "merchant_fixture_basic"), "Merchant buy should work")
    _assert(EconomyManager.get_gold() == 10, "Merchant buy should spend fixture gold")
    _assert(InventoryManager.get_count("item_fixture_consumable") == 1, "Bought item should enter inventory")
    _assert(EconomyManager.sell("item_fixture_consumable", 1, "merchant_fixture_basic"), "Merchant sell should work")
    _assert(EconomyManager.get_gold() == 15, "Merchant sell should credit fixture gold")

    InventoryManager.add("item_fixture_consumable", 1)
    var stats: Dictionary = GameState.player.get("stats", {})
    stats["health"] = 5
    GameState.player["stats"] = stats
    _assert(InventoryManager.use_item("item_fixture_consumable"), "Consumable should heal when health is low")
    _assert(int(GameState.player.get("stats", {}).get("health", 0)) == 30, "Consumable should restore health")

func _test_quest_dialogue_faction() -> void:
    _reset_runtime()
    _assert(FactionManager.are_hostile("faction_fixture_hostile", "faction_fixture_player"), "Hostile fixture faction should target player faction")
    FactionManager.change_reputation("faction_fixture_neutral", 30)
    _assert(FactionManager.is_friendly_to_player("faction_fixture_neutral"), "Faction reputation should become friendly")

    QuestManager.start_quest("quest_fixture_flow")
    _assert(QuestManager.get_stage("quest_fixture_flow") == 0, "Fixture quest should start at stage 0")
    EventBus.map_changed.emit("map_bootstrap")
    _assert(QuestManager.get_stage("quest_fixture_flow") == 10, "Map entry should advance fixture quest")
    InventoryManager.add("item_fixture_key", 1)
    _assert(QuestManager.get_stage("quest_fixture_flow") == 20, "Fixture key should advance fixture quest")
    EventBus.npc_talked.emit("npc_fixture_guide")
    _assert(QuestManager.is_completed("quest_fixture_flow"), "Talking to fixture guide should complete fixture quest")
    _assert(InventoryManager.get_count("item_fixture_material") >= 1, "Fixture quest reward should grant material")

    _reset_runtime()
    DialogueManager.start("dialogue_fixture_actions")
    _assert(DialogueManager.is_active(), "Fixture dialogue should start")
    DialogueManager.choose(0)
    _assert(not DialogueManager.is_active(), "Fixture dialogue should end after choice")
    _assert(InventoryManager.get_count("item_fixture_key") == 1, "Dialogue action reward should grant fixture key")
    _assert(int(GameState.player.get("gold", 0)) == 3, "Dialogue reward should grant fixture gold")

    DialogueManager.start("dialogue_fixture_branch")
    DialogueManager.choose(0)
    _assert(QuestManager.is_completed("quest_fixture_branch"), "Branch dialogue should complete the branch quest")

    DialogueManager.start("dialogue_fixture_guard")
    DialogueManager.advance()
    DialogueManager.advance()
    _assert(not DialogueManager.is_active(), "Guarded dialogue with no visible choices should not soft-lock")

func _test_combat_skills_save_game_over() -> void:
    _reset_runtime()
    if _world == null or not is_instance_valid(_world):
        await _test_bootstrap_map_loading()
    else:
        SceneLoader.bind(_world, _player)
        SceneLoader.change_map("map_bootstrap", "spawn_default")
        await get_tree().process_frame

    var enemy := EnemyScene.instantiate() as Node2D
    enemy.set("enemy_id", "enemy_fixture_sentinel")
    enemy.set("persistent_id", "enemy_fixture_sentinel_001")
    _world.add_child(enemy)
    enemy.global_position = Vector2(24, 0)
    await get_tree().process_frame

    var damage := CombatSystem.damage_actor(_player, enemy, 10, "fire", 1)
    _assert(damage > 0, "CombatSystem should apply typed damage to fixture enemy")

    var abilities: Node = _player.get_node_or_null("PlayerAbilities")
    if abilities and abilities.has_method("use_ability"):
        _assert(abilities.use_ability("skill_fixture_area"), "Fixture area ability should hit nearby enemy")
        _assert(SkillManager.get_xp("skill_fixture_area") > 0, "Using a fixture ability should grant skill XP")

    GameState.current_map = "map_bootstrap"
    GameState.player["gold"] = 42
    _assert(SaveManager.save_game(SAVE_SLOT), "Skeleton save should succeed")
    GameState.player["gold"] = 0
    _assert(SaveManager.load_game(SAVE_SLOT), "Skeleton load should succeed")
    _assert(int(GameState.player.get("gold", 0)) == 42, "Skeleton load should restore player gold")
    var info := SaveManager.get_save_info(SAVE_SLOT)
    _assert(String(info.get("map_display", "")) == "Bootstrap Map", "Save info should resolve bootstrap map display")

    EventBus.player_died.emit()
    _assert(GameOverManager.is_game_over, "Player death should enter game-over state")
    _assert(get_tree().paused, "Game over should pause the tree")
    _assert(SaveManager.load_game(SAVE_SLOT), "Game over should be able to load a save")
    GameOverManager.resume_after_load()
    _assert(not GameOverManager.is_game_over, "Game over should resume after load")
    _assert(not get_tree().paused, "Tree should unpause after game-over load")

func _cleanup_saves() -> void:
    for slot in range(3):
        SaveManager.delete_save(slot)
    var dir := DirAccess.open("user://saves")
    if dir != null and dir.file_exists("autosave.json"):
        dir.remove("autosave.json")

func _assert(condition: bool, message: String) -> void:
    if not condition:
        _failures.append(message)
