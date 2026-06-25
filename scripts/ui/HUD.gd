extends Control
## Minimal HUD: shows player health (from GameState) and the current interaction prompt (from
## EventBus). Read-only view; no game logic. M1 polls health each frame; later it will react to
## EventBus health events instead.

@onready var _bar: ProgressBar = $HealthBar
@onready var _label: Label = $HealthBar/Label
@onready var _prompt: Label = $Prompt

func _ready() -> void:
    _prompt.text = ""
    EventBus.interaction_prompt_changed.connect(_on_prompt_changed)
    EventBus.dialogue_started.connect(func(_id): _prompt.text = "")

func _process(_delta: float) -> void:
    var st: Dictionary = GameState.player.get("stats", {})
    var hp := int(st.get("health", 0))
    var max_hp := int(st.get("max_health", 0))
    _bar.max_value = max(1, max_hp)
    _bar.value = hp
    _label.text = "HP %d/%d" % [hp, max_hp]

func _on_prompt_changed(text: String) -> void:
    _prompt.text = text
