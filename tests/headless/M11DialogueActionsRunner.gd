extends Node

var _failures: Array[String] = []

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    _run.call_deferred()

func _run() -> void:
    print("[M11] Dialogue actions runner starting")
    _test_data_validation()
    _test_dialogue_actions()
    _test_branching_quest_actions()
    _test_multi_stage_regression_fixture()
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

func _test_branching_quest_actions() -> void:
    _run_branch_choice(0, "quest_m11_branch_fixture_outcome_spare", 5, 1, 0)
    _run_branch_choice(1, "quest_m11_branch_fixture_outcome_keep", 8, 4, 1)

func _run_branch_choice(choice_index: int, expected_flag: String, expected_xp: int, expected_gold: int, expected_potions: int) -> void:
    get_tree().paused = false
    GameState.reset_to_new_game()

    DialogueManager.start("dialogue_m11_branch_fixture")
    _assert(DialogueManager.is_active(), "M11 branch fixture dialogue should start")
    _assert(QuestManager.get_stage("quest_m11_branch_fixture") == 0, "Branch fixture quest should start at stage 0")

    DialogueManager.choose(choice_index)
    _assert(QuestManager.is_completed("quest_m11_branch_fixture"), "Branch choice %d should complete the branch fixture quest" % choice_index)
    _assert(bool(GameState.flags.get(expected_flag, false)), "Branch choice %d should set %s" % [choice_index, expected_flag])
    _assert(int(GameState.player.get("stats", {}).get("xp", 0)) == expected_xp, "Branch choice %d should grant %d XP" % [choice_index, expected_xp])
    _assert(int(GameState.player.get("gold", 0)) == expected_gold, "Branch choice %d should grant %d gold" % [choice_index, expected_gold])
    _assert(InventoryManager.get_count("item_health_potion") == expected_potions, "Branch choice %d should grant %d potion(s)" % [choice_index, expected_potions])
    _assert(not DialogueManager.is_active(), "Branch choice %d should end dialogue" % choice_index)
    _assert(not get_tree().paused, "Branch choice %d should unpause the tree" % choice_index)

func _test_multi_stage_regression_fixture() -> void:
    _run_regression_path(
        0,
        "quest_m11_regression_fixture_outcome_deliver",
        "quest_m11_regression_fixture_outcome_keep",
        15,
        3,
        0,
        1
    )
    _run_regression_path(
        1,
        "quest_m11_regression_fixture_outcome_keep",
        "quest_m11_regression_fixture_outcome_deliver",
        12,
        5,
        1,
        0
    )

func _run_regression_path(final_choice_index: int, expected_flag: String, forbidden_flag: String, expected_xp: int, expected_gold: int, expected_potions: int, expected_swords: int) -> void:
    get_tree().paused = false
    GameState.reset_to_new_game()

    DialogueManager.start("dialogue_m11_regression_fixture")
    _assert(QuestManager.get_stage("quest_m11_regression_fixture") == 0, "Regression fixture should start at stage 0")
    DialogueManager.choose(0)
    _assert(QuestManager.get_stage("quest_m11_regression_fixture") == 10, "Beginning the regression fixture should move to stage 10")
    _assert(InventoryManager.get_count("item_health_potion") == 2, "Beginning the regression fixture should grant two potions")
    _assert(bool(GameState.flags.get("quest_m11_regression_fixture_decision_started", false)), "Beginning the regression fixture should set the started flag")
    _assert(not DialogueManager.is_active(), "Beginning the regression fixture should end the dialogue")

    DialogueManager.start("dialogue_m11_regression_fixture")
    _assert(QuestManager.get_stage("quest_m11_regression_fixture") == 10, "Regression fixture should still be at stage 10 before toll")
    DialogueManager.choose(0)
    _assert(QuestManager.get_stage("quest_m11_regression_fixture") == 20, "Paying the toll should move to stage 20")
    _assert(InventoryManager.get_count("item_health_potion") == 1, "Paying the toll should consume one potion")
    _assert(bool(GameState.flags.get("quest_m11_regression_fixture_decision_toll_paid", false)), "Paying the toll should set the toll flag")
    _assert(not DialogueManager.is_active(), "Paying the toll should end the dialogue")

    DialogueManager.start("dialogue_m11_regression_fixture")
    _assert(QuestManager.get_stage("quest_m11_regression_fixture") == 20, "Regression fixture should still be at stage 20 before final branch")
    DialogueManager.choose(final_choice_index)
    _assert(QuestManager.is_completed("quest_m11_regression_fixture"), "Regression fixture final branch should complete the quest")
    _assert(bool(GameState.flags.get(expected_flag, false)), "Regression fixture should set %s" % expected_flag)
    _assert(not bool(GameState.flags.get(forbidden_flag, false)), "Regression fixture should not set %s" % forbidden_flag)
    _assert(int(GameState.player.get("stats", {}).get("xp", 0)) == expected_xp, "Regression fixture should grant %d XP" % expected_xp)
    _assert(int(GameState.player.get("gold", 0)) == expected_gold, "Regression fixture should grant %d gold" % expected_gold)
    _assert(InventoryManager.get_count("item_health_potion") == expected_potions, "Regression fixture should leave %d potion(s)" % expected_potions)
    _assert(InventoryManager.get_count("item_iron_sword") == expected_swords, "Regression fixture should leave %d sword(s)" % expected_swords)
    _assert(not DialogueManager.is_active(), "Regression fixture final branch should end dialogue")
    _assert(not get_tree().paused, "Regression fixture final branch should unpause the tree")

func _assert(condition: bool, message: String) -> void:
    if not condition:
        _failures.append(message)
