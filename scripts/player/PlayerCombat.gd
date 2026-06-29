extends Node
## Player combat (M5): a melee attack via the sibling AttackHitbox, and ownership of
## the player's HealthComponent — synced to GameState.player.stats.health so the HUD and (future)
## save see it. Kept separate from movement (PlayerController).

@export var attack_cooldown := 0.4

@onready var _hitbox: Hitbox = $"../AttackHitbox"
@onready var _health: HealthComponent = $"../HealthComponent"

var _cooling := false

func _ready() -> void:
    _sync_health_from_state()
    _health.health_changed.connect(_on_health_changed)
    _health.died.connect(_on_died)
    # Equipment can change the effective max health (armor); item use can change current health.
    EventBus.equipment_changed.connect(func(_slot, _item): _sync_health_from_state())
    EventBus.item_used.connect(func(_item): _sync_health_from_state())
    EventBus.player_respawned.connect(_sync_health_from_state)

## Mirror GameState health into the live component, using the equipment-derived effective max health.
func _sync_health_from_state() -> void:
    var effective_max := EquipmentManager.get_effective_stat("max_health")
    var current := int(GameState.player.get("stats", {}).get("health", effective_max))
    _health.setup(effective_max, current)

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("attack_primary"):
        attack()
        get_viewport().set_input_as_handled()

func attack() -> void:
    if _cooling or not _health.is_alive():
        return
    _cooling = true
    _hitbox.damage = EquipmentManager.get_effective_stat("damage")
    _hitbox.damage_type = "physical"
    _hitbox.armor_pierce = EquipmentManager.get_effective_stat("armor_pierce")
    await _hitbox.strike(get_parent())   # source = the Player root
    await get_tree().create_timer(attack_cooldown).timeout
    _cooling = false

func _on_health_changed(current: int, _maximum: int) -> void:
    GameState.player["stats"]["health"] = current

func _on_died(_source: Node) -> void:
    # M16: hand off to GameOverManager, which pauses and lets the player respawn or load a save.
    GameState.player["stats"]["health"] = 0
    EventBus.player_died.emit()
