extends Control
## Inventory overlay. Toggle with the inventory action. Shows gold, equipment, and actionable
## inventory entries while delegating all state changes to InventoryManager / EquipmentManager.

@onready var _list: VBoxContainer = $Panel/List

func _ready() -> void:
    hide()
    EventBus.item_added.connect(func(_i, _n): if visible: _refresh())
    EventBus.item_removed.connect(func(_i, _n): if visible: _refresh())
    EventBus.item_used.connect(func(_i): if visible: _refresh())
    EventBus.equipment_changed.connect(func(_slot, _item): if visible: _refresh())
    EventBus.gold_changed.connect(func(_gold): if visible: _refresh())

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
    _add("Equipped", 14, Color(0.75, 0.9, 1.0))
    var equipped: Dictionary = GameState.player.get("equipment", {})
    var equipped_slots := equipped.keys()
    equipped_slots.sort()
    if equipped_slots.is_empty():
        _add("(none)", 12, Color(0.7, 0.7, 0.7))
    for slot in equipped_slots:
        var slot_name := String(slot)
        var item_id := String(equipped.get(slot_name, ""))
        if item_id == "":
            continue
        var def := DataRegistry.get_item(item_id)
        var item_name := String(def.get("name", item_id))
        _add_button("%s: %s" % [slot_name, item_name], _unequip_slot.bind(slot_name))

    _add("Items", 14, Color(0.75, 0.9, 1.0))
    var inv: Array = InventoryManager.get_items()
    if inv.is_empty():
        _add("(empty)", 12, Color(0.7, 0.7, 0.7))
    for slot in inv:
        var item_id := String(slot.get("id", ""))
        var def := DataRegistry.get_item(item_id)
        var nm := String(def.get("name", slot.get("id", "?")))
        var count := int(slot.get("count", 0))
        var item_type := String(def.get("type", ""))
        var text := "%s   x%d" % [nm, count]
        if item_type in ["weapon", "armor"]:
            _add_button("Equip %s" % text, _equip_item.bind(item_id))
        elif item_type == "consumable" and (def.get("use_effect", null) is Dictionary):
            _add_button("Use %s" % text, _use_item.bind(item_id))
        else:
            _add("- %s" % text, 13, Color(0.85, 0.85, 0.85))

func _equip_item(item_id: String) -> void:
    EquipmentManager.equip(item_id)
    _refresh()

func _unequip_slot(slot: String) -> void:
    EquipmentManager.unequip(slot)
    _refresh()

func _use_item(item_id: String) -> void:
    InventoryManager.use_item(item_id)
    _refresh()

func _add(text: String, size: int, color: Color) -> void:
    var l := Label.new()
    l.text = text
    l.add_theme_font_size_override("font_size", size)
    l.add_theme_color_override("font_color", color)
    l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    _list.add_child(l)

func _add_button(text: String, callback: Callable) -> void:
    var b := Button.new()
    b.text = text
    b.add_theme_font_size_override("font_size", 13)
    b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    b.pressed.connect(callback)
    _list.add_child(b)
