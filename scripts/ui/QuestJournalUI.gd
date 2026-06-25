extends Control
## Quest journal overlay (M3). Toggle with the journal action. Lists active quests (title + current stage) and
## completed quests. Read-only view of GameState.quests; rebuilds on quest events and on open.

@onready var _list: VBoxContainer = $Panel/List

func _ready() -> void:
    hide()
    EventBus.quest_started.connect(func(_id): _refresh())
    EventBus.quest_stage_updated.connect(func(_id, _s): _refresh())
    EventBus.quest_completed.connect(func(_id): _refresh())

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("quest_journal_toggle"):
        visible = not visible
        if visible:
            _refresh()
        get_viewport().set_input_as_handled()

func _refresh() -> void:
    for c in _list.get_children():
        _list.remove_child(c)
        c.queue_free()
    var active: Dictionary = GameState.quests["active"]
    var completed: Array = GameState.quests["completed"]
    _add("Active quests" if active.size() > 0 else "No active quests.", 16, Color(1, 1, 1))
    for qid in active.keys():
        var q := DataRegistry.get_quest(qid)
        var stage := int(active[qid].get("stage", 0))
        _add("- %s" % String(q.get("title", qid)), 14, Color(0.95, 0.85, 0.5))
        _add("      %s" % QuestManager.stage_desc(qid, stage), 12, Color(0.82, 0.82, 0.82))
    if completed.size() > 0:
        _add("Completed", 16, Color(1, 1, 1))
        for qid in completed:
            var q := DataRegistry.get_quest(qid)
            _add("  + %s" % String(q.get("title", qid)), 12, Color(0.55, 0.7, 0.55))

func _add(text: String, size: int, color: Color) -> void:
    var l := Label.new()
    l.text = text
    l.add_theme_font_size_override("font_size", size)
    l.add_theme_color_override("font_color", color)
    l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    _list.add_child(l)
