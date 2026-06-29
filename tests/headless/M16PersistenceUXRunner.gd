extends Node
## Headless regression for M16 persistence & UX hardening: save slots + metadata, version
## migration + rejection, autosave wiring, game-over/respawn, settings persistence, and trade
## feedback. UI scenes are exercised indirectly through the managers they drive.

const SLOT_A := 80
const SLOT_B := 81
const SLOT_MIGRATE := 82
const SLOT_REJECT := 83

var _failures: Array[String] = []

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    _run.call_deferred()

func _run() -> void:
    print("[M16] Persistence/UX runner starting")
    _test_save_slots_and_metadata()
    _test_migration_and_rejection()
    await _test_autosave()
    _test_game_over_load()
    _test_game_over_restart()
    _test_settings_persistence()
    _test_trade_feedback()
    _cleanup()
    await get_tree().process_frame

    if _failures.is_empty():
        print("[M16] Persistence/UX runner OK")
        get_tree().quit(0)
    else:
        for failure in _failures:
            push_error("[M16] %s" % failure)
        print("[M16] Persistence/UX runner FAILED with %d failure(s)" % _failures.size())
        get_tree().quit(1)

func _test_save_slots_and_metadata() -> void:
    get_tree().paused = false
    GameState.reset_to_new_game()
    GameState.current_map = "map_village"
    GameState.player["gold"] = 42
    GameState.player["stats"]["level"] = 3
    _assert(SaveManager.save_game(SLOT_A), "save to slot A should succeed")
    _assert(SaveManager.has_save(SLOT_A), "slot A should exist after save")

    var info := SaveManager.get_save_info(SLOT_A)
    _assert(bool(info.get("exists", false)), "slot A info should report exists")
    _assert(int(info.get("gold", 0)) == 42, "slot A info should carry gold")
    _assert(int(info.get("level", 0)) == 3, "slot A info should carry level")
    _assert(String(info.get("current_map", "")) == "map_village", "slot A info should carry the map")
    _assert(String(info.get("map_display", "")) == "Valdombra Village", "slot A info should resolve the map display name")

    GameState.player["gold"] = 7
    _assert(SaveManager.save_game(SLOT_B), "save to slot B should succeed")
    _assert(int(SaveManager.get_save_info(SLOT_A).get("gold", 0)) == 42, "slot A should be untouched by the slot B save")
    _assert(int(SaveManager.get_save_info(SLOT_B).get("gold", 0)) == 7, "slot B should carry its own gold")

    var saves := SaveManager.list_saves(3)
    _assert(saves.size() == 3, "list_saves should return the requested number of slots")
    _assert(int(saves[0].get("slot", -1)) == 0, "list_saves should be slot-indexed")

    _assert(SaveManager.delete_save(SLOT_B), "delete slot B should succeed")
    _assert(not SaveManager.has_save(SLOT_B), "slot B should be gone after delete")

func _test_migration_and_rejection() -> void:
    SaveManager.save_game(SLOT_A)  # ensures the save dir exists
    var legacy := {
        "version": 1,
        "saved_at": "2026-01-01T00:00:00Z",
        "current_map": "map_village",
        "player": {
            "position": {"x": 10, "y": 20},
            "stats": {"level": 2, "xp": 5, "max_health": 30, "health": 20, "damage": 6},
            "gold": 11, "inventory": [], "equipment": {}
        },
        "quests": {"active": {}, "completed": []},
        "factions": {}, "flags": {}, "world_objects": {}, "kills": {}
    }
    _write_json(SaveManager.get_save_path(SLOT_MIGRATE), legacy)
    GameState.reset_to_new_game()
    _assert(SaveManager.load_game(SLOT_MIGRATE), "a legacy v1 save should load via migration")
    _assert(int(GameState.player.get("gold", 0)) == 11, "migrated save should restore gold")
    _assert(GameState.player.get("skills", null) is Dictionary, "migration should provide a skills dict")

    _write_json(SaveManager.get_save_path(SLOT_REJECT), {"version": 999, "player": {}, "current_map": "map_village"})
    _assert(not SaveManager.load_game(SLOT_REJECT), "a newer-version save should be rejected, not loaded")

