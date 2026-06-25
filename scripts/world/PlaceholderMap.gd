extends Node2D
class_name PlaceholderMap
## A bordered placeholder room (ground + four solid walls), built from `map_size`. Visuals via _draw,
## colliders built in code — no external assets. Maps add their own SpawnPoints / AreaTransitions /
## content as child nodes. TEMPORARY art; real tile-based maps come later.

const WALL := 16.0

@export var map_size: Vector2 = Vector2(640, 400)
@export var ground_color: Color = Color(0.16, 0.19, 0.14)
@export var wall_color: Color = Color(0.30, 0.27, 0.23)

func _ready() -> void:
    var body := StaticBody2D.new()
    body.name = "Solids"
    add_child(body)
    for r in _walls():
        var cs := CollisionShape2D.new()
        var shape := RectangleShape2D.new()
        shape.size = r.size
        cs.shape = shape
        cs.position = r.position + r.size * 0.5
        body.add_child(cs)
    queue_redraw()

func _walls() -> Array:
    var w := map_size.x
    var h := map_size.y
    return [
        Rect2(0, 0, w, WALL),
        Rect2(0, h - WALL, w, WALL),
        Rect2(0, 0, WALL, h),
        Rect2(w - WALL, 0, WALL, h),
    ]

func _draw() -> void:
    draw_rect(Rect2(Vector2.ZERO, map_size), ground_color, true)
    for r in _walls():
        draw_rect(r, wall_color, true)
