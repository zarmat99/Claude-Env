extends Control
## Player-facing pause menu (M16): resume, per-slot save/load/delete, and master volume - so a normal
## player manages persistence and settings without debug keys. Built in code to stay robust in
## headless tests and to avoid brittle node paths.

const SLOT_COUNT := 3

var _slots_box: VBoxContainer
var _volume_slider: HSlider

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    set_anchors_preset(Control.PRESET_FULL_RECT)
    _build_ui()
    hide()

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("pause_menu"):
        if visible:
            close()
        elif not DialogueManager.is_active():
            open()
        get_viewport().set_input_as_handled()

func open() -> void:
    _refresh_slots()
    _volume_slider.set_value_no_signal(SettingsManager.get_master_volume())
    show()
    get_tree().paused = true

func close() -> void:
    hide()
    get_tree().paused = false

func _build_ui() -> void:
    var dim := ColorRect.new()
    dim.color = Color(0, 0, 0, 0.6)
    dim.set_anchors_preset(Control.PRESET_FULL_RECT)
    dim.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(dim)

    var center := CenterContainer.new()
    center.set_anchors_preset(Control.PRESET_FULL_RECT)
    add_child(center)

    var panel := PanelContainer.new()
    center.add_child(panel)

    var vbox := VBoxContainer.new()
    vbox.custom_minimum_size = Vector2(340, 0)
    panel.add_child(vbox)

    var title := Label.new()
    title.text = "Paused"
    title.add_theme_font_size_override("font_size", 20)
    vbox.add_child(title)

    _slots_box = VBoxContainer.new()
    vbox.add_child(_slots_box)

    var volume_label := Label.new()
    volume_label.text = "Master Volume"
    vbox.add_child(volume_label)

    _volume_slider = HSlider.new()
    _volume_slider.min_value = 0.0
    _volume_slider.max_value = 1.0
    _volume_slider.step = 0.05
    _volume_slider.custom_minimum_size = Vector2(0, 24)
    _volume_slider.value_changed.connect(func(v): SettingsManager.set_master_volume(v))
    vbox.add_child(_volume_slider)

    var resume := Button.new()
    resume.text = "Resume"
    resume.pressed.connect(close)
    vbox.add_child(resume)

func _refresh_slots() -> void:
    for c in _slots_box.get_children():
        _slots_box.remove_child(c)
        c.queue_free()
    for info in SaveManager.list_saves(SLOT_COUNT):
        var slot := int(info.get("slot", 0))
        var exists := bool(info.get("exists", false))
        var row := HBoxContainer.new()
        var label := Label.new()
        label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
        if exists:
            label.text = "Slot %d: %s  Lv%d  %dg" % [slot, String(info.get("map_display", "")), int(info.get("level", 1)), int(info.get("gold", 0))]
        else:
            label.text = "Slot %d: (empty)" % slot
        row.add_child(label)
        row.add_child(_slot_button("Save", _on_save.bind(slot)))
        if exists:
            row.add_child(_slot_button("Load", _on_load.bind(slot)))
            row.add_child(_slot_button("Del", _on_delete.bind(slot)))
        _slots_box.add_child(row)

func _on_save(slot: int) -> void:
    SaveManager.save_game(slot)
    _refresh_slots()

func _on_load(slot: int) -> void:
    if SaveManager.load_game(slot):
        close()

func _on_delete(slot: int) -> void:
    SaveManager.delete_save(slot)
    _refresh_slots()

func _slot_button(text: String, cb: Callable) -> Button:
    var b := Button.new()
    b.text = text
    b.pressed.connect(cb)
    return b
