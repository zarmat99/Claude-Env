extends StaticBody2D
class_name Door

const PersistentWorldObject = preload("res://scripts/world/PersistentWorldObject.gd")

@export var persistent_id: String = ""
@export var starts_open := false

var _open := false

@onready var _body: Polygon2D = $Body
@onready var _collision: CollisionShape2D = $CollisionShape2D
@onready var _interaction: InteractionComponent = $InteractionComponent

func _ready() -> void:
    _interaction.interacted.connect(_on_interacted)
    _open = starts_open or PersistentWorldObject.has_state(persistent_id, PersistentWorldObject.STATE_OPEN)
    _apply_visual_state()

func open() -> bool:
    if _open:
        return false
    _open = true
    PersistentWorldObject.set_state(persistent_id, PersistentWorldObject.STATE_OPEN)
    _apply_visual_state()
    return true

func is_open() -> bool:
    return _open

func _on_interacted(_by: Node) -> void:
    open()

func _apply_visual_state() -> void:
    _body.visible = not _open
    _collision.disabled = _open
    _interaction.prompt = "Open door"
    _interaction.monitorable = not _open
