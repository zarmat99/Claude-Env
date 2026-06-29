extends Control
## Minimal HUD: shows player health (from GameState) and the current interaction prompt (from
## EventBus). Read-only view; no game logic. M1 polls health each frame; later it will react to
## EventBus health events instead.

@onready var _bar: ProgressBar = $HealthBar
@onready var _label: Label = $HealthBar/Label
@onready var _progression: Label = $ProgressionLabel
@onready var _gold: Label = $GoldLabel
@onready var _toast: Label = $Toast
@onready var _prompt: Label = $Prompt

var _toast_time := 0.0

func _ready() -> void:
    _prompt.text = ""
    _toast.text = ""
    EventBus.interaction_prompt_changed.connect(_on_prompt_changed)
    EventBus.dialogue_started.connect(func(_id): _prompt.text = "")
    EventBus.trade_failed.connect(_on_trade_failed)
    EventBus.game_saved.connect(func(slot): _show_toast("Saved (slot %d)." % slot))
    EventBus.game_loaded.connect(func(slot): _show_toast("Loaded (slot %d)." % slot))
    EventBus.player_respawned.connect(func(): _show_toast("You respawned."))

func _process(delta: float) -> void:
    var st: Dictionary = GameState.player.get("stats", {})
    var hp := int(st.get("health", 0))
    var max_hp: int = EquipmentManager.get_effective_stat("max_health") if has_node("/root/EquipmentManager") else int(st.get("max_health", 0))
    _bar.max_value = max(1, max_hp)
    _bar.value = hp
    _label.text = "HP %d/%d" % [hp, max_hp]
    var level := int(st.get("level", 1))
    var xp := int(st.get("xp", 0))
    _progression.text = "LV %d   XP %d/%d" % [level, xp, ProgressionManager.xp_to_next_level(level)]
    _gold.text = "Gold %d" % int(GameState.player.get("gold", 0))
    if _toast_time > 0.0:
        _toast_time -= delta
        if _toast_time <= 0.0:
            _toast.text = ""

func _on_prompt_changed(text: String) -> void:
    _prompt.text = text

func _on_trade_failed(_item_id: String, reason: String) -> void:
    match reason:
        "insufficient_gold":
            _show_toast("Not enough gold.")
        "out_of_stock":
            _show_toast("Not for sale here.")
        "inventory_full":
            _show_toast("Your pack is full.")
        _:
            _show_toast("Trade failed.")

func _show_toast(text: String) -> void:
    _toast.text = text
    _toast_time = 2.5
