extends Node

var _failures: Array[String] = []

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    _run.call_deferred()

func _run() -> void:
    print("[M11] Dialogue actions runner starting")
    _test_data_validation()
    _test_dialogue_actions()
    await get_tree().process_frame

    if _failures.is_empty():
        print("[M11] Dialogue actions runner OK")
        get_tree().quit(0)
    else:
        for failure in _failures:
            push_error("[M11] %s" % failure)
        print("[M11] Dialogue actions runner FAILED with %d failure(s)" % _failures.size())
        get_tree().quit(1)

func _test_data_validation() -> void:
    _assert(DataRegistry.validate_all(), "DataRegistry validation failed: %s" % str(DataRegistry.get_validation_errors()))

func _test_dialogue_actions() -> void:
    get_tree().paused = false
    GameState.reset_to_new_game()
    _assert(not DialogueManager.is_active(), "DialogueManager should begin inactive")

    DialogueManager.start("dialogue_m11_action_fixture")
    _assert(DialogueManager.is_active(), "M11 fixture dialogue should start")
    _assert(InventoryManager.get_count("item_health_potion") == 1, "give_item/take_item should leave one potion")
    _assert(InventoryManager.get_count("item_ancient_iron_fragment") == 1, "give_reward should grant reward item")
    _assert(int(GameState.player.get("gold", 0)) == 7, "give_reward should grant gold")
    _assert(int(GameState.player.get("stats", {}).get("xp", 0)) == 10, "give_reward should grant XP")
    _assert(not GameState.flags.has("m11_fixture_running"), "clear_flag should remove the fixture flag")

    DialogueManager.choose(0)
    _assert(not DialogueManager.is_active(), "Choosing the fixture exit should end dialogue")
    _assert(not get_tree().paused, "DialogueManager should unpause the tree when ending")

func _assert(condition: bool, message: String) -> void:
    if not condition:
        _failures.append(message)
