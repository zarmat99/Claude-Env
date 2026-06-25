extends Area2D
class_name InteractionComponent
## Reusable "interactable" range placed on an entity (NPC now; chests/doors later). It is detected
## by the player's PlayerInteraction area; it does not detect anything itself. The owner connects to
## `interacted` to respond. Set the range via the child CollisionShape2D in the scene; put this on
## the interaction collision layer.

signal interacted(by: Node)

@export var prompt: String = "Interact"

func _ready() -> void:
    add_to_group("interactable")
    monitoring = false   # it is detected, it does not detect
    monitorable = true

func interact(by: Node) -> void:
    interacted.emit(by)
