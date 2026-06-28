extends Node
## Headless regression for the M13 item/economy core:
## equipment + derived stats + save/load, consumable item use, and buy/sell economy (direct and via
## dialogue actions).

var _failures: Array[String] = []

const EQUIPMENT_SAVE_SLOT := 95

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    _run.call_deferred()

func _run() -> void:
    print("[M13] Economy/equipment runner starting")
    _test_data_validation()
    _test_equipment()
    _test_equipment_save_load_with_armor()
    _test_item_use()
    _test_economy()
    _test_merchant_dialogue()
    _test_container_inventory()
    _test_merchant_stock_pricing()
    _test_merchant_npc_dialogue()
    await get_tree().process_frame

    if _failures.is_empty():
        print("[M13] Economy/equipment runner OK")
        get_tree().quit(0)
    else:
        for failure in _failures:
            push_error("[M13] %s" % failure)
        print("[M13] Economy/equipment runner FAILED with %d failure(s)" % _failures.size())
        get_tree().quit(1)

func _test_data_validation() -> void:
    _assert(DataRegistry.validate_all(), "DataRegistry validation failed: %s" % str(DataRegistry.get_validation_errors()))

func _test_equipment() -> void:
    GameState.reset_to_new_game()
    _assert(EquipmentManager.get_effective_stat("damage") == 6, "Base damage should be 6 with nothing equipped")

    InventoryManager.add("item_iron_sword", 1)
    _assert(EquipmentManager.equip("item_iron_sword"), "Should equip the iron sword from inventory")
    _assert(EquipmentManager.get_equipped("main_hand") == "item_iron_sword", "Iron sword should occupy main_hand")
    _assert(InventoryManager.get_count("item_iron_sword") == 0, "Equipping should remove the item from inventory")
    _assert(EquipmentManager.get_effective_stat("damage") == 12, "Equipped iron sword should add +6 damage")
    _assert(EquipmentManager.is_equipped("item_iron_sword"), "is_equipped should report the sword")

    InventoryManager.add("item_leather_armor", 1)
    _assert(EquipmentManager.equip("item_leather_armor"), "Should equip leather armor")
    _assert(EquipmentManager.get_effective_stat("max_health") == 40, "Leather armor should add +10 max health")

    _assert(EquipmentManager.unequip("chest"), "Should unequip the chest slot")
    _assert(InventoryManager.get_count("item_leather_armor") == 1, "Unequipping should return the armor to inventory")
    _assert(EquipmentManager.get_equipped("chest") == "", "Chest slot should be empty after unequip")
    _assert(EquipmentManager.get_effective_stat("max_health") == 30, "Max health should drop back to base after unequip")

    # Save/load round trip preserves equipment.
    _assert(SaveManager.save_game(94), "Saving equipped state should succeed")
    GameState.reset_to_new_game()
    _assert(EquipmentManager.get_equipped("main_hand") == "", "Reset should clear equipment")
    _assert(SaveManager.load_game(94), "Loading equipped state should succeed")
    _assert(EquipmentManager.get_equipped("main_hand") == "item_iron_sword", "Loaded save should restore the equipped sword")

