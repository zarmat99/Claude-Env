extends Node
## Headless systems stress gate for SR4.
## It injects a large synthetic content set into DataRegistry in memory, validates it,
## exercises a mid-flow save/load, then restores the real project data.

const PersistentWorldObject := preload("res://scripts/world/PersistentWorldObject.gd")

const SAVE_SLOT := 96
const MIN_MAPS := 10
const MIN_NPCS := 20
const MIN_QUESTS := 10
const MIN_ITEMS := 50
const MIN_FACTIONS := 5
const MIN_MERCHANTS := 4
const MIN_DUNGEONS := 3

var _failures: Array[String] = []
var _backup_tables: Dictionary = {}

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_run.call_deferred()

func _run() -> void:
	print("[SR4] Systems stress runner starting")
	_backup_data_registry()
	_inject_stress_dataset()
	_test_stress_validation_and_counts()
	await _test_midflow_save_load()
	_restore_data_registry()
	_cleanup_save_slot(SAVE_SLOT)
	await _frames(2)

	if _failures.is_empty():
		print("[SR4] Systems stress runner OK")
		get_tree().quit(0)
	else:
		for failure in _failures:
			push_error("[SR4] %s" % failure)
		print("[SR4] Systems stress runner FAILED with %d failure(s)" % _failures.size())
		get_tree().quit(1)

func _backup_data_registry() -> void:
	_backup_tables.clear()
	for table in DataRegistry._tables.keys():
		_backup_tables[String(table)] = DataRegistry._tables[table].duplicate(true)

func _restore_data_registry() -> void:
	DataRegistry._tables.clear()
	for table in _backup_tables.keys():
		DataRegistry._tables[String(table)] = _backup_tables[table].duplicate(true)
	_assert(DataRegistry.validate_all(), "DataRegistry should validate after restoring real data: %s" % str(DataRegistry.get_validation_errors()))

func _inject_stress_dataset() -> void:
	for table in DataRegistry._tables.keys():
		DataRegistry._tables[table] = DataRegistry._tables[table].duplicate(true)

	_add_stress_items()
	_add_stress_factions()
	_add_stress_merchants()
	_add_stress_dialogues()
	_add_stress_maps()
	_add_stress_quests()
	_add_stress_npcs()

func _add_stress_items() -> void:
	var items: Dictionary = DataRegistry._tables["items"]
	var index := 1
	while items.size() < MIN_ITEMS:
		var item_id := "item_sr4_material_%03d" % index
		items[item_id] = {
			"id": item_id,
			"name": "SR4 Material %03d" % index,
			"type": "material",
			"stackable": true,
			"max_stack": 99,
			"value": 1 + index,
			"weight": 0.1,
			"description": "Synthetic SR4 stress item."
		}
		index += 1

func _add_stress_factions() -> void:
	var factions: Dictionary = DataRegistry._tables["factions"]
	for index in range(1, 4):
		var faction_id := "faction_sr4_%02d" % index
		factions[faction_id] = {
			"id": faction_id,
			"name": "SR4 Faction %02d" % index,
			"default_reputation": 0,
			"hostile_to": ["faction_monsters"] if index == 1 else [],
			"friendly_to": ["faction_valdombra_village"] if index == 2 else []
		}

func _add_stress_merchants() -> void:
	var merchants: Dictionary = DataRegistry._tables["merchants"]
	var stock := ["item_health_potion", "item_iron_sword", "item_leather_armor", "item_sr4_material_001", "item_sr4_material_002"]
	for index in range(1, 4):
		var merchant_id := "merchant_sr4_%02d" % index
		merchants[merchant_id] = {
			"id": merchant_id,
			"name": "SR4 Merchant %02d" % index,
			"buy_multiplier": 1.0 + float(index) * 0.05,
			"sell_multiplier": 0.45,
			"stock": stock
		}

func _add_stress_dialogues() -> void:
	var dialogues: Dictionary = DataRegistry._tables["dialogues"]
	dialogues["dialogue_sr4_generic"] = {
		"id": "dialogue_sr4_generic",
		"entry": "start",
		"nodes": {
			"start": {
				"speaker": "player",
				"text": "SR4 synthetic dialogue fixture.",
				"choices": [
					{"text": "(Leave)", "next": null}
				]
			}
		}
	}

func _add_stress_maps() -> void:
	var maps: Dictionary = DataRegistry._tables["maps"]
	var index := 1
	while maps.size() < MIN_MAPS:
		var map_id := "map_sr4_dungeon_%02d" % index
		maps[map_id] = _build_stress_map(map_id, index)
		index += 1

