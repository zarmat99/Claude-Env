extends Control
## Game-over screen (M16): on death it shows the save list so the player reloads a save - dying means
## loading, not respawning in place. Runs with PROCESS_MODE_ALWAYS so it works while the tree is
## paused. A "New Game" fallback is offered only when there is no save to load.

const SaveSlotListScene = preload("res://scripts/ui/SaveSlotList.gd")

var _list
var _restart_button: Button

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    set_anchors_preset(Control.PRESET_FULL_RECT)
    _build_ui()
    hide()
    EventBus.player_died.connect(_on_player_died)
    EventBus.player_respawned.connect(hide)

func _on_player_died() -> void:
    _list.refresh()
    _restart_button.visible = not GameOverManager.has_any_save()
    show()

func _build_ui() -> void:
    var dim := ColorRect.new()
    dim.color = Color(0.12, 0.0, 0.0, 0.8)
    dim.set_anchors_preset(Control.PRESET_FULL_RECT)
    dim.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(dim)

    var center := CenterContainer.new()
    center.set_anchors_preset(Control.PRESET_FULL_RECT)
    add_child(center)

    var vbox := VBoxContainer.new()
    vbox.custom_minimum_size = Vector2(360, 0)
    center.add_child(vbox)

    var title := Label.new()
    title.text = "You Died"
    title.add_theme_font_size_override("font_size", 28)
    title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    vbox.add_child(title)

    var subtitle := Label.new()
    subtitle.text = "Load a save to continue:"
    vbox.add_child(subtitle)

    _list = SaveSlotListScene.new()
    _list.configure(false, false)  # load-only on death
    _list.slot_loaded.connect(_on_slot_loaded)
    vbox.add_child(_list)

    _restart_button = Button.new()
    _restart_button.text = "New Game (no save found)"
    _restart_button.pressed.connect(func(): GameOverManager.restart_new_game())
    vbox.add_child(_restart_button)

func _on_slot_loaded() -> void:
    GameOverManager.resume_after_load()