func _test_equipment_save_load_with_armor() -> void:
    get_tree().paused = false
    GameState.reset_to_new_game()
    var player := Node2D.new()
    player.name = "EquipmentSaveProbe"
    player.add_to_group("player")
    var health := HealthComponent.new()
    health.name = "HealthComponent"
    player.add_child(health)
    add_child(player)

    InventoryManager.add("item_leather_armor", 1)
    _assert(EquipmentManager.equip("item_leather_armor"), "Should equip armor before save/load")
    _assert(int(GameState.player["stats"].get("max_health", 0)) == 30, "Equipping armor should not mutate base max health")
    _assert(EquipmentManager.get_effective_stat("max_health") == 40, "Armor should derive effective max health")
    health.setup(EquipmentManager.get_effective_stat("max_health"), 35)

    _assert(SaveManager.save_game(EQUIPMENT_SAVE_SLOT), "Saving armored health state should succeed")
    _assert(int(GameState.player["stats"].get("max_health", 0)) == 30, "Saving should not bake armor max health into base stats")
    _assert(int(GameState.player["stats"].get("health", 0)) == 35, "Saving should preserve current effective health")

    GameState.reset_to_new_game()
    health.setup(30, 30)
    _assert(SaveManager.load_game(EQUIPMENT_SAVE_SLOT), "Loading armored health state should succeed")
    _assert(EquipmentManager.get_equipped("chest") == "item_leather_armor", "Loaded save should restore equipped armor")
    _assert(int(GameState.player["stats"].get("max_health", 0)) == 30, "Loading should keep base max health unmodified")
    _assert(EquipmentManager.get_effective_stat("max_health") == 40, "Loaded armor should still derive effective max health")
    _assert(health.max_health == 40, "Live health component should load with effective max health")
    _assert(health.health == 35, "Live health component should preserve current effective health")

    _cleanup_save_slot(EQUIPMENT_SAVE_SLOT)
    player.queue_free()

func _test_item_use() -> void:
    GameState.reset_to_new_game()
    GameState.player["stats"]["health"] = 10
    InventoryManager.add("item_health_potion", 1)
    _assert(InventoryManager.use_item("item_health_potion"), "Using a potion at low health should succeed")
    _assert(int(GameState.player["stats"]["health"]) == 30, "Healing should clamp to effective max health (30)")
    _assert(InventoryManager.get_count("item_health_potion") == 0, "Using a potion should consume it")

    InventoryManager.add("item_health_potion", 1)
    _assert(not InventoryManager.use_item("item_health_potion"), "Using a potion at full health should fail")
    _assert(InventoryManager.get_count("item_health_potion") == 1, "A wasted use should keep the potion")

func _test_economy() -> void:
    GameState.reset_to_new_game()
    GameState.player["gold"] = 100
    _assert(EconomyManager.buy_price("item_health_potion") == 10, "Potion buy price should be its value")
    _assert(EconomyManager.sell_price("item_iron_sword") == 12, "Sword sell price should be half value, floored")

    _assert(EconomyManager.buy("item_health_potion", 2), "Should buy two potions with enough gold")
    _assert(int(GameState.player["gold"]) == 80, "Buying two potions should cost 20 gold")
    _assert(InventoryManager.get_count("item_health_potion") == 2, "Buying should add the potions")

    GameState.player["gold"] = 5
    _assert(not EconomyManager.buy("item_health_potion", 1), "Should not buy without enough gold")
    _assert(int(GameState.player["gold"]) == 5, "A failed buy should not spend gold")

    InventoryManager.add("item_iron_sword", 1)
    _assert(EconomyManager.sell("item_iron_sword", 1), "Should sell the iron sword")
    _assert(int(GameState.player["gold"]) == 17, "Selling the sword should credit 12 gold")
    _assert(InventoryManager.get_count("item_iron_sword") == 0, "Selling should remove the sword")

func _test_merchant_dialogue() -> void:
    get_tree().paused = false
    GameState.reset_to_new_game()
    GameState.player["gold"] = 50
    DialogueManager.start("dialogue_m13_merchant_fixture")
    DialogueManager.choose(0)  # gold >= 10 -> Buy a health potion
    _assert(InventoryManager.get_count("item_health_potion") == 1, "Merchant dialogue buy should add a potion")
    _assert(int(GameState.player["gold"]) == 40, "Merchant dialogue buy should spend 10 gold")
    _assert(not DialogueManager.is_active(), "Buying should end the dialogue")

    get_tree().paused = false
    GameState.reset_to_new_game()
    GameState.player["gold"] = 0
    InventoryManager.add("item_iron_sword", 1)
    DialogueManager.start("dialogue_m13_merchant_fixture")
    DialogueManager.choose(0)  # buy gated out (no gold) -> Sell the iron sword is first visible
    _assert(int(GameState.player["gold"]) == 12, "Merchant dialogue sell should credit 12 gold")
    _assert(InventoryManager.get_count("item_iron_sword") == 0, "Merchant dialogue sell should remove the sword")
    _assert(not DialogueManager.is_active(), "Selling should end the dialogue")

