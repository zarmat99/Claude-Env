extends Node2D
## Draws an Image Gen object candidate using registry metadata instead of ad-hoc scene scaling.

@export var generated_asset_id: String = ""
@export var collision_enabled: bool = true

const WorldScale := preload("res://scripts/core/WorldScale.gd")

var _sprite: Sprite2D = null
var _body: StaticBody2D = null

func _ready() -> void:
    _apply_asset()

func _apply_asset() -> void:
    if generated_asset_id == "":
        push_warning("GeneratedPropSprite: generated_asset_id is empty on %s" % name)
        return

    var asset := DataRegistry.get_generated_asset(generated_asset_id)
    if asset.is_empty():
        return

    var loaded_texture := load(String(asset.get("processed_file", ""))) as Texture2D
    if loaded_texture == null:
        push_error("GeneratedPropSprite: could not load processed_file for %s" % generated_asset_id)
        return

    z_index = int(asset.get("visual_z_index", 0))
    z_as_relative = false

    var world_size := _size_from_dict(asset.get("world_size", {}), loaded_texture.get_size())

    _sprite = Sprite2D.new()
    _sprite.name = "Sprite"
    _sprite.texture = loaded_texture
    _sprite.centered = false
    _sprite.offset = Vector2(-loaded_texture.get_width() * 0.5, -loaded_texture.get_height())
    _sprite.scale = Vector2(
        world_size.x / float(loaded_texture.get_width()),
        world_size.y / float(loaded_texture.get_height())
    )
    add_child(_sprite)

    if collision_enabled and String(asset.get("collision_shape", "")) != "none":
        _add_collision(asset)

func _add_collision(asset: Dictionary) -> void:
    var footprint := _size_from_dict(asset.get("footprint_tiles", {}), Vector2.ONE)
    var default_collision_size := Vector2(
        footprint.x * WorldScale.TILE_SIZE,
        footprint.y * WorldScale.TILE_SIZE
    )
    var collision_size := _size_from_dict(asset.get("collision_size", {}), default_collision_size)
    if collision_size.x <= 0.0 or collision_size.y <= 0.0:
        return

    _body = StaticBody2D.new()
    _body.name = "Collision"
    _body.collision_layer = 1
    _body.collision_mask = 1
    _body.position = _size_from_dict(
        asset.get("collision_offset", {}),
        Vector2(0.0, -collision_size.y * 0.5)
    )
    add_child(_body)

    var shape := RectangleShape2D.new()
    shape.size = collision_size

    var collision := CollisionShape2D.new()
    collision.name = "Footprint"
    collision.shape = shape
    _body.add_child(collision)

func _size_from_dict(value, fallback: Vector2) -> Vector2:
    if not (value is Dictionary):
        return fallback
    return Vector2(
        float(value.get("x", fallback.x)),
        float(value.get("y", fallback.y))
    )
