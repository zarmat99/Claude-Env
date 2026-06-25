extends Node
class_name LootComponent
## Drops loot when its owner dies. `loot_table` is an array of { id, chance, count } (count may be
## an int or [min,max]); set it from enemy data. `drop` spawns PickupItem instances into the world.

const PickupItemScene := preload("res://scenes/items/PickupItem.tscn")
const PersistentWorldObject = preload("res://scripts/world/PersistentWorldObject.gd")

var loot_table: Array = []

func drop(at: Vector2, into: Node, source_persistent_id: String = "") -> void:
    var parent := into if into != null else get_tree().current_scene
    if parent == null:
        return
    if GameState.current_map == "":
        push_error("LootComponent: cannot drop persistent loot without a current map")
        return
    var drop_index := 0
    for entry in loot_table:
        if randf() > float(entry.get("chance", 0.0)):
            continue
        var item_id := String(entry.get("id", ""))
        if not DataRegistry.has_id("items", item_id):
            push_error("LootComponent: unknown loot item '%s'" % item_id)
            continue
        var count = entry.get("count", 1)
        if count is Array and count.size() == 2:
            count = randi_range(int(count[0]), int(count[1]))
        var final_count := int(count)
        if final_count <= 0:
            continue
        var persistent_id := _dynamic_pickup_id(source_persistent_id, drop_index)
        var drop_position := at + Vector2(randf_range(-12, 12), randf_range(-12, 12))
        PersistentWorldObject.register_dynamic_pickup(
            persistent_id,
            item_id,
            final_count,
            String(GameState.current_map),
            drop_position
        )
        var pickup := PickupItemScene.instantiate()
        pickup.item_id = item_id
        pickup.count = final_count
        pickup.persistent_id = persistent_id
        parent.add_child(pickup)
        pickup.global_position = drop_position
        drop_index += 1

func _dynamic_pickup_id(source_persistent_id: String, index: int) -> String:
    if source_persistent_id != "":
        return "drop_%s_%02d" % [source_persistent_id, index]
    return "drop_%s_%d_%02d" % [String(GameState.current_map), Time.get_ticks_msec(), index]
