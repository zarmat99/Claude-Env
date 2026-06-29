extends Control
## Game-over overlay (M16): shown on player death, offers Respawn or Load Last Save. Runs with
## PROCESS_MODE_ALWAYS so its buttons work while GameOverManager has the tree paused.

var _load_button: Button

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    set_anchors_preset(Control.PRESET_FULL_RECT)
    _build_ui()
    hide()
    EventBus.player_died.connect(_on_player_died)
    EventBus.player_respawned.connect(hide)

func _on_player_died() -> void:
    _load_button.disabled = not GameOverManager.has_last_save()
    show()

func _build_ui() -> void:
    var dim := ColorRect.new()
    dim.color = Color(0.12, 0.0, 0.0, 0.78)
    dim.set_anchors_preset(Control.PRESET_FULL_RECT)
    dim.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(dim)

    var center := CenterContainer.new()
    center.set_anchors_preset(Control.PRESET_FULL_RECT)
    add_child(center)

    var vbox := VBoxContainer.new()
    vbox.custom_minimum_size = Vector2(260, 0)
    center.add_child(vbox)

    var title := Label.new()
    title.text = "You Died"
    title.add_theme_font_size_override("font_size", 28)
    title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    vbox.add_child(title)

    var respawn := Button.new()
    respawn.text = "Respawn"
    respawn.pressed.connect(func(): GameOverManager.respawn())
    vbox.add_child(respawn)

    _load_button = Button.new()
    _load_button.text = "Load Last Save"
    _load_button.pressed.connect(func(): GameOverManager.load_last_save())
    vbox.add_child(_load_button)
