extends RefCounted
## Pure stacking helpers shared by InventoryManager (player) and InventoryComponent (containers),
## so the stacking algorithm lives in one place. They operate in place on an `items` Array of
## {"id": String, "count": int} and honor stackable/max_stack from items.json (DataRegistry).
## No events here - each caller emits its own.

static func add(items: Array, item_id: String, count: int) -> bool:
    if item_id == "" or count <= 0 or not DataRegistry.has_id("items", item_id):
        return false
    var def := DataRegistry.get_item(item_id)
    var stackable := bool(def.get("stackable", false))
    var max_stack := int(def.get("max_stack", 1)) if stackable else 1
    var remaining := count
    if stackable:
        for slot in items:
            if String(slot.get("id", "")) == item_id and int(slot.get("count", 0)) < max_stack:
                var moved: int = min(max_stack - int(slot.get("count", 0)), remaining)
                slot["count"] = int(slot.get("count", 0)) + moved
                remaining -= moved
                if remaining <= 0:
                    break
    while remaining > 0:
        var put: int = min(max_stack, remaining) if stackable else 1
        items.append({"id": item_id, "count": put})
        remaining -= put
    return true

static func remove(items: Array, item_id: String, count: int) -> bool:
    if item_id == "" or count <= 0:
        return false
    if count_of(items, item_id) < count:
        return false
    var remaining := count
    for i in range(items.size() - 1, -1, -1):
        if String(items[i].get("id", "")) == item_id:
            var take: int = min(int(items[i].get("count", 0)), remaining)
            items[i]["count"] = int(items[i].get("count", 0)) - take
            remaining -= take
            if int(items[i]["count"]) <= 0:
                items.remove_at(i)
            if remaining <= 0:
                break
    return true

static func count_of(items: Array, item_id: String) -> int:
    var n := 0
    for slot in items:
        if String(slot.get("id", "")) == item_id:
            n += int(slot.get("count", 0))
    return n
