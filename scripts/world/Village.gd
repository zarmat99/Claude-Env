extends Node2D
## M1 placeholder test map: a bounded arena with a couple of obstacle blocks. The geometry is
## declared once and reused for BOTH the visuals (_draw) and the colliders, so the map needs no
## external assets. TEMPORARY: real maps become data-driven (TileMap + maps.json) around M6.

const WorldScale := preload("res://scripts/core/WorldScale.gd")

const MAP_SIZE := Vector2(960, 540)
const GROUND_COLOR := Color(0.16, 0.19, 0.14)
const SOLID_COLOR := Color(0.30, 0.27, 0.23)

@export var ground_asset_id: String = "asset_tile_village_grass_a"
@export var draw_placeholder_solids: bool = false

# Solid border rectangles in local coordinates. Art props now provide their own collisions.
var _solids: Array[Rect2] = [
    Rect2(0, 0, 960, 16),      # top wall
    Rect2(0, 524, 960, 16),    # bottom wall
    Rect2(0, 0, 16, 540),      # left wall
    Rect2(944, 0, 16, 540),    # right wall
]
var _ground_texture: Texture2D = null

func _ready() -> void:
    _ground_texture = _load_generated_texture(ground_asset_id)
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
    _draw_ground(Rect2(Vector2.ZERO, MAP_SIZE), GROUND_COLOR)
    if draw_placeholder_solids:
        for r in _solids:
            draw_rect(r, SOLID_COLOR, true)

## Where the player should appear when entering this map (M1: centre, clear of obstacles).
func get_spawn_position() -> Vector2:
    return MAP_SIZE * 0.5

func _load_generated_texture(asset_id: String) -> Texture2D:
    if asset_id == "":
        return null
    var asset := DataRegistry.get_generated_asset(asset_id)
    if asset.is_empty():
        return null
    return load(String(asset.get("processed_file", ""))) as Texture2D

func _draw_ground(area: Rect2, fallback_color: Color) -> void:
    if _ground_texture == null:
        draw_rect(area, fallback_color, true)
        return
    var tile_size := Vector2(WorldScale.TILE_SIZE, WorldScale.TILE_SIZE)
    var y := area.position.y
    while y < area.end.y:
        var x := area.position.x
        while x < area.end.x:
            var size := Vector2(
                min(tile_size.x, area.end.x - x),
                min(tile_size.y, area.end.y - y)
            )
            draw_texture_rect(_ground_texture, Rect2(Vector2(x, y), size), false)
            x += tile_size.x
        y += tile_size.y
