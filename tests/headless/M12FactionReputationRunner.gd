extends Node

const SAVE_SLOT := 93

var _failures: Array[String] = []

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    _run.call_deferred()

func _run() -> void:
    print("[M12] Faction reputation runner starting")
    _test_data_validation()
    _test_default_reputation_and_hostility()
    _test_reputation_good_path()
    _test_reputation_hostile_path()
    _test_reputation_save_load()
    _cleanup_save_slot()
    await get_tree().process_frame

    if _failures.is_empty():
        print("[M12] Faction reputation runner OK")
        get_tree().quit(0)
    else:
        for failure in _failures:
            push_error("[M12] %s" % failure)
        print("[M12] Faction reputation runner FAILED with %d failure(s)" % _failures.size())
        get_tree().quit(1)

func _test_data_validation() -> void:
    _assert(DataRegistry.validate_all(), "DataRegistry validation failed: %s" % str(DataRegistry.get_validation_errors()))
    for action in ["quest_debug_toggle"]:
        _assert(InputMap.has_action(action), "Missing input action '%s'" % action)
    var npc := DataRegistry.get_npc("npc_m12_reputation_tester")
    _assert(String(npc.get("role", "")) == "debug_tester", "M12 reputation tester should declare role metadata")
    _assert(npc.get("services", []).has("faction_debug"), "M12 reputation tester should declare services metadata")

func _test_default_reputation_and_hostility() -> void:
    GameState.reset_to_new_game()
    FactionManager.ensure_defaults()
    _assert(FactionManager.get_reputation("faction_valdombra_village") == 0, "Village default reputation should be 0")
    _assert(FactionManager.get_reputation("faction_monsters") == -100, "Monster default reputation should be -100")
    _assert(not FactionManager.is_hostile_to_player("faction_valdombra_village"), "Village should not start hostile to player")
    _assert(FactionManager.is_hostile_to_player("faction_monsters"), "Monsters should start hostile to player")
    _assert(FactionManager.are_hostile("faction_valdombra_village", "faction_monsters"), "Village should be hostile to monsters through faction data")

func _test_reputation_good_path() -> void:
    GameState.reset_to_new_game()
    FactionManager.ensure_defaults()

    DialogueManager.start("dialogue_m12_reputation_fixture")
    _assert(DialogueManager.is_active(), "M12 reputation fixture dialogue should start")
    DialogueManager.choose(0)
    _assert(QuestManager.get_stage("quest_m12_reputation_fixture") == 10, "Helping should move reputation fixture to stage 10")
    _assert(FactionManager.get_reputation("faction_valdombra_village") == 25, "Helping should add village reputation")
    _assert(FactionManager.is_friendly_to_player("faction_valdombra_village"), "Village should become friendly at trusted reputation")
    _assert(bool(GameState.flags.get("quest_m12_reputation_fixture_decision_helped", false)), "Helping should set the helped flag")
    _assert(not DialogueManager.is_active(), "Helping should end dialogue")

    DialogueManager.start("dialogue_m12_reputation_fixture")
    DialogueManager.choose(0)
    _assert(QuestManager.is_completed("quest_m12_reputation_fixture"), "Trusted reward should complete reputation fixture")
    _assert(bool(GameState.flags.get("quest_m12_reputation_fixture_outcome_trusted", false)), "Trusted reward should set outcome flag")
    _assert(int(GameState.player.get("stats", {}).get("xp", 0)) == 18, "Trusted outcome should grant XP")
    _assert(int(GameState.player.get("gold", 0)) == 6, "Trusted outcome should grant gold")
    _assert(InventoryManager.get_count("item_health_potion") == 1, "Trusted outcome should grant a potion")
    _assert(not FactionManager.is_hostile_to_player("faction_valdombra_village"), "Trusted village should not be hostile")

func _test_reputation_hostile_path() -> void:
    GameState.reset_to_new_game()
    FactionManager.ensure_defaults()

    DialogueManager.start("dialogue_m12_reputation_fixture")
    _assert(DialogueManager.is_active(), "M12 reputation hostile path dialogue should start")
    DialogueManager.choose(1)
    _assert(QuestManager.is_completed("quest_m12_reputation_fixture"), "Threatening should complete reputation fixture through hostile outcome")
    _assert(FactionManager.get_reputation("faction_valdombra_village") == -80, "Threatening should reduce village reputation")
    _assert(FactionManager.is_hostile_to_player("faction_valdombra_village"), "Low reputation should make village hostile to player")
    _assert(bool(GameState.flags.get("quest_m12_reputation_fixture_outcome_hostile", false)), "Threatening should set hostile outcome flag")
    _assert(int(GameState.player.get("gold", 0)) == 0, "Hostile outcome should not grant gold")
    _assert(InventoryManager.get_count("item_health_potion") == 0, "Hostile outcome should not grant a potion")

func _test_reputation_save_load() -> void:
    GameState.reset_to_new_game()
    FactionManager.ensure_defaults()
    FactionManager.set_reputation("faction_valdombra_village", -60)
    _assert(SaveManager.save_game(SAVE_SLOT), "SaveManager should save reputation fixture state")

    GameState.reset_to_new_game()
    FactionManager.ensure_defaults()
    _assert(FactionManager.get_reputation("faction_valdombra_village") == 0, "Reset should restore default village reputation before load")

    _assert(SaveManager.load_game(SAVE_SLOT), "SaveManager should load reputation fixture state")
    _assert(FactionManager.get_reputation("faction_valdombra_village") == -60, "Load should restore village reputation")
    _assert(FactionManager.is_hostile_to_player("faction_valdombra_village"), "Loaded low reputation should remain hostile")

func _cleanup_save_slot() -> void:
    var dir := DirAccess.open("user://saves")
    if dir:
        dir.remove("slot_%d.json" % SAVE_SLOT)

func _assert(condition: bool, message: String) -> void:
    if not condition:
        _failures.append(message)
