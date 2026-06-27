extends Node2D
class_name PlaceholderMap
## A bordered placeholder room (ground + four solid walls), built from `map_size`. Visuals via _draw,
## colliders built in code — no external assets. Maps add their own SpawnPoints / AreaTransitions /
## content as child nodes. TEMPORARY art; real tile-based maps come later.

const WorldScale := preload("res://scripts/core/WorldScale.gd")
const WALL := 16.0

@export var map_size: Vector2 = Vector2(640, 400)
@export var ground_color: Color = Color(0.16, 0.19, 0.14)
@export var wall_color: Color = Color(0.30, 0.27, 0.23)
@export var ground_asset_id: String = ""
@export var draw_placeholder_walls: bool = false

var _ground_texture: Texture2D = null

func _ready() -> void:
    _ground_texture = _load_generated_texture(ground_asset_id)
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
    _draw_ground(Rect2(Vector2.ZERO, map_size), ground_color)
    if draw_placeholder_walls:
        for r in _walls():
            draw_rect(r, wall_color, true)

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
