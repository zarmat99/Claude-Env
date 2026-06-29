extends Node2D
class_name AuthoredMap
## Builds a lightweight data-authored map from maps.json. M10 keeps this deliberately simple:
## JSON defines layers, collision-bearing tiles, spawn points, transitions, and placed objects.

const SpawnPointScript := preload("res://scripts/world/SpawnPoint.gd")
const AreaTransitionScript := preload("res://scripts/world/AreaTransition.gd")

@export var map_id: String = ""

var _built := false
var _entry: Dictionary = {}
var _asset_set: Dictionary = {}
var _authoring: Dictionary = {}
var _atlas: Texture2D = null
var _world_tile_size := 64.0

func _enter_tree() -> void:
    _build_from_data()

func _build_from_data() -> void:
    if _built or map_id == "":
        return
    _built = true

    _entry = DataRegistry.get_map(map_id)
    _authoring = _entry.get("authoring", {})
    _asset_set = DataRegistry.get_asset_set(String(_entry.get("asset_set", "")))
    if _entry.is_empty() or _authoring.is_empty() or _asset_set.is_empty():
        push_error("AuthoredMap: '%s' is missing map authoring or asset_set data" % map_id)
        return

    _world_tile_size = float(_asset_set.get("world_tile_size", 64))
    _atlas = load(String(_asset_set.get("atlas", ""))) as Texture2D

    _build_tile_collisions()
    _build_collision_rects()
    _build_spawns()
    _build_transitions()
    _build_objects()
    queue_redraw()

func _draw() -> void:
    if _atlas == null:
        return
    var layers: Dictionary = _authoring.get("layers", {})
    for layer_name in layers.keys():
        _draw_layer(layers[layer_name])
    _draw_collision_rects()
    _draw_object_tiles()

func _draw_layer(layer) -> void:
    if not (layer is Array):
        return
    for y in range(layer.size()):
        var row = layer[y]
        if not (row is Array):
            continue
        for x in range(row.size()):
            var tile_id := String(row[x])
            if tile_id == "":
                continue
            _draw_tile(tile_id, Vector2(x * _world_tile_size, y * _world_tile_size))

func _draw_object_tiles() -> void:
    for object in _authoring.get("objects", []):
        if not (object is Dictionary):
            continue
        var object_def := DataRegistry.get_world_object(String(object.get("world_object", "")))
        var tile_id := String(object_def.get("asset_tile", ""))
        if tile_id == "":
            continue
        var position := _dict_to_vector(object.get("position", {}))
        _draw_tile(tile_id, position - Vector2(_world_tile_size, _world_tile_size) * 0.5)

func _draw_tile(tile_id: String, top_left: Vector2) -> void:
    var rect := _tile_source_rect(tile_id)
    if rect.size == Vector2.ZERO:
        return
    draw_texture_rect_region(_atlas, Rect2(top_left, Vector2(_world_tile_size, _world_tile_size)), rect)

func _tile_source_rect(tile_id: String) -> Rect2:
    var tiles: Dictionary = _asset_set.get("tiles", {})
    var tile: Dictionary = tiles.get(tile_id, {})
    if tile.is_empty():
        return Rect2()
    var source_size := float(_asset_set.get("source_tile_size", 128))
    return Rect2(
        Vector2(int(tile.get("col", 0)) * source_size, int(tile.get("row", 0)) * source_size),
        Vector2(source_size, source_size)
    )

func _build_tile_collisions() -> void:
    var body := StaticBody2D.new()
    body.name = "TileSolids"
    add_child(body)

    var layers: Dictionary = _authoring.get("layers", {})
    var claimed: Dictionary = {}
    for layer_name in layers.keys():
        var layer = layers[layer_name]
        if not (layer is Array):
            continue
        for y in range(layer.size()):
            var row = layer[y]
            if not (row is Array):
                continue
            for x in range(row.size()):
                var tile_id := String(row[x])
                if tile_id == "":
                    continue
                if _tile_collision(tile_id) == "none":
                    continue
                var cell_key := "%d:%d" % [x, y]
                if claimed.has(cell_key):
                    continue
                claimed[cell_key] = true
                var shape := RectangleShape2D.new()
                shape.size = Vector2(_world_tile_size, _world_tile_size)
                var collision := CollisionShape2D.new()
                collision.shape = shape
                collision.position = Vector2((x + 0.5) * _world_tile_size, (y + 0.5) * _world_tile_size)
                body.add_child(collision)

