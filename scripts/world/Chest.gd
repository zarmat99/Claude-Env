extends StaticBody2D
class_name Chest

const PersistentWorldObject = preload("res://scripts/world/PersistentWorldObject.gd")

@export var persistent_id: String = ""
@export var loot_items: Array = []

var _opened := false

@onready var _body: Polygon2D = $Body
@onready var _interaction: InteractionComponent = $InteractionComponent

func _ready() -> void:
    _interaction.interacted.connect(_on_interacted)
    _opened = PersistentWorldObject.has_state(persistent_id, PersistentWorldObject.STATE_OPENED)
    _apply_visual_state()

func open() -> bool:
    if _opened:
        return false
    for loot in loot_items:
        if not (loot is Dictionary):
            continue
        var item_id := String(loot.get("id", ""))
        var count := int(loot.get("count", 1))
        if item_id != "" and count > 0:
            InventoryManager.add(item_id, count)
    _opened = true
    PersistentWorldObject.set_state(persistent_id, PersistentWorldObject.STATE_OPENED)
    _apply_visual_state()
    return true

func is_opened() -> bool:
    return _opened

func _on_interacted(_by: Node) -> void:
    open()

func _apply_visual_state() -> void:
    _body.color = Color(0.75, 0.55, 0.28, 1) if not _opened else Color(0.45, 0.32, 0.18, 1)
    _interaction.prompt = "Open chest"
    _interaction.monitorable = not _opened