# --- M13-T4: reusable container inventory ---
func _test_container_inventory() -> void:
    GameState.reset_to_new_game()
    var container := InventoryComponent.new()
    add_child(container)
    container.set_contents([
        {"id": "item_health_potion", "count": 2},
        {"id": "item_iron_sword", "count": 1},
    ])
    _assert(container.get_count("item_health_potion") == 2, "Container should hold two potions")
    _assert(container.get_count("item_iron_sword") == 1, "Container should hold one sword")
    _assert(container.add("item_health_potion", 1), "Container add should succeed")
    _assert(container.get_count("item_health_potion") == 3, "Container should stack to three potions")
    container.transfer_all_to_player()
    _assert(container.is_empty(), "Container should be empty after transfer")
    _assert(InventoryManager.get_count("item_health_potion") == 3, "Transfer should move potions to the player")
    _assert(InventoryManager.get_count("item_iron_sword") == 1, "Transfer should move the sword to the player")
    container.queue_free()

# --- M13-T5: data-authored merchant stock + pricing ---
func _test_merchant_stock_pricing() -> void:
    GameState.reset_to_new_game()
    GameState.player["gold"] = 100
    var merchant := "merchant_valdombra_general"
    _assert(EconomyManager.buy_price("item_health_potion", merchant) == 10, "Merchant potion price should be 10")
    _assert(EconomyManager.buy("item_health_potion", 1, merchant), "Should buy a stocked potion from the merchant")
    _assert(int(GameState.player["gold"]) == 90, "Merchant buy should spend 10 gold")
    _assert(not EconomyManager.buy("item_ancient_iron_fragment", 1, merchant), "Should not buy an item the merchant does not stock")
    _assert(int(GameState.player["gold"]) == 90, "A blocked buy should not spend gold")
    InventoryManager.add("item_iron_sword", 1)
    _assert(EconomyManager.sell("item_iron_sword", 1, merchant), "Should sell the sword to the merchant")
    _assert(int(GameState.player["gold"]) == 102, "Merchant sell should credit 12 gold")

func _test_merchant_npc_dialogue() -> void:
    get_tree().paused = false
    # A broke player can still browse the wares: buy options are always shown (not gold-gated).
    GameState.reset_to_new_game()
    GameState.player["gold"] = 0
    DialogueManager.start("dialogue_merchant_valdombra")
    _assert(DialogueManager.is_active(), "Merchant dialogue should open")
    DialogueManager.choose(0)  # Buy a health potion - refused (no gold), loops back to start
    _assert(InventoryManager.get_count("item_health_potion") == 0, "A broke buy should not add a potion")
    _assert(int(GameState.player["gold"]) == 0, "A broke buy should not spend gold")
    _assert(DialogueManager.is_active(), "Merchant should stay open after a refused buy")

    # With gold, buying works and the merchant stays open to trade again.
    GameState.player["gold"] = 50
    DialogueManager.choose(0)  # Buy a health potion
    _assert(InventoryManager.get_count("item_health_potion") == 1, "Buying with gold should add a potion")
    _assert(int(GameState.player["gold"]) == 40, "Buying should spend 10 gold")
    _assert(DialogueManager.is_active(), "Merchant should stay open after a purchase")
    DialogueManager.choose(2)  # (Leave): visible = [buy potion, buy armor, (Leave)] (no sword to sell)
    _assert(not DialogueManager.is_active(), "Leaving should end the merchant dialogue")

func _assert(condition: bool, message: String) -> void:
    if not condition:
        _failures.append(message)

func _cleanup_save_slot(slot: int) -> void:
    var dir := DirAccess.open("user://saves")
    if dir:
        dir.remove("slot_%d.json" % slot)
