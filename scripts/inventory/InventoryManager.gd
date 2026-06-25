extends Node
## Player inventory broker (autoload). Operates on GameState.player.inventory (the single source
## of truth, so saving stays trivial). Honors stackable/max_stack from items.json (DataRegistry).
## Non-player inventories (containers, merchants, loot) will use a dedicated InventoryComponent
## node when those land (M5+); this manager is the player's.

func add(item_id: String, count: int = 1) -> void:
    if item_id == "" or count <= 0:
        return
    var def := DataRegistry.get_item(item_id)
    var stackable := bool(def.get("stackable", false))
    var max_stack := int(def.get("max_stack", 1)) if stackable else 1
    var inv: Array = GameState.player["inventory"]
    var remaining := count
    if stackable:
        for slot in inv:
            if String(slot.get("id", "")) == item_id and int(slot.get("count", 0)) < max_stack:
                var moved: int = min(max_stack - int(slot.get("count", 0)), remaining)
                slot["count"] = int(slot.get("count", 0)) + moved
                remaining -= moved
                if remaining <= 0:
                    break
    while remaining > 0:
        var put: int = min(max_stack, remaining) if stackable else 1
        inv.append({"id": item_id, "count": put})
        remaining -= put
    EventBus.item_added.emit(item_id, count)

func remove(item_id: String, count: int = 1) -> bool:
    if item_id == "" or count <= 0 or get_count(item_id) < count:
        return false
    var inv: Array = GameState.player["inventory"]
    var remaining := count
    for i in range(inv.size() - 1, -1, -1):
        if String(inv[i].get("id", "")) == item_id:
            var take: int = min(int(inv[i].get("count", 0)), remaining)
            inv[i]["count"] = int(inv[i].get("count", 0)) - take
            remaining -= take
            if int(inv[i]["count"]) <= 0:
                inv.remove_at(i)
            if remaining <= 0:
                break
    EventBus.item_removed.emit(item_id, count)
    return true

func get_count(item_id: String) -> int:
    var n := 0
    for slot in GameState.player["inventory"]:
        if String(slot.get("id", "")) == item_id:
            n += int(slot.get("count", 0))
    return n

func get_items() -> Array:
    return GameState.player["inventory"]
