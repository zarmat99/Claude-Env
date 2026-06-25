extends StaticBody2D
class_name Switch

const PersistentWorldObject = preload("res://scripts/world/PersistentWorldObject.gd")

@export var persistent_id: String = ""
@export var target_persistent_id: String = ""

var _on := false

@onready var _body: Polygon2D = $Body
@onready var _interaction: InteractionComponent = $InteractionComponent

func _ready() -> void:
    _interaction.interacted.connect(_on_interacted)
    _on = PersistentWorldObject.has_state(persistent_id, PersistentWorldObject.STATE_ON)
    _apply_visual_state()
    if _on:
        _open_target()

func activate() -> bool:
    if _on:
        return false
    _on = true
    PersistentWorldObject.set_state(persistent_id, PersistentWorldObject.STATE_ON)
    _open_target()
    _apply_visual_state()
    return true

func is_on() -> bool:
    return _on

func _on_interacted(_by: Node) -> void:
    activate()

func _open_target() -> void:
    if target_persistent_id == "":
        return
    var target := _find_by_persistent_id(get_parent(), target_persistent_id)
    if target and target.has_method("open"):
        target.open()
    else:
        PersistentWorldObject.set_state(target_persistent_id, PersistentWorldObject.STATE_OPEN)

func _find_by_persistent_id(root: Node, target_id: String) -> Node:
    if root == null:
        return null
    var nodes: Array[Node] = [root]
    var index := 0
    while index < nodes.size():
        var node := nodes[index]
        var node_id = node.get("persistent_id")
        if node_id != null and String(node_id) == target_id:
            return node
        for child in node.get_children():
            if child is Node:
                nodes.append(child)
        index += 1
    return null

func _apply_visual_state() -> void:
    _body.color = Color(0.35, 0.85, 0.55, 1) if _on else Color(0.65, 0.45, 0.25, 1)
    _interaction.prompt = "Pull switch"
    _interaction.monitorable = not _on
