extends Area2D
## A collectible item in the world. Auto-picks up when the player walks over it, adds it to the
## inventory, and (if it has a persistent_id) marks itself collected so it won't reappear on reload.
## persistent_id convention: docs/ai_memory/PROJECT_MEMORY.md section 10.

const PersistentWorldObject = preload("res://scripts/world/PersistentWorldObject.gd")

@export var item_id: String = ""
@export var count: int = 1
@export var persistent_id: String = ""

func _ready() -> void:
    if PersistentWorldObject.has_state(persistent_id, PersistentWorldObject.STATE_COLLECTED):
        queue_free()
        return
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
    if not body.is_in_group("player"):
        return
    InventoryManager.add(item_id, count)
    PersistentWorldObject.set_state(persistent_id, PersistentWorldObject.STATE_COLLECTED)
    queue_free()
