extends Node
## Player equipment broker (autoload). Operates on GameState.player.equipment (slot -> item_id), the
## single source of truth, so save/load stays trivial. Equippable items are weapons/armor that
## declare a `slot`; their `stats` contribute derived bonuses on top of the base player stats
## (e.g. weapon `damage`, armor `max_health`). Derived values are computed on demand - never stored -
## so there is no save migration. Mirrors the InventoryManager pattern (M13).

const EQUIPPABLE_TYPES := ["weapon", "armor"]

## Equip an item from the player's inventory into its declared slot. Any item already in that slot is
## returned to the inventory. Returns false (and pushes an error) for unknown or non-equippable items.
func equip(item_id: String) -> bool:
    if not DataRegistry.has_id("items", item_id):
        push_error("EquipmentManager: cannot equip unknown item '%s'" % item_id)
        return false
    var def := DataRegistry.get_item(item_id)
    var slot := String(def.get("slot", ""))
    if slot == "" or not _is_equippable(def):
        push_error("EquipmentManager: item '%s' is not equippable" % item_id)
        return false
    if InventoryManager.get_count(item_id) <= 0:
        return false
    InventoryManager.remove(item_id, 1)
    var previous := get_equipped(slot)
    if previous != "":
        InventoryManager.add(previous, 1)
    GameState.player["equipment"][slot] = item_id
    EventBus.equipment_changed.emit(slot, item_id)
    return true

## Unequip whatever is in `slot`, returning it to the inventory.
func unequip(slot: String) -> bool:
    var equipped := get_equipped(slot)
    if equipped == "":
        return false
    GameState.player.get("equipment", {}).erase(slot)
    InventoryManager.add(equipped, 1)
    EventBus.equipment_changed.emit(slot, "")
    return true

func get_equipped(slot: String) -> String:
    return String(GameState.player.get("equipment", {}).get(slot, ""))

func is_equipped(item_id: String) -> bool:
    for equipped in GameState.player.get("equipment", {}).values():
        if String(equipped) == item_id:
            return true
    return false

## Sum of a single stat across all equipped items (0 if none contribute it).
func get_stat_bonus(stat_key: String) -> int:
    var total := 0
    for item_id in GameState.player.get("equipment", {}).values():
        var stats = DataRegistry.get_item(String(item_id)).get("stats", {})
        if stats is Dictionary:
            total += int(stats.get(stat_key, 0))
    return total

## Base player stat plus the equipment bonus. Combat/health read this rather than the raw base.
func get_effective_stat(stat_key: String) -> int:
    return int(GameState.player.get("stats", {}).get(stat_key, 0)) + get_stat_bonus(stat_key)

func _is_equippable(def: Dictionary) -> bool:
    return String(def.get("type", "")) in EQUIPPABLE_TYPES