func _test_autosave() -> void:
    get_tree().paused = false
    GameState.reset_to_new_game()
    GameState.current_map = "map_village"
    GameState.player["gold"] = 55
    _delete_file(SaveManager._autosave_path())
    EventBus.quest_completed.emit("quest_first_dungeon")  # SaveManager autosaves (deferred) on this
    await get_tree().process_frame
    await get_tree().process_frame
    _assert(SaveManager.has_autosave(), "completing a quest should write an autosave")
    GameState.reset_to_new_game()
    _assert(SaveManager.load_autosave(), "the autosave should load")
    _assert(int(GameState.player.get("gold", 0)) == 55, "autosave should restore gold")

func _test_game_over_load() -> void:
    # Dying shows the save screen to reload a save (no in-place respawn, no gold penalty).
    get_tree().paused = false
    GameState.reset_to_new_game()
    GameState.current_map = ""  # no SceneLoader bound in headless
    GameState.player["gold"] = 30
    _assert(SaveManager.save_game(SLOT_A), "should have a save to reload")

    GameState.player["gold"] = 5  # diverge the live state, then die
    GameState.player["stats"]["health"] = 0
    var respawned := [false]
    var on_respawn := func(): respawned[0] = true
    EventBus.player_respawned.connect(on_respawn)

    EventBus.player_died.emit()
    _assert(GameOverManager.is_game_over, "player_died should enter game-over")
    _assert(get_tree().paused, "game-over should pause the tree")
    _assert(GameOverManager.has_any_save(), "a save should be available to load")

    # The GameOver screen's slot list loads a save, then resumes.
    _assert(SaveManager.load_game(SLOT_A), "loading a save should succeed")
    GameOverManager.resume_after_load()
    _assert(not GameOverManager.is_game_over, "loading should clear game-over")
    _assert(not get_tree().paused, "resuming should unpause the tree")
    _assert(int(GameState.player.get("gold", 0)) == 30, "loaded save should restore pre-death gold (no penalty)")
    _assert(respawned[0], "resume_after_load should emit player_respawned")
    EventBus.player_respawned.disconnect(on_respawn)

func _test_game_over_restart() -> void:
    # Fallback: no save exists, so the GameOver screen offers a fresh start.
    get_tree().paused = false
    GameState.reset_to_new_game()
    GameState.current_map = ""
    _delete_file(SaveManager._autosave_path())
    for slot in [0, 1, 2, SLOT_A]:
        SaveManager.delete_save(slot)
    GameState.player["stats"]["health"] = 0
    EventBus.player_died.emit()
    _assert(not GameOverManager.has_any_save(), "no saves should exist for the restart fallback")
    GameOverManager.restart_new_game()
    _assert(not GameOverManager.is_game_over, "restart should clear game-over")
    _assert(not get_tree().paused, "restart should unpause the tree")
    _assert(int(GameState.player["stats"]["health"]) == EquipmentManager.get_effective_stat("max_health"), "restart should restore full health")

func _test_settings_persistence() -> void:
    SettingsManager.set_master_volume(0.4)
    _assert(abs(SettingsManager.get_master_volume() - 0.4) < 0.001, "master volume should be set")
    SettingsManager.master_volume = 0.9  # bypass to prove reload reads the persisted file
    SettingsManager.load_settings()
    _assert(abs(SettingsManager.get_master_volume() - 0.4) < 0.001, "settings should persist across reload")
    SettingsManager.set_master_volume(1.0)

func _test_trade_feedback() -> void:
    GameState.reset_to_new_game()
    GameState.player["gold"] = 0
    var reason := [""]
    var on_fail := func(_id, r): reason[0] = String(r)
    EventBus.trade_failed.connect(on_fail)
    _assert(not EconomyManager.buy("item_health_potion", 1), "buying with no gold should fail")
    _assert(reason[0] == "insufficient_gold", "a broke buy should emit trade_failed insufficient_gold")
    EventBus.trade_failed.disconnect(on_fail)

func _write_json(path: String, data: Dictionary) -> void:
    var file := FileAccess.open(path, FileAccess.WRITE)
    if file:
        file.store_string(JSON.stringify(data, "\t"))

func _delete_file(path: String) -> void:
    if FileAccess.file_exists(path):
        var dir := DirAccess.open(path.get_base_dir())
        if dir:
            dir.remove(path.get_file())

func _cleanup() -> void:
    for slot in [SLOT_A, SLOT_B, SLOT_MIGRATE, SLOT_REJECT]:
        SaveManager.delete_save(slot)
    _delete_file(SaveManager._autosave_path())

func _assert(condition: bool, message: String) -> void:
    if not condition:
        _failures.append(message)
