extends Control
## Authoring/debug overlay for quest production. Read-only snapshot of quest, flag, and inventory
## state so JSON questlines can be checked in-game without custom scripts.

@onready var _list: VBoxContainer = $Panel/Scroll/List

func _ready() -> void:
    hide()
    EventBus.quest_started.connect(func(_id): _refresh_if_visible())
    EventBus.quest_stage_updated.connect(func(_id, _stage): _refresh_if_visible())
    EventBus.quest_completed.connect(func(_id): _refresh_if_visible())
    EventBus.item_added.connect(func(_id, _count): _refresh_if_visible())
    EventBus.item_removed.connect(func(_id, _count): _refresh_if_visible())
    EventBus.gold_changed.connect(func(_total): _refresh_if_visible())
    EventBus.player_level_up.connect(func(_level): _refresh_if_visible())
    EventBus.dialogue_ended.connect(func(_id): _refresh_if_visible())
    EventBus.map_changed.connect(func(_id): _refresh_if_visible())

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("quest_debug_toggle"):
        visible = not visible
        if visible:
            _refresh()
        get_viewport().set_input_as_handled()

func _refresh_if_visible() -> void:
    if visible:
        _refresh()

func _refresh() -> void:
    for child in _list.get_children():
        _list.remove_child(child)
        child.queue_free()

    var stats: Dictionary = GameState.player.get("stats", {})
    _add("Map: %s" % String(GameState.current_map), 8, Color(0.8, 0.85, 1.0))
    _add(
        "LV %d  XP %d/%d  Gold %d" %
        [
            int(stats.get("level", 1)),
            int(stats.get("xp", 0)),
            ProgressionManager.xp_to_next_level(),
            int(GameState.player.get("gold", 0)),
        ],
        8,
        Color(0.95, 0.85, 0.5)
    )

    _add_section("Active Quests")
    var active: Dictionary = GameState.quests.get("active", {})
    var active_ids := active.keys()
    active_ids.sort()
    if active_ids.is_empty():
        _add("none", 7, Color(0.65, 0.65, 0.65))
    for qid in active_ids:
        var quest_id := String(qid)
        var quest := DataRegistry.get_quest(quest_id)
        var stage := int(active[quest_id].get("stage", -1))
        _add("%s  stage %d" % [String(quest.get("title", quest_id)), stage], 8, Color(0.95, 0.85, 0.5))
        _add(QuestManager.stage_desc(quest_id, stage), 7, Color(0.82, 0.82, 0.82))

    _add_section("Completed Quests")
    var completed: Array = GameState.quests.get("completed", [])
    if completed.is_empty():
        _add("none", 7, Color(0.65, 0.65, 0.65))
    for qid in completed:
        var quest_id := String(qid)
        var quest := DataRegistry.get_quest(quest_id)
        _add(String(quest.get("title", quest_id)), 7, Color(0.55, 0.8, 0.55))

    _add_section("Flags")
    var flag_names := GameState.flags.keys()
    flag_names.sort()
    if flag_names.is_empty():
        _add("none", 7, Color(0.65, 0.65, 0.65))
    for flag in flag_names:
        _add("%s = %s" % [String(flag), str(GameState.flags[flag])], 7, Color(0.78, 0.78, 0.9))

    _add_section("Inventory")
    var items := InventoryManager.get_items()
    if items.is_empty():
        _add("none", 7, Color(0.65, 0.65, 0.65))
    for slot in items:
        var item_id := String(slot.get("id", ""))
        _add("%s x%d" % [item_id, int(slot.get("count", 0))], 7, Color(0.85, 0.85, 0.85))

func _add_section(text: String) -> void:
    _add(text, 8, Color(1.0, 1.0, 1.0))

func _add(text: String, size: int, color: Color) -> void:
    var label := Label.new()
    label.text = text
    label.add_theme_font_size_override("font_size", size)
    label.add_theme_color_override("font_color", color)
    label.autowrap_mode = TextServer.AUTOWRAP_ARBITRARY
    label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    _list.add_child(label)
