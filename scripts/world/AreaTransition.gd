extends Area2D
class_name AreaTransition
## A walk-on trigger that sends the player to another map's spawn point. Builds its own collider and
## a placeholder visual from `size`. Optional `required_flag` gates the transition.

@export var target_map_id: String = ""
@export var target_spawn_point_id: String = ""
@export var required_flag: String = ""
@export var size: Vector2 = Vector2(28, 28)
@export var color: Color = Color(0.5, 0.4, 0.25, 0.7)

func _ready() -> void:
    collision_layer = 0
    collision_mask = 1   # detect the player body (layer 1)
    var cs := CollisionShape2D.new()
    var shape := RectangleShape2D.new()
    shape.size = size
    cs.shape = shape
    add_child(cs)
    body_entered.connect(_on_body_entered)
    queue_redraw()

func _draw() -> void:
    draw_rect(Rect2(-size * 0.5, size), color, true)

func _on_body_entered(body: Node) -> void:
    if SceneLoader.is_transition_locked():
        return
    if not body.is_in_group("player"):
        return
    if required_flag != "" and not bool(GameState.flags.get(required_flag, false)):
        return
    # Deferred: body_entered fires during the physics flush, and swapping maps adds/removes Area2Ds
    # (which can't change monitoring state mid-flush). Run it once the flush is done.
    SceneLoader.change_map.call_deferred(target_map_id, target_spawn_point_id)
