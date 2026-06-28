extends Node
## Buy/sell broker (autoload). Prices derive from each item's `value`; gold lives in
## GameState.player.gold. Buy/sell mutate the inventory through InventoryManager and emit
## `gold_changed`. Merchant stock and per-merchant pricing are future work; this is the shared
## price/trade engine (M13).

const BUY_MULTIPLIER := 1.0    # player pays full value by default
const SELL_MULTIPLIER := 0.5   # player recovers half value on sale

func buy_price(item_id: String) -> int:
    return int(ceil(float(_value(item_id)) * BUY_MULTIPLIER))

func sell_price(item_id: String) -> int:
    return int(floor(float(_value(item_id)) * SELL_MULTIPLIER))

func get_gold() -> int:
    return int(GameState.player.get("gold", 0))

func can_buy(item_id: String, count: int = 1) -> bool:
    return DataRegistry.has_id("items", item_id) and count > 0 and get_gold() >= buy_price(item_id) * count

## Buy `count` of an item if the player can afford it. Returns false without spending on failure.
func buy(item_id: String, count: int = 1) -> bool:
    if not DataRegistry.has_id("items", item_id) or count <= 0:
        push_error("EconomyManager: invalid buy of '%s' x%d" % [item_id, count])
        return false
    var cost := buy_price(item_id) * count
    if get_gold() < cost:
        return false
    if not InventoryManager.add(item_id, count):
        return false
    _set_gold(get_gold() - cost)
    return true

## Sell `count` of an item the player owns, crediting gold. Returns false if they lack the items.
func sell(item_id: String, count: int = 1) -> bool:
    if not DataRegistry.has_id("items", item_id) or count <= 0:
        push_error("EconomyManager: invalid sell of '%s' x%d" % [item_id, count])
        return false
    if InventoryManager.get_count(item_id) < count:
        return false
    var gain := sell_price(item_id) * count
    InventoryManager.remove(item_id, count)
    _set_gold(get_gold() + gain)
    return true

func _set_gold(value: int) -> void:
    GameState.player["gold"] = max(0, value)
    EventBus.gold_changed.emit(GameState.player["gold"])

func _value(item_id: String) -> int:
    return int(DataRegistry.get_item(item_id).get("value", 0))