func _build_collision_rects() -> void:
    var rects = _authoring.get("collision_rects", [])
    if not (rects is Array) or rects.is_empty():
        return
    var body := StaticBody2D.new()
    body.name = "AuthoredSolids"
    add_child(body)
    for rect in rects:
        if not (rect is Dictionary):
            continue
        var shape := RectangleShape2D.new()
        shape.size = _dict_to_vector(rect.get("size", {}))
        var collision := CollisionShape2D.new()
        collision.name = _node_name(String(rect.get("name", "Solid")))
        collision.shape = shape
        collision.position = _dict_to_vector(rect.get("position", {}))
        body.add_child(collision)

func _draw_collision_rects() -> void:
    var rects = _authoring.get("collision_rects", [])
    if not (rects is Array):
        return
    for rect in rects:
        if not (rect is Dictionary):
            continue
        var size := _dict_to_vector(rect.get("size", {}))
        var position := _dict_to_vector(rect.get("position", {}))
        var color := Color(0.12, 0.12, 0.14, 0.95)
        draw_rect(Rect2(position - size * 0.5, size), color)

func _tile_collision(tile_id: String) -> String:
    var tiles: Dictionary = _asset_set.get("tiles", {})
    var tile: Dictionary = tiles.get(tile_id, {})
    return String(tile.get("collision", "none"))

func _build_spawns() -> void:
    for spawn in _authoring.get("spawns", []):
        if not (spawn is Dictionary):
            continue
        var node := SpawnPointScript.new()
        node.name = _node_name(String(spawn.get("id", "SpawnPoint")))
        node.spawn_id = String(spawn.get("id", ""))
        node.position = _dict_to_vector(spawn.get("position", {}))
        add_child(node)

func _build_transitions() -> void:
    for transition in _authoring.get("transitions", []):
        if not (transition is Dictionary):
            continue
        var node := AreaTransitionScript.new()
        node.name = String(transition.get("name", "AreaTransition"))
        node.position = _dict_to_vector(transition.get("position", {}))
        node.size = _dict_to_vector(transition.get("size", {"x": 32, "y": 32}))
        node.target_map_id = String(transition.get("target_map", ""))
        node.target_spawn_point_id = String(transition.get("target_spawn", ""))
        node.color = Color(0.35, 0.25, 0.55, 0.55)
        add_child(node)

func _build_objects() -> void:
    for object in _authoring.get("objects", []):
        if not (object is Dictionary):
            continue
        var object_def := DataRegistry.get_world_object(String(object.get("world_object", "")))
        var scene_path := String(object_def.get("scene", ""))
        var packed := load(scene_path) as PackedScene
        if packed == null:
            push_error("AuthoredMap: object '%s' could not load %s" % [object.get("name", ""), scene_path])
            continue
        var node := packed.instantiate()
        node.name = String(object.get("name", object_def.get("id", "WorldObject")))
        _configure_object(node, object, String(object_def.get("kind", "")))
        add_child(node)
        if node is Node2D:
            node.position = _dict_to_vector(object.get("position", {}))

func _configure_object(node: Node, object: Dictionary, kind: String) -> void:
    if _has_property(node, "persistent_id"):
        node.set("persistent_id", String(object.get("persistent_id", "")))
    match kind:
        "chest":
            if _has_property(node, "loot_items"):
                node.set("loot_items", object.get("loot", []))
        "door":
            if _has_property(node, "starts_open"):
                node.set("starts_open", bool(object.get("starts_open", false)))
            if _has_property(node, "required_item_id"):
                node.set("required_item_id", String(object.get("required_item_id", "")))
            if _has_property(node, "consume_required_item"):
                node.set("consume_required_item", bool(object.get("consume_required_item", false)))
        "switch":
            if _has_property(node, "target_persistent_id"):
                node.set("target_persistent_id", String(object.get("target_persistent_id", "")))
        "pickup":
            if _has_property(node, "item_id"):
                node.set("item_id", String(object.get("item_id", "")))
            if _has_property(node, "count"):
                node.set("count", int(object.get("count", 1)))
        "enemy":
            if _has_property(node, "enemy_id") and String(object.get("enemy_id", "")) != "":
                node.set("enemy_id", String(object.get("enemy_id", "")))

func _dict_to_vector(value) -> Vector2:
    if value is Vector2:
        return value
    if value is Dictionary:
        return Vector2(float(value.get("x", 0.0)), float(value.get("y", 0.0)))
    return Vector2.ZERO

func _has_property(node: Object, property_name: String) -> bool:
    for property in node.get_property_list():
        if String(property.get("name", "")) == property_name:
            return true
    return false

func _node_name(raw: String) -> String:
    var pieces := raw.split("_", false)
    var out := ""
    for piece in pieces:
        out += piece.capitalize()
    return out if out != "" else "Node"