func _build_stress_map(map_id: String, index: int) -> Dictionary:
	var enemy_pid := "enemy_sr4_%02d_001" % index
	var chest_pid := "chest_sr4_%02d_001" % index
	var door_pid := "door_sr4_%02d_001" % index
	var switch_pid := "switch_sr4_%02d_001" % index
	return {
		"id": map_id,
		"scene": "res://scenes/maps/TrialDungeon.tscn",
		"display_name": "SR4 Stress Dungeon %02d" % index,
		"region": "region_sr4_stress",
		"dev_role": "stress_dungeon" if index <= MIN_DUNGEONS else "stress_region",
		"asset_set": "asset_generated_m10r_dev",
		"spawn_points": ["spawn_entry"],
		"authoring": {
			"width": 4,
			"height": 4,
			"layers": {
				"ground": _filled_layer(4, 4, "tile_generated_cave_floor_a")
			},
			"collision_rects": [
				{"name": "north_wall", "position": {"x": 128, "y": -16}, "size": {"x": 256, "y": 32}},
				{"name": "south_wall", "position": {"x": 128, "y": 272}, "size": {"x": 256, "y": 32}},
				{"name": "west_wall", "position": {"x": -16, "y": 128}, "size": {"x": 32, "y": 256}},
				{"name": "east_wall", "position": {"x": 272, "y": 128}, "size": {"x": 32, "y": 256}}
			],
			"spawns": [
				{"id": "spawn_entry", "position": {"x": 64, "y": 192}}
			],
			"transitions": [],
			"objects": [
				{"name": "StressGate", "world_object": "world_object_dungeon_door", "persistent_id": door_pid, "position": {"x": 128, "y": 64}, "required_item_id": "item_sr4_material_001", "consume_required_item": false},
				{"name": "StressSwitch", "world_object": "world_object_dungeon_switch", "persistent_id": switch_pid, "position": {"x": 64, "y": 64}, "target_persistent_id": door_pid},
				{"name": "StressEnemy", "world_object": "world_object_dungeon_enemy", "persistent_id": enemy_pid, "position": {"x": 192, "y": 128}, "enemy_id": "enemy_trial_sentinel" if index == 1 else "enemy_cave_rat"},
				{"name": "StressChest", "world_object": "world_object_dungeon_chest", "persistent_id": chest_pid, "position": {"x": 192, "y": 192}, "loot": [{"id": "item_health_potion", "count": 1}, {"id": "item_sr4_material_002", "count": 2}]}
			],
			"encounters": [
				{
					"id": "encounter_sr4_%02d" % index,
					"name": "SR4 Encounter %02d" % index,
					"kind": "boss" if index == 1 else "combat",
					"enemy_persistent_ids": [enemy_pid],
					"gate_persistent_ids": [door_pid],
					"reward_persistent_ids": [chest_pid]
				}
			]
		}
	}

func _filled_layer(width: int, height: int, tile_id: String) -> Array:
	var rows: Array = []
	for _y in range(height):
		var row: Array = []
		for _x in range(width):
			row.append(tile_id)
		rows.append(row)
	return rows

func _add_stress_quests() -> void:
	var quests: Dictionary = DataRegistry._tables["quests"]
	var index := 1
	while quests.size() < MIN_QUESTS:
		var quest_id := "quest_sr4_%03d" % index
		quests[quest_id] = {
			"id": quest_id,
			"title": "SR4 Quest %03d" % index,
			"giver": "npc_sr4_fixture_001",
			"stages": [
				{
					"stage": 0,
					"desc": "Collect an SR4 material.",
					"advance_on": {"type": "has_item", "target": "item_sr4_material_001", "count": 1},
					"next": 10
				},
				{
					"stage": 10,
					"desc": "SR4 stress quest complete.",
					"completes": true,
					"rewards": {"xp": 4, "gold": 1, "items": [{"id": "item_sr4_material_002", "count": 1}]}
				}
			]
		}
		index += 1

func _add_stress_npcs() -> void:
	var npcs: Dictionary = DataRegistry._tables["npcs"]
	var quest_ids := _stress_ids(DataRegistry._tables["quests"], "quest_sr4_")
	for index in range(1, MIN_NPCS + 1):
		var npc_id := "npc_sr4_fixture_%03d" % index
		var role := "villager"
		var merchant_id := ""
		var quests_offered: Array = []
		if index <= quest_ids.size():
			role = "quest_giver"
			quests_offered.append(quest_ids[index - 1])
		elif index % 5 == 0:
			role = "merchant"
			merchant_id = "merchant_sr4_%02d" % (((index / 5 - 1) % 3) + 1)
		elif index % 3 == 0:
			role = "guard"
		npcs[npc_id] = {
			"id": npc_id,
			"name": "SR4 NPC %03d" % index,
			"faction": "faction_sr4_%02d" % (((index - 1) % 3) + 1),
			"dialogue": "dialogue_sr4_generic",
			"home_map": "map_sr4_dungeon_01",
			"role": role,
			"services": ["trade"] if role == "merchant" else [],
			"quests_offered": quests_offered
		}
		if role == "merchant":
			npcs[npc_id]["merchant"] = merchant_id

func _stress_ids(table: Dictionary, prefix: String) -> Array:
	var out: Array = []
	for key in table.keys():
		var id := String(key)
		if id.begins_with(prefix):
			out.append(id)
	out.sort()
	return out

