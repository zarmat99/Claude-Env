extends Node
class_name HealthComponent
## Reusable health for any actor (player, enemies). Holds current/max, applies damage/heal, and
## emits local signals + EventBus events. `owner` is the actor scene root, so EventBus events carry
## the actor. For the player, PlayerCombat syncs `health` back into GameState (save/HUD source).

signal health_changed(current: int, maximum: int)
signal died(source: Node)

@export var max_health: int = 30
var health: int = 0

func _ready() -> void:
    if health <= 0:
        health = max_health

func setup(maxv: int, curv: int = -1) -> void:
    max_health = max(1, maxv)
    health = clamp(curv if curv >= 0 else maxv, 0, max_health)
    health_changed.emit(health, max_health)

func take_damage(amount: int, source: Node = null) -> void:
    if health <= 0:
        return
    health = max(0, health - max(0, amount))
    health_changed.emit(health, max_health)
    EventBus.actor_damaged.emit(owner, amount, source)
    if health <= 0:
        died.emit(source)
        EventBus.actor_died.emit(owner)

func heal(amount: int) -> void:
    if health <= 0:
        return
    health = min(max_health, health + max(0, amount))
    health_changed.emit(health, max_health)

func is_alive() -> bool:
    return health > 0
