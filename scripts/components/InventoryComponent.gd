extends Node
class_name InventoryComponent
## Reusable non-player item container (chests/containers now; merchants/NPC bags later). Holds its
## own item list and reuses ItemStacking so stacking matches the player inventory. It never touches
## GameState - that is the player's InventoryManager - so containers stay self-contained.

const ItemStacking = preload("res://scripts/inventory/ItemStacking.gd")

signal inventory_changed()

var items: Array = []

## Replace contents from an authored list of {"id", "count"} entries.
func set_contents(contents: Array) -> void:
    items = []
    for entry in contents:
        if entry is Dictionary:
            ItemStacking.add(items, String(entry.get("id", "")), int(entry.get("count", 1)))
    inventory_changed.emit()

func add(item_id: String, count: int = 1) -> bool:
    if not ItemStacking.add(items, item_id, count):
        return false
    inventory_changed.emit()
    return true

func remove(item_id: String, count: int = 1) -> bool:
    if not ItemStacking.remove(items, item_id, count):
        return false
    inventory_changed.emit()
    return true

func get_count(item_id: String) -> int:
    return ItemStacking.count_of(items, item_id)

func get_items() -> Array:
    return items

func is_empty() -> bool:
    return items.is_empty()

## Move all contents into the player's inventory (via InventoryManager), emptying this container.
func transfer_all_to_player() -> void:
    for slot in items.duplicate(true):
        InventoryManager.add(String(slot.get("id", "")), int(slot.get("count", 0)))
    items = []
    inventory_changed.emit()
