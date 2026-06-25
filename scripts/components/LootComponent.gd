extends Node
class_name LootComponent
## Drops loot when its owner dies. `loot_table` is an array of { id, chance, count } (count may be
## an int or [min,max]); set it from enemy data. `drop` spawns PickupItem instances into the world.

const PickupItemScene := preload("res://scenes/items/PickupItem.tscn")

var loot_table: Array = []

func drop(at: Vector2, into: Node) -> void:
    var parent := into if into != null else get_tree().current_scene
    if parent == null:
        return
    for entry in loot_table:
        if randf() > float(entry.get("chance", 0.0)):
            continue
        var count = entry.get("count", 1)
        if count is Array and count.size() == 2:
            count = randi_range(int(count[0]), int(count[1]))
        var pickup := PickupItemScene.instantiate()
        pickup.item_id = String(entry.get("id", ""))
        pickup.count = int(count)
        parent.add_child(pickup)
        pickup.global_position = at + Vector2(randf_range(-12, 12), randf_range(-12, 12))
