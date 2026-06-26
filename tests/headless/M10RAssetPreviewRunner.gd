extends Node2D

const OUTPUT_PATH := "res://assets/previews/generated/m10r_godot_preview.png"
const VIEWPORT_SIZE := Vector2i(480, 270)
const WORLD_TILE_SIZE := 64.0
const SOURCE_TILE_SIZE := 128.0
const ASSET_SET_ID := "asset_generated_m10r_dev"
const TILE_IDS := {
    "stone": "tile_generated_stone_floor_a",
    "dirt": "tile_generated_dirt_path_a",
    "moss": "tile_generated_moss_grass_a"
}
const MAP_LAYOUT := [
    ["moss", "moss", "moss", "moss", "moss", "moss", "moss"],
    ["moss", "stone", "stone", "stone", "dirt", "dirt", "moss"],
    ["moss", "stone", "stone", "dirt", "dirt", "stone", "moss"],
    ["moss", "moss", "dirt", "dirt", "stone", "stone", "moss"]
]

var _failures: Array[String] = []
var _asset_set: Dictionary = {}
var _atlas: Texture2D = null
var _chest: Texture2D = null
var _lever: Texture2D = null

func _ready() -> void:
    _run.call_deferred()

func _run() -> void:
    print("[M10R] Generated asset preview runner starting")
    _validate_registry()
    _load_textures()
    _validate_processed_images()
    queue_redraw()
    await _frames(6)
    _save_review_screenshot()

    if _failures.is_empty():
        print("[M10R] Generated asset preview runner OK")
        get_tree().quit(0)
    else:
        for failure in _failures:
            push_error("[M10R] %s" % failure)
        print("[M10R] Generated asset preview runner FAILED with %d failure(s)" % _failures.size())
        get_tree().quit(1)

func _draw() -> void:
    draw_rect(Rect2(Vector2.ZERO, Vector2(VIEWPORT_SIZE)), Color(0.08, 0.09, 0.085))
    if _atlas == null or _chest == null or _lever == null:
        return

    var origin := Vector2(16, 8)
    for y in range(MAP_LAYOUT.size()):
        var row: Array = MAP_LAYOUT[y]
        for x in range(row.size()):
            _draw_tile(String(row[x]), origin + Vector2(x, y) * WORLD_TILE_SIZE)

    _draw_object(_chest, origin + Vector2(2.5, 2.75) * WORLD_TILE_SIZE)
    _draw_object(_lever, origin + Vector2(4.55, 2.0) * WORLD_TILE_SIZE)

func _draw_tile(layout_key: String, top_left: Vector2) -> void:
    var tile_id := String(TILE_IDS.get(layout_key, ""))
    if tile_id == "":
        return
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

func _draw_object(texture: Texture2D, bottom_center: Vector2) -> void:
    var target_size := Vector2(WORLD_TILE_SIZE, WORLD_TILE_SIZE)
    var rect := Rect2(bottom_center - Vector2(target_size.x * 0.5, target_size.y), target_size)
    draw_texture_rect(texture, rect, false)

func _validate_registry() -> void:
    _assert(DataRegistry.validate_all(), "DataRegistry validation failed: %s" % str(DataRegistry.get_validation_errors()))
    _assert(DataRegistry.has_id("asset_sets", ASSET_SET_ID), "Missing M10R generated asset set")
    _asset_set = DataRegistry.get_asset_set(ASSET_SET_ID)

func _load_textures() -> void:
    _atlas = load(String(_asset_set.get("atlas", ""))) as Texture2D
    _chest = load("res://assets/sprites/generated/chest_closed_a.png") as Texture2D
    _lever = load("res://assets/sprites/generated/lever_switch_a.png") as Texture2D
    _assert(_atlas != null, "Generated terrain atlas should load")
    _assert(_chest != null, "Generated chest sprite should load")
    _assert(_lever != null, "Generated lever sprite should load")

func _validate_processed_images() -> void:
    _assert(_image_size("res://assets/tilesets/generated/stone_floor_a.png") == Vector2i(128, 128), "Stone tile must be 128x128")
    _assert(_image_size("res://assets/tilesets/generated/dirt_path_a.png") == Vector2i(128, 128), "Dirt tile must be 128x128")
    _assert(_image_size("res://assets/tilesets/generated/moss_grass_a.png") == Vector2i(128, 128), "Moss tile must be 128x128")
    _assert(_image_size("res://assets/tilesets/generated/m10r_dev_tileset.png") == Vector2i(384, 128), "Terrain atlas must be 384x128")
    _assert(_alpha_stats("res://assets/sprites/generated/chest_closed_a.png")["transparent"] > 0, "Chest sprite should have transparent pixels")
    _assert(_alpha_stats("res://assets/sprites/generated/lever_switch_a.png")["transparent"] > 0, "Lever sprite should have transparent pixels")