func _test_stress_validation_and_counts() -> void:
	_assert(DataRegistry.validate_all(), "Stress DataRegistry validation failed: %s" % str(DataRegistry.get_validation_errors()))
	_assert(DataRegistry.all("maps").size() >= MIN_MAPS, "Stress dataset should expose at least %d maps" % MIN_MAPS)
	_assert(DataRegistry.all("npcs").size() >= MIN_NPCS, "Stress dataset should expose at least %d NPCs" % MIN_NPCS)
	_assert(DataRegistry.all("quests").size() >= MIN_QUESTS, "Stress dataset should expose at least %d quests" % MIN_QUESTS)
	_assert(DataRegistry.all("items").size() >= MIN_ITEMS, "Stress dataset should expose at least %d items" % MIN_ITEMS)
	_assert(DataRegistry.all("factions").size() >= MIN_FACTIONS, "Stress dataset should expose at least %d factions" % MIN_FACTIONS)
	_assert(DataRegistry.all("merchants").size() >= MIN_MERCHANTS, "Stress dataset should expose at least %d merchants" % MIN_MERCHANTS)
	_assert(_count_dungeon_maps() >= MIN_DUNGEONS, "Stress dataset should expose at least %d dungeon-like maps" % MIN_DUNGEONS)
	_assert(_count_encounters() >= MIN_DUNGEONS, "Stress dataset should expose several authored encounters")

func _count_dungeon_maps() -> int:
	var count := 0
	for raw_map_id in DataRegistry.all("maps").keys():
		var map := DataRegistry.get_map(String(raw_map_id))
		if String(map.get("dev_role", "")).contains("dungeon"):
			count += 1
	return count

func _count_encounters() -> int:
	var count := 0
	for raw_map_id in DataRegistry.all("maps").keys():
		var map := DataRegistry.get_map(String(raw_map_id))
		var authoring = map.get("authoring", {})
		if authoring is Dictionary:
			var encounters = authoring.get("encounters", [])
			if encounters is Array:
				count += encounters.size()
	return count

func _test_midflow_save_load() -> void:
	GameState.reset_to_new_game()
	GameState.current_map = "map_sr4_dungeon_01"
	GameState.player["position"] = Vector2(144, 96)
	GameState.player["gold"] = 23
	FactionManager.ensure_defaults()
	FactionManager.change_reputation("faction_sr4_01", 17)
	QuestManager.start_quest("quest_sr4_001")
	_assert(QuestManager.get_stage("quest_sr4_001") == 0, "SR4 quest should start at stage 0")
	_assert(InventoryManager.add("item_sr4_material_001", 1), "SR4 material should be addable")
	_assert(QuestManager.is_completed("quest_sr4_001"), "SR4 quest should complete after collecting the material")
	GameState.kills["enemy_trial_sentinel"] = 1
	PersistentWorldObject.set_state("door_sr4_01_001", PersistentWorldObject.STATE_OPEN)
	PersistentWorldObject.set_state("switch_sr4_01_001", PersistentWorldObject.STATE_ON)
	PersistentWorldObject.set_state("enemy_sr4_01_001", PersistentWorldObject.STATE_DEAD)
	PersistentWorldObject.set_state("chest_sr4_01_001", PersistentWorldObject.STATE_OPENED)

	_assert(SaveManager.save_game(SAVE_SLOT), "SR4 mid-flow save should succeed")
	GameState.reset_to_new_game()
	_assert(SaveManager.load_game(SAVE_SLOT), "SR4 mid-flow load should succeed")
	await _frames(2)

	_assert(GameState.current_map == "map_sr4_dungeon_01", "Loaded stress save should restore current map")
	_assert(GameState.player.get("gold", 0) == 24, "Loaded stress save should restore gold and quest reward")
	_assert(InventoryManager.get_count("item_sr4_material_001") == 1, "Loaded stress save should restore stress inventory")
	_assert(QuestManager.is_completed("quest_sr4_001"), "Loaded stress save should restore completed stress quest")
	_assert(FactionManager.get_reputation("faction_sr4_01") == 17, "Loaded stress save should restore stress faction reputation")
	_assert(int(GameState.kills.get("enemy_trial_sentinel", 0)) == 1, "Loaded stress save should restore kill counters")
	_assert(PersistentWorldObject.has_state("door_sr4_01_001", PersistentWorldObject.STATE_OPEN), "Loaded stress save should restore door state")
	_assert(PersistentWorldObject.has_state("switch_sr4_01_001", PersistentWorldObject.STATE_ON), "Loaded stress save should restore switch state")
	_assert(PersistentWorldObject.has_state("enemy_sr4_01_001", PersistentWorldObject.STATE_DEAD), "Loaded stress save should restore enemy state")
	_assert(PersistentWorldObject.has_state("chest_sr4_01_001", PersistentWorldObject.STATE_OPENED), "Loaded stress save should restore chest state")

func _frames(count: int) -> void:
	for _i in range(count):
		await get_tree().process_frame

func _cleanup_save_slot(slot: int) -> void:
	var dir := DirAccess.open("user://saves")
	if dir:
		dir.remove("slot_%d.json" % slot)

func _assert(condition: bool, message: String) -> void:
	if not condition:
		_failures.append(message)
