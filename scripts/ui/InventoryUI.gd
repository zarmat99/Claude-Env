extends Control
## Inventory overlay (M4). Toggle with the inventory action. Lists items (name + count) and gold, read from GameState
## via InventoryManager / DataRegistry. Read-only view; no game logic.

@onready var _list: VBoxContainer = $Panel/List

func _ready() -> void:
    hide()
    EventBus.item_added.connect(func(_i, _n): if visible: _refresh())
    EventBus.item_removed.connect(func(_i, _n): if visible: _refresh())

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("inventory_toggle"):
        visible = not visible
        if visible:
            _refresh()
        get_viewport().set_input_as_handled()

func _refresh() -> void:
    for c in _list.get_children():
        _list.remove_child(c)
        c.queue_free()
    _add("Inventory", 16, Color(1, 1, 1))
    _add("Gold: %d" % int(GameState.player.get("gold", 0)), 13, Color(0.95, 0.85, 0.4))
    var inv: Array = InventoryManager.get_items()
    if inv.is_empty():
        _add("(empty)", 12, Color(0.7, 0.7, 0.7))
    for slot in inv:
        var def := DataRegistry.get_item(String(slot.get("id", "")))
        var nm := String(def.get("name", slot.get("id", "?")))
        _add("- %s   x%d" % [nm, int(slot.get("count", 0))], 13, Color(0.85, 0.85, 0.85))

func _add(text: String, size: int, color: Color) -> void:
    var l := Label.new()
    l.text = text
    l.add_theme_font_size_override("font_size", size)
    l.add_theme_color_override("font_color", color)
    l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    _list.add_child(l)
