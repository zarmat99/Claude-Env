extends Control
## Renders the active dialogue (speaker, text, choice buttons). Talks only to DialogueManager and
## EventBus; holds no game logic. process_mode = ALWAYS (set in the scene) so it works while the
## game is paused during dialogue.

@onready var _speaker: Label = $Panel/VBox/Speaker
@onready var _text: Label = $Panel/VBox/Text
@onready var _choices: VBoxContainer = $Panel/VBox/Choices

func _ready() -> void:
    hide()
    DialogueManager.line_changed.connect(_on_line_changed)
    EventBus.dialogue_ended.connect(_on_dialogue_ended)

func _on_line_changed(speaker: String, text: String, choices: Array) -> void:
    _speaker.text = speaker
    _text.text = text
    for c in _choices.get_children():
        _choices.remove_child(c)
        c.queue_free()
    for i in choices.size():
        var b := Button.new()
        b.text = String((choices[i] as Dictionary).get("text", "..."))
        b.add_theme_font_size_override("font_size", 13)
        b.pressed.connect(_on_choice_pressed.bind(i))
        _choices.add_child(b)
    show()

func _on_choice_pressed(index: int) -> void:
    DialogueManager.choose(index)

func _on_dialogue_ended(_id: String) -> void:
    hide()
