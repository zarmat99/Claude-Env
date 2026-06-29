extends Control
## Player-facing pause menu (M16): resume, per-slot save/load/delete (via the shared SaveSlotList),
## and master volume - so a normal player manages persistence and settings without debug keys. Built
## in code to stay robust in headless tests and to avoid brittle node paths.

const SaveSlotListScene = preload("res://scripts/ui/SaveSlotList.gd")

var _list
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
    _list.refresh()
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
    vbox.custom_minimum_size = Vector2(360, 0)
    panel.add_child(vbox)

    var title := Label.new()
    title.text = "Paused"
    title.add_theme_font_size_override("font_size", 20)
    vbox.add_child(title)

    _list = SaveSlotListScene.new()
    _list.configure(true, true)  # save + load + delete from the pause menu
    _list.slot_loaded.connect(close)
    vbox.add_child(_list)

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
