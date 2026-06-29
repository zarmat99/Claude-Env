extends Node
## Buy/sell broker (autoload). Prices derive from each item's `value`; gold lives in
## GameState.player.gold. Buy/sell mutate the inventory through InventoryManager and emit
## `gold_changed`. Merchant stock and per-merchant pricing are future work; this is the shared
## price/trade engine (M13).

const BUY_MULTIPLIER := 1.0    # player pays full value by default
const SELL_MULTIPLIER := 0.5   # player recovers half value on sale

## Prices optionally use a merchant's multipliers; with no merchant the defaults above apply.
func buy_price(item_id: String, merchant_id: String = "") -> int:
    return int(ceil(float(_value(item_id)) * _multiplier(merchant_id, "buy_multiplier", BUY_MULTIPLIER)))

func sell_price(item_id: String, merchant_id: String = "") -> int:
    return int(floor(float(_value(item_id)) * _multiplier(merchant_id, "sell_multiplier", SELL_MULTIPLIER)))

func get_gold() -> int:
    return int(GameState.player.get("gold", 0))

func can_buy(item_id: String, count: int = 1, merchant_id: String = "") -> bool:
    if not DataRegistry.has_id("items", item_id) or count <= 0:
        return false
    if not _in_stock(merchant_id, item_id):
        return false
    return get_gold() >= buy_price(item_id, merchant_id) * count

## Buy `count` of an item if affordable (and stocked, when a merchant is given). No spend on failure.
func buy(item_id: String, count: int = 1, merchant_id: String = "") -> bool:
    if not DataRegistry.has_id("items", item_id) or count <= 0:
        push_error("EconomyManager: invalid buy of '%s' x%d" % [item_id, count])
        return false
    if not _in_stock(merchant_id, item_id):
        EventBus.trade_failed.emit(item_id, "out_of_stock")
        return false
    var cost := buy_price(item_id, merchant_id) * count
    if get_gold() < cost:
        EventBus.trade_failed.emit(item_id, "insufficient_gold")
        return false
    if not InventoryManager.add(item_id, count):
        EventBus.trade_failed.emit(item_id, "inventory_full")
        return false
    _set_gold(get_gold() - cost)
    return true

## Sell `count` of an item the player owns, crediting gold. Returns false if they lack the items.
func sell(item_id: String, count: int = 1, merchant_id: String = "") -> bool:
    if not DataRegistry.has_id("items", item_id) or count <= 0:
        push_error("EconomyManager: invalid sell of '%s' x%d" % [item_id, count])
        return false
    if InventoryManager.get_count(item_id) < count:
        return false
    var gain := sell_price(item_id, merchant_id) * count
    InventoryManager.remove(item_id, count)
    _set_gold(get_gold() + gain)
    return true

func _set_gold(value: int) -> void:
    GameState.player["gold"] = max(0, value)
    EventBus.gold_changed.emit(GameState.player["gold"])

func _value(item_id: String) -> int:
    return int(DataRegistry.get_item(item_id).get("value", 0))

func _multiplier(merchant_id: String, key: String, default_value: float) -> float:
    if merchant_id == "" or not DataRegistry.has_id("merchants", merchant_id):
        return default_value
    return float(DataRegistry.get_merchant(merchant_id).get(key, default_value))

## True if the merchant stocks the item (always true when no merchant is given - a generic trade).
func _in_stock(merchant_id: String, item_id: String) -> bool:
    if merchant_id == "":
        return true
    if not DataRegistry.has_id("merchants", merchant_id):
        return false
    var stock = DataRegistry.get_merchant(merchant_id).get("stock", [])
    return stock is Array and stock.has(item_id)