func _save_review_screenshot() -> void:
    var image := _compose_review_image()
    _assert(image.get_size() == VIEWPORT_SIZE, "Review screenshot size should match project viewport")
    _assert(_image_has_contrast(image), "Review screenshot should not be blank")
    var err := image.save_png(OUTPUT_PATH)
    _assert(err == OK, "Could not write review screenshot to %s" % OUTPUT_PATH)
    print("[M10R] Wrote review screenshot: %s" % OUTPUT_PATH)

func _compose_review_image() -> Image:
    var image := Image.create(VIEWPORT_SIZE.x, VIEWPORT_SIZE.y, false, Image.FORMAT_RGBA8)
    image.fill(Color(0.08, 0.09, 0.085, 1.0))

    var atlas_image := _load_image("res://assets/tilesets/generated/m10r_dev_tileset.png")
    var chest_image := _load_image("res://assets/sprites/generated/chest_closed_a.png")
    var lever_image := _load_image("res://assets/sprites/generated/lever_switch_a.png")
    if atlas_image == null or chest_image == null or lever_image == null:
        return image

    var origin := Vector2i(16, 8)
    for y in range(MAP_LAYOUT.size()):
        var row: Array = MAP_LAYOUT[y]
        for x in range(row.size()):
            _blend_tile(image, atlas_image, String(row[x]), origin + Vector2i(x, y) * int(WORLD_TILE_SIZE))

    _blend_object(image, chest_image, origin + Vector2i(160, 176))
    _blend_object(image, lever_image, origin + Vector2i(291, 128))
    return image

func _blend_tile(target: Image, atlas_image: Image, layout_key: String, top_left: Vector2i) -> void:
    var tile_id := String(TILE_IDS.get(layout_key, ""))
    if tile_id == "":
        return
    var tiles: Dictionary = _asset_set.get("tiles", {})
    var tile: Dictionary = tiles.get(tile_id, {})
    if tile.is_empty():
        return
    var source_pos := Vector2i(int(tile.get("col", 0)), int(tile.get("row", 0))) * int(SOURCE_TILE_SIZE)
    var tile_image := atlas_image.get_region(Rect2i(source_pos, Vector2i(int(SOURCE_TILE_SIZE), int(SOURCE_TILE_SIZE))))
    tile_image.resize(int(WORLD_TILE_SIZE), int(WORLD_TILE_SIZE), Image.INTERPOLATE_LANCZOS)
    target.blend_rect(tile_image, Rect2i(Vector2i.ZERO, Vector2i(int(WORLD_TILE_SIZE), int(WORLD_TILE_SIZE))), top_left)

func _blend_object(target: Image, source: Image, bottom_center: Vector2i) -> void:
    var sprite := source.duplicate()
    sprite.resize(int(WORLD_TILE_SIZE), int(WORLD_TILE_SIZE), Image.INTERPOLATE_LANCZOS)
    var top_left := bottom_center - Vector2i(int(WORLD_TILE_SIZE * 0.5), int(WORLD_TILE_SIZE))
    target.blend_rect(sprite, Rect2i(Vector2i.ZERO, Vector2i(int(WORLD_TILE_SIZE), int(WORLD_TILE_SIZE))), top_left)

func _image_size(path: String) -> Vector2i:
    var image := _load_image(path)
    if image == null:
        return Vector2i.ZERO
    return image.get_size()

func _alpha_stats(path: String) -> Dictionary:
    var image := _load_image(path)
    if image == null:
        return {"transparent": 0, "opaque": 0}
    var transparent := 0
    var opaque := 0
    for y in range(image.get_height()):
        for x in range(image.get_width()):
            if image.get_pixel(x, y).a <= 0.05:
                transparent += 1
            else:
                opaque += 1
    return {"transparent": transparent, "opaque": opaque}

func _load_image(path: String) -> Image:
    var file := FileAccess.open(path, FileAccess.READ)
    if file == null:
        _failures.append("Could not load image %s" % path)
        return null
    var image := Image.new()
    var err := image.load_png_from_buffer(file.get_buffer(file.get_length()))
    if err != OK:
        _failures.append("Could not decode PNG %s" % path)
        return null
    return image

func _image_has_contrast(image: Image) -> bool:
    var first := image.get_pixel(0, 0)
    var samples := [
        Vector2i(0, 0),
        Vector2i(int(image.get_width() / 2), int(image.get_height() / 2)),
        Vector2i(image.get_width() - 1, image.get_height() - 1)
    ]
    for sample in samples:
        if _color_distance(first, image.get_pixel(sample.x, sample.y)) > 0.02:
            return true
    return false

func _color_distance(a: Color, b: Color) -> float:
    var dr := a.r - b.r
    var dg := a.g - b.g
    var db := a.b - b.b
    var da := a.a - b.a
    return sqrt(dr * dr + dg * dg + db * db + da * da)

func _frames(count: int) -> void:
    for _i in range(count):
        await get_tree().process_frame

func _assert(condition: bool, message: String) -> void:
    if not condition:
        _failures.append(message)
