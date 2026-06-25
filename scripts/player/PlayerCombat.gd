extends Node
## Player combat (M5): a melee attack via the sibling AttackHitbox, and ownership of
## the player's HealthComponent — synced to GameState.player.stats.health so the HUD and (future)
## save see it. Kept separate from movement (PlayerController).

@export var attack_cooldown := 0.4

@onready var _hitbox: Hitbox = $"../AttackHitbox"
@onready var _health: HealthComponent = $"../HealthComponent"

var _cooling := false

func _ready() -> void:
    var st: Dictionary = GameState.player.get("stats", {})
    _health.setup(int(st.get("max_health", 30)), int(st.get("health", 30)))
    _health.health_changed.connect(_on_health_changed)
    _health.died.connect(_on_died)

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("attack_primary"):
        attack()
        get_viewport().set_input_as_handled()

func attack() -> void:
    if _cooling or not _health.is_alive():
        return
    _cooling = true
    _hitbox.damage = int(GameState.player.get("stats", {}).get("damage", _hitbox.damage))
    await _hitbox.strike(get_parent())   # source = the Player root
    await get_tree().create_timer(attack_cooldown).timeout
    _cooling = false

func _on_health_changed(current: int, _maximum: int) -> void:
    GameState.player["stats"]["health"] = current

func _on_died(_source: Node) -> void:
    # M5 placeholder: respawn at full health (no game-over screen yet).
    print("[Valdombra] Player would die - respawning (M5 placeholder).")
    _health.setup(_health.max_health, _health.max_health)
