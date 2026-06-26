extends Node2D

const WORLD_TILE_SIZE := 64.0
const SOURCE_TILE_SIZE := 128.0
const MAP_SIZE := Vector2(512, 320)
const WALL := 16.0
const ASSET_SET_ID := "asset_generated_m10r_dev"
const TILE_IDS := {
    "stone": "tile_generated_stone_floor_a",
    "dirt": "tile_generated_dirt_path_a",
    "moss": "tile_generated_moss_grass_a"
}
const LAYOUT := [
    ["moss", "moss", "moss", "moss", "moss", "moss", "moss"],
    ["moss", "stone", "stone", "stone", "dirt", "dirt", "moss"],
    ["moss", "stone", "stone", "dirt", "dirt", "stone", "moss"],
    ["moss", "moss", "dirt", "dirt", "stone", "stone", "moss"]
]

var _asset_set: Dictionary = {}
var _atlas: Texture2D = null
var _chest: Texture2D = null
var _lever: Texture2D = null

func _ready() -> void:
    _asset_set = DataRegistry.get_asset_set(ASSET_SET_ID)
    _atlas = load(String(_asset_set.get("atlas", ""))) as Texture2D
    _chest = load("res://assets/sprites/generated/chest_closed_a.png") as Texture2D
    _lever = load("res://assets/sprites/generated/lever_switch_a.png") as Texture2D
    _build_bounds()
    queue_redraw()

func _draw() -> void:
    draw_rect(Rect2(Vector2.ZERO, MAP_SIZE), Color(0.08, 0.09, 0.085), true)
    if _atlas == null:
        return

    var origin := Vector2(32, 32)
    for y in range(LAYOUT.size()):
        var row: Array = LAYOUT[y]
        for x in range(row.size()):
            _draw_tile(String(row[x]), origin + Vector2(x, y) * WORLD_TILE_SIZE)

    _draw_sprite(_chest, origin + Vector2(2.5, 2.75) * WORLD_TILE_SIZE)
    _draw_sprite(_lever, origin + Vector2(4.55, 2.0) * WORLD_TILE_SIZE)

func _draw_tile(layout_key: String, top_left: Vector2) -> void:
    var tile_id := String(TILE_IDS.get(layout_key, ""))
    var tiles: Dictionary = _asset_set.get("tiles", {})
    var tile: Dictionary = tiles.get(tile_id, {})
    if tile.is_empty():
        return
    var source := Rect2(
        Vector2(int(tile.get("col", 0)), int(tile.get("row", 0))) * SOURCE_TILE_SIZE,
        Vector2(SOURCE_TILE_SIZE, SOURCE_TILE_SIZE)
    )
    draw_texture_rect_region(
        _atlas,
        Rect2(top_left, Vector2(WORLD_TILE_SIZE, WORLD_TILE_SIZE)),
        source
    )

func _draw_sprite(texture: Texture2D, bottom_center: Vector2) -> void:
    if texture == null:
        return
    var size := Vector2(WORLD_TILE_SIZE, WORLD_TILE_SIZE)
    var rect := Rect2(bottom_center - Vector2(size.x * 0.5, size.y), size)
    draw_texture_rect(texture, rect, false)

func _build_bounds() -> void:
    var body := StaticBody2D.new()
    body.name = "Bounds"
    add_child(body)
    for rect in _bounds():
        var shape := RectangleShape2D.new()
        shape.size = rect.size
        var collision := CollisionShape2D.new()
        collision.shape = shape
        collision.position = rect.position + rect.size * 0.5
        body.add_child(collision)

func _bounds() -> Array[Rect2]:
    return [
        Rect2(0, 0, MAP_SIZE.x, WALL),
        Rect2(0, MAP_SIZE.y - WALL, MAP_SIZE.x, WALL),
        Rect2(0, 0, WALL, MAP_SIZE.y),
        Rect2(MAP_SIZE.x - WALL, 0, WALL, MAP_SIZE.y),
    ]
