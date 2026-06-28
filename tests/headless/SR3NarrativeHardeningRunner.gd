extends Node
## Headless regression for the SR3 narrative-hardening follow-ups:
## F1 dialogue soft-lock guard, F2 multi-condition quest objectives, F3 state-reactive dialogue.

var _failures: Array[String] = []
var _last_text := ""
var _last_choice_count := -1

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    DialogueManager.line_changed.connect(_on_line_changed)
    _run.call_deferred()

func _on_line_changed(_speaker: String, text: String, choices: Array) -> void:
    _last_text = text
    _last_choice_count = choices.size()

func _run() -> void:
    print("[SR3] Narrative hardening runner starting")
    _test_data_validation()
    _test_dialogue_softlock_guard()
    _test_multi_condition_quest()
    _test_state_reactive_dialogue()
    await get_tree().process_frame

    if _failures.is_empty():
        print("[SR3] Narrative hardening runner OK")
        get_tree().quit(0)
    else:
        for failure in _failures:
            push_error("[SR3] %s" % failure)
        print("[SR3] Narrative hardening runner FAILED with %d failure(s)" % _failures.size())
        get_tree().quit(1)

func _test_data_validation() -> void:
    _assert(DataRegistry.validate_all(), "DataRegistry validation failed: %s" % str(DataRegistry.get_validation_errors()))

# --- SR3-F1: a node with no visible choices must never soft-lock the paused tree ---
func _test_dialogue_softlock_guard() -> void:
    get_tree().paused = false
    GameState.reset_to_new_game()

    DialogueManager.start("dialogue_sr3_guard_fixture")
    _assert(DialogueManager.is_active(), "Guard fixture should start")
    _assert(_last_choice_count == 0, "Intro node should present zero choices")

    DialogueManager.advance()  # follows the node-level `next` to the dead-end node
    _assert(DialogueManager.is_active(), "Continuing from a choiceless node with `next` should move on, not end")
    _assert(_last_choice_count == 0, "Dead-end node should filter out its only gated choice")

    DialogueManager.advance()  # dead-end node has no `next` -> ends gracefully
    _assert(not DialogueManager.is_active(), "Continuing from a choiceless dead-end node should end the dialogue")
    _assert(not get_tree().paused, "Ending via the guard should unpause the tree")

# --- SR3-F2: multi-condition advance_on (AND array + any_of) ---
func _test_multi_condition_quest() -> void:
    # AND path: has_item(2 potions) AND talked_to(blacksmith), satisfied at the talk moment.
    get_tree().paused = false
    GameState.reset_to_new_game()
    QuestManager.start_quest("quest_sr3_multicond_fixture")
    _assert(QuestManager.get_stage("quest_sr3_multicond_fixture") == 0, "Multi-cond fixture should start at stage 0")

    EventBus.npc_talked.emit("npc_blacksmith_valdombra")  # talk without potions
    _assert(QuestManager.get_stage("quest_sr3_multicond_fixture") == 0, "Talking without potions should not satisfy the AND")

    InventoryManager.add("item_health_potion", 2)  # potions held, but talked_to is momentary
    _assert(QuestManager.get_stage("quest_sr3_multicond_fixture") == 0, "Potions alone (past talk) should not advance; talked_to is momentary")

    EventBus.npc_talked.emit("npc_blacksmith_valdombra")  # talk while holding potions -> AND met
    _assert(QuestManager.get_stage("quest_sr3_multicond_fixture") == 10, "Talking while holding two potions should advance to stage 10")

    InventoryManager.add("item_iron_sword", 1)  # any_of via item
    _assert(QuestManager.is_completed("quest_sr3_multicond_fixture"), "Acquiring an iron sword should satisfy the any_of and complete the quest")
    _assert(int(GameState.player.get("stats", {}).get("xp", 0)) == 9, "Multi-cond completion should grant 9 XP")
    _assert(int(GameState.player.get("gold", 0)) == 2, "Multi-cond completion should grant 2 gold")

    # any_of alternative branch: kill a slime instead of holding the sword.
    get_tree().paused = false
    GameState.reset_to_new_game()
    QuestManager.start_quest("quest_sr3_multicond_fixture")
    InventoryManager.add("item_health_potion", 2)
    EventBus.npc_talked.emit("npc_blacksmith_valdombra")
    _assert(QuestManager.get_stage("quest_sr3_multicond_fixture") == 10, "AND path should reach stage 10 again")
    GameState.kills["enemy_slime"] = 1
    EventBus.actor_died.emit(self)  # drives a state recheck
    _assert(QuestManager.is_completed("quest_sr3_multicond_fixture"), "Killing a slime should satisfy the any_of and complete the quest")

# --- SR3-F3: state-reactive dialogue entry via entry_rules ---
func _test_state_reactive_dialogue() -> void:
    get_tree().paused = false
    GameState.reset_to_new_game()

    DialogueManager.start("dialogue_sr3_reactive_fixture")  # flag unset -> stranger node
    _assert(_last_text.begins_with("Who are you"), "Reactive fixture should open the stranger node when unknown")
    DialogueManager.choose(0)
    _assert(not DialogueManager.is_active(), "Leaving the reactive fixture should end the dialogue")

    GameState.flags["sr3_reactive_known"] = true
    DialogueManager.start("dialogue_sr3_reactive_fixture")  # rule matches -> friend node
    _assert(_last_text.begins_with("Good to see you again"), "Reactive fixture should open the friend node when known")
    DialogueManager.choose(0)
    _assert(not DialogueManager.is_active(), "Leaving the reactive fixture should end the dialogue")

func _assert(condition: bool, message: String) -> void:
    if not condition:
        _failures.append(message)
