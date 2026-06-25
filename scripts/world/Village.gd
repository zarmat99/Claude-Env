extends Node2D
## M1 placeholder test map: a bounded arena with a couple of obstacle blocks. The geometry is
## declared once and reused for BOTH the visuals (_draw) and the colliders, so the map needs no
## external assets. TEMPORARY: real maps become data-driven (TileMap + maps.json) around M6.

const MAP_SIZE := Vector2(960, 540)
const GROUND_COLOR := Color(0.16, 0.19, 0.14)
const SOLID_COLOR := Color(0.30, 0.27, 0.23)

# Solid rectangles (border walls + obstacles), in local coordinates.
var _solids: Array[Rect2] = [
    Rect2(0, 0, 960, 16),      # top wall
    Rect2(0, 524, 960, 16),    # bottom wall
    Rect2(0, 0, 16, 540),      # left wall
    Rect2(944, 0, 16, 540),    # right wall
    Rect2(270, 170, 70, 70),   # obstacle block
    Rect2(600, 350, 110, 40),  # obstacle block
]

func _ready() -> void:
    var body := StaticBody2D.new()
    body.name = "Solids"
    add_child(body)
    for r in _solids:
        var cs := CollisionShape2D.new()
        var shape := RectangleShape2D.new()
        shape.size = r.size
        cs.shape = shape
        cs.position = r.position + r.size * 0.5
        body.add_child(cs)
    queue_redraw()

func _draw() -> void:
    draw_rect(Rect2(Vector2.ZERO, MAP_SIZE), GROUND_COLOR, true)
    for r in _solids:
        draw_rect(r, SOLID_COLOR, true)

## Where the player should appear when entering this map (M1: centre, clear of obstacles).
func get_spawn_position() -> Vector2:
    return MAP_SIZE * 0.5
