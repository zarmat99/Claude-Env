extends Control
## Minimal M1 HUD: shows the player's health from GameState. Read-only view. M1 polls each
## frame for simplicity; later it will subscribe to EventBus health events instead.

@onready var _bar: ProgressBar = $HealthBar
@onready var _label: Label = $HealthBar/Label

func _process(_delta: float) -> void:
    var st: Dictionary = GameState.player.get("stats", {})
    var hp := int(st.get("health", 0))
    var max_hp := int(st.get("max_health", 0))
    _bar.max_value = max(1, max_hp)
    _bar.value = hp
    _label.text = "HP %d/%d" % [hp, max_hp]
