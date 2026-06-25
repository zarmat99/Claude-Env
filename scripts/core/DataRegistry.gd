extends Node
## Loads, validates, and exposes all res://data/*.json content, keyed by ID (autoload).
## Invalid content is recorded in _validation_errors and pushed loudly at boot. Schemas:
## docs/architecture/DATA_SCHEMAS.md.

const FILES := {
    "items": "res://data/items/items.json",
    "quests": "res://data/quests/quests.json",
    "dialogues": "res://data/dialogues/dialogues.json",
    "npcs": "res://data/npcs/npcs.json",
    "enemies": "res://data/enemies/enemies.json",
    "factions": "res://data/factions/factions.json",
    "skills": "res://data/skills/skills.json",
    "maps": "res://data/maps/maps.json",
}

const ID_PREFIXES := {
    "items": "item_",
    "quests": "quest_",
    "dialogues": "dialogue_",
    "npcs": "npc_",
    "enemies": "enemy_",
    "factions": "faction_",
    "skills": "skill_",
    "maps": "map_",
}

const ITEM_TYPES := ["weapon", "armor", "consumable", "quest", "material", "misc"]
const CONDITION_TYPES := [
    "has_item",
    "talked_to",
    "killed_enemy",
    "entered_area",
    "quest_stage_is",
    "quest_not_started",
    "quest_active",
    "quest_completed",
    "faction_reputation_at_least",
    "flag_set",
]

const DIALOGUE_ACTION_TYPES := [
    "set_flag",
    "start_quest",
    "advance_quest",
]

var _tables: Dictionary = {}
var _validation_errors: Array[String] = []
var _load_errors: Array[String] = []
var _valid := false

func _ready() -> void:
    for key in FILES:
        _tables[key] = _load_object(FILES[key])
    validate_all()

func validate_all() -> bool:
    _validation_errors.clear()
    _validation_errors.append_array(_load_errors)
    _validate_table_ids()
    _validate_items()
    _validate_factions()
    _validate_skills()
    _validate_npcs()
    _validate_enemies()
    _validate_quests()
    _validate_dialogues()
    _validate_maps_and_scenes()
    _valid = _validation_errors.is_empty()
    for error in _validation_errors:
        push_error("DataRegistry: %s" % error)
    return _valid

func is_valid() -> bool:
    return _valid

func get_validation_errors() -> Array[String]:
    var out: Array[String] = []
    out.append_array(_validation_errors)
    return out

func has_id(table: String, content_id: String) -> bool:
    return _tables.get(table, {}).has(content_id)

func _load_object(path: String) -> Dictionary:
    if not FileAccess.file_exists(path):
        _load_errors.append("Missing data file %s" % path)
        return {}
    var text := FileAccess.get_file_as_string(path)
    var parsed = JSON.parse_string(text)
    if typeof(parsed) != TYPE_DICTIONARY:
        _load_errors.append("%s is not a JSON object" % path)
        return {}
    return parsed

func _entry(table: String, content_id: String) -> Dictionary:
    var t: Dictionary = _tables.get(table, {})
    if not t.has(content_id):
        push_error("DataRegistry: '%s' not found in %s" % [content_id, table])
        return {}
    var entry = t[content_id]
    if not (entry is Dictionary):
        push_error("DataRegistry: '%s' in %s is not an object" % [content_id, table])
        return {}
    return entry

func all(table: String) -> Dictionary:
    return _tables.get(table, {})

func get_item(content_id: String) -> Dictionary: return _entry("items", content_id)
func get_quest(content_id: String) -> Dictionary: return _entry("quests", content_id)
func get_dialogue(content_id: String) -> Dictionary: return _entry("dialogues", content_id)
func get_npc(content_id: String) -> Dictionary: return _entry("npcs", content_id)
func get_enemy(content_id: String) -> Dictionary: return _entry("enemies", content_id)
func get_faction(content_id: String) -> Dictionary: return _entry("factions", content_id)
func get_skill(content_id: String) -> Dictionary: return _entry("skills", content_id)
func get_map(content_id: String) -> Dictionary: return _entry("maps", content_id)

func _validate_table_ids() -> void:
    var seen: Dictionary = {}
    for raw_table in FILES.keys():
        var table := String(raw_table)
        var entries: Dictionary = _tables.get(table, {})
        for key in entries.keys():
            var content_id := String(key)
            var entry = entries[key]
            if content_id == "":
                _error("%s has an empty content ID" % table)
                continue
            if seen.has(content_id):
                _error("Content ID '%s' appears in both %s and %s" % [content_id, seen[content_id], table])
            seen[content_id] = table
            if not content_id.begins_with(String(ID_PREFIXES.get(table, ""))):
                _error("%s ID '%s' does not use prefix '%s'" % [table, content_id, ID_PREFIXES.get(table, "")])
            if not (entry is Dictionary):
                _error("%s/%s must be a JSON object" % [table, content_id])
                continue
            if String(entry.get("id", "")) != content_id:
                _error("%s/%s has mismatched id '%s'" % [table, content_id, entry.get("id", "")])

func _validate_items() -> void:
    for raw_item_id in all("items").keys():
        var item_id := String(raw_item_id)
        var item := get_item(item_id)
        _require_string(item, "items/%s" % item_id, "name")
        var item_type := String(item.get("type", ""))
        if not ITEM_TYPES.has(item_type):
            _error("items/%s has unsupported type '%s'" % [item_id, item_type])
        var stackable := bool(item.get("stackable", false))
        var max_stack := int(item.get("max_stack", 1))
        if max_stack <= 0:
            _error("items/%s max_stack must be positive" % item_id)
        if not stackable and max_stack != 1:
            _error("items/%s is not stackable but max_stack is %d" % [item_id, max_stack])
        if item_type in ["weapon", "armor"]:
            _require_string(item, "items/%s" % item_id, "slot")

func _validate_factions() -> void:
    for raw_faction_id in all("factions").keys():
        var faction_id := String(raw_faction_id)
        var faction := get_faction(faction_id)
        _require_string(faction, "factions/%s" % faction_id, "name")
        for field in ["hostile_to", "friendly_to"]:
            var refs = faction.get(field, [])
            if not (refs is Array):
                _error("factions/%s.%s must be an array" % [faction_id, field])
                continue
            for ref in refs:
                _require_ref("factions", String(ref), "factions/%s.%s" % [faction_id, field])

func _validate_skills() -> void:
    for raw_skill_id in all("skills").keys():
        var skill_id := String(raw_skill_id)
        var skill := get_skill(skill_id)
        _require_string(skill, "skills/%s" % skill_id, "name")

func _validate_npcs() -> void:
    for raw_npc_id in all("npcs").keys():
        var npc_id := String(raw_npc_id)
        var npc := get_npc(npc_id)
        _require_string(npc, "npcs/%s" % npc_id, "name")
        _require_ref("factions", String(npc.get("faction", "")), "npcs/%s.faction" % npc_id)
        _require_ref("dialogues", String(npc.get("dialogue", "")), "npcs/%s.dialogue" % npc_id)
        _require_ref("maps", String(npc.get("home_map", "")), "npcs/%s.home_map" % npc_id)

func _validate_enemies() -> void:
    for raw_enemy_id in all("enemies").keys():
        var enemy_id := String(raw_enemy_id)
        var enemy := get_enemy(enemy_id)
        _require_string(enemy, "enemies/%s" % enemy_id, "name")
        _require_ref("factions", String(enemy.get("faction", "")), "enemies/%s.faction" % enemy_id)
        var stats = enemy.get("stats", {})
        if not (stats is Dictionary):
            _error("enemies/%s.stats must be an object" % enemy_id)
        else:
            for field in ["max_health", "damage", "move_speed"]:
                if int(stats.get(field, 0)) <= 0:
                    _error("enemies/%s.stats.%s must be positive" % [enemy_id, field])
        _validate_loot_table(enemy.get("loot_table", []), "enemies/%s.loot_table" % enemy_id)
        if int(enemy.get("xp_reward", 0)) < 0:
            _error("enemies/%s.xp_reward cannot be negative" % enemy_id)

func _validate_quests() -> void:
    for raw_quest_id in all("quests").keys():
        var quest_id := String(raw_quest_id)
        var quest := get_quest(quest_id)
        _require_string(quest, "quests/%s" % quest_id, "title")
        _require_ref("npcs", String(quest.get("giver", "")), "quests/%s.giver" % quest_id)
        var stages = quest.get("stages", [])
        if not (stages is Array) or stages.is_empty():
            _error("quests/%s.stages must be a non-empty array" % quest_id)
            continue
        var stage_ids: Array[int] = []
        for stage in stages:
            if not (stage is Dictionary):
                _error("quests/%s has a non-object stage" % quest_id)
                continue
            var stage_id := int(stage.get("stage", -2147483648))
            if stage_ids.has(stage_id):
                _error("quests/%s has duplicate stage %d" % [quest_id, stage_id])
            stage_ids.append(stage_id)
            _require_string(stage, "quests/%s.stage_%d" % [quest_id, stage_id], "desc")
            if stage.has("advance_on"):
                _validate_condition(stage.get("advance_on", {}), "quests/%s.stage_%d.advance_on" % [quest_id, stage_id])
            if stage.has("next") and stage.get("next", null) != null:
                var next_stage := int(stage.get("next", -2147483648))
                if not _quest_has_stage(quest_id, next_stage):
                    _error("quests/%s.stage_%d.next references missing stage %d" % [quest_id, stage_id, next_stage])
            if stage.has("rewards"):
                _validate_rewards(stage.get("rewards", {}), "quests/%s.stage_%d.rewards" % [quest_id, stage_id])

func _validate_dialogues() -> void:
    for raw_dialogue_id in all("dialogues").keys():
        var dialogue_id := String(raw_dialogue_id)
        var dialogue := get_dialogue(dialogue_id)
        var nodes = dialogue.get("nodes", {})
        if not (nodes is Dictionary) or nodes.is_empty():
            _error("dialogues/%s.nodes must be a non-empty object" % dialogue_id)
            continue
        var entry := String(dialogue.get("entry", ""))
        if entry == "" or not nodes.has(entry):
            _error("dialogues/%s.entry references missing node '%s'" % [dialogue_id, entry])
        for node_id in nodes.keys():
            var node = nodes[node_id]
            var path := "dialogues/%s.nodes.%s" % [dialogue_id, node_id]
            if not (node is Dictionary):
                _error("%s must be an object" % path)
                continue
            var speaker := String(node.get("speaker", ""))
            if speaker != "" and speaker != "player":
                _require_ref("npcs", speaker, "%s.speaker" % path)
            _require_string(node, path, "text")
            _validate_actions(node.get("actions", []), "%s.actions" % path)
            var choices = node.get("choices", [])
            if not (choices is Array):
                _error("%s.choices must be an array" % path)
                continue
            for index in range(choices.size()):
                var choice = choices[index]
                var choice_path := "%s.choices[%d]" % [path, index]
                if not (choice is Dictionary):
                    _error("%s must be an object" % choice_path)
                    continue
                _require_string(choice, choice_path, "text")
                _validate_actions(choice.get("actions", []), "%s.actions" % choice_path)
                var next = choice.get("next", null)
                if next != null and not nodes.has(String(next)):
                    _error("%s.next references missing node '%s'" % [choice_path, next])
                _validate_conditions(choice.get("conditions", []), "%s.conditions" % choice_path)

func _validate_maps_and_scenes() -> void:
    var map_spawn_points: Dictionary = {}
    var map_instances: Dictionary = {}
    var persistent_ids: Dictionary = {}

    for raw_map_id in all("maps").keys():
        var map_id := String(raw_map_id)
        var map := get_map(map_id)
        _require_string(map, "maps/%s" % map_id, "display_name")
        var scene_path := String(map.get("scene", ""))
        if scene_path == "" or not ResourceLoader.exists(scene_path):
            _error("maps/%s.scene is missing or invalid: %s" % [map_id, scene_path])
            continue
        var packed := load(scene_path) as PackedScene
        if packed == null:
            _error("maps/%s.scene could not be loaded: %s" % [map_id, scene_path])
            continue
        var instance := packed.instantiate()
        map_instances[map_id] = instance

        var declared_spawns = map.get("spawn_points", [])
        if not (declared_spawns is Array) or declared_spawns.is_empty():
            _error("maps/%s.spawn_points must be a non-empty array" % map_id)
            declared_spawns = []
        var actual_spawns := _collect_spawn_points(instance)
        map_spawn_points[map_id] = actual_spawns
        for spawn_id in declared_spawns:
            if not actual_spawns.has(String(spawn_id)):
                _error("maps/%s declares missing spawn point '%s'" % [map_id, spawn_id])
        for spawn_id in actual_spawns:
            if not declared_spawns.has(spawn_id):
                _error("maps/%s scene has undeclared spawn point '%s'" % [map_id, spawn_id])
        _validate_scene_world_objects(instance, map_id, persistent_ids)

    for raw_map_id in map_instances.keys():
        var map_id := String(raw_map_id)
        _validate_scene_transitions(map_instances[map_id], map_id, map_spawn_points)
        map_instances[map_id].free()

func _validate_scene_transitions(root: Node, map_id: String, map_spawn_points: Dictionary) -> void:
    for node in _walk_nodes(root):
        var target_map_id = node.get("target_map_id")
        var target_spawn_point_id = node.get("target_spawn_point_id")
        if target_map_id == null and target_spawn_point_id == null:
            continue
        var target_map := String(target_map_id)
        var target_spawn := String(target_spawn_point_id)
        if target_map == "":
            _error("maps/%s transition %s has empty target_map_id" % [map_id, node.name])
            continue
        _require_ref("maps", target_map, "maps/%s transition %s.target_map_id" % [map_id, node.name])
        if target_spawn == "":
            _error("maps/%s transition %s has empty target_spawn_point_id" % [map_id, node.name])
            continue
        var target_spawns: Array = map_spawn_points.get(target_map, [])
        if not target_spawns.has(target_spawn):
            _error("maps/%s transition %s targets missing spawn '%s' in %s" % [map_id, node.name, target_spawn, target_map])

func _validate_scene_world_objects(root: Node, map_id: String, persistent_ids: Dictionary) -> void:
    for node in _walk_nodes(root):
        var item_id = node.get("item_id")
        if item_id != null and String(item_id) != "":
            _require_ref("items", String(item_id), "maps/%s node %s.item_id" % [map_id, node.name])
        var enemy_id = node.get("enemy_id")
        if enemy_id != null and String(enemy_id) != "":
            _require_ref("enemies", String(enemy_id), "maps/%s node %s.enemy_id" % [map_id, node.name])
        var npc_id = node.get("npc_id")
        if npc_id != null and String(npc_id) != "":
            _require_ref("npcs", String(npc_id), "maps/%s node %s.npc_id" % [map_id, node.name])

        var persistent_id = node.get("persistent_id")
        if persistent_id == null:
            continue
        var pid := String(persistent_id)
        var needs_persistent := (item_id != null and String(item_id) != "") or (enemy_id != null and String(enemy_id) != "")
        if pid == "":
            if needs_persistent:
                _error("maps/%s node %s is persistable but has empty persistent_id" % [map_id, node.name])
            continue
        if persistent_ids.has(pid):
            _error("Duplicate persistent_id '%s' in %s and %s" % [pid, persistent_ids[pid], "maps/%s node %s" % [map_id, node.name]])
        persistent_ids[pid] = "maps/%s node %s" % [map_id, node.name]

func _validate_conditions(conditions, path: String) -> void:
    if not (conditions is Array):
        _error("%s must be an array" % path)
        return
    for index in range(conditions.size()):
        _validate_condition(conditions[index], "%s[%d]" % [path, index])

func _validate_condition(condition, path: String) -> void:
    if not (condition is Dictionary):
        _error("%s must be an object" % path)
        return
    var condition_type := String(condition.get("type", ""))
    if not CONDITION_TYPES.has(condition_type):
        _error("%s has unsupported condition type '%s'" % [path, condition_type])
        return
    match condition_type:
        "has_item":
            _require_ref("items", String(condition.get("target", "")), "%s.target" % path)
        "talked_to":
            _require_ref("npcs", String(condition.get("target", "")), "%s.target" % path)
        "killed_enemy":
            _require_ref("enemies", String(condition.get("target", "")), "%s.target" % path)
        "entered_area":
            _require_ref("maps", String(condition.get("target", "")), "%s.target" % path)
        "quest_stage_is":
            var quest_id := String(condition.get("quest", ""))
            _require_ref("quests", quest_id, "%s.quest" % path)
            var stage := int(condition.get("stage", -2147483648))
            if quest_id != "" and not _quest_has_stage(quest_id, stage):
                _error("%s.stage references missing stage %d in %s" % [path, stage, quest_id])
        "quest_not_started", "quest_active", "quest_completed":
            _require_ref("quests", String(condition.get("quest", "")), "%s.quest" % path)
        "faction_reputation_at_least":
            _require_ref("factions", String(condition.get("faction", "")), "%s.faction" % path)
        "flag_set":
            _require_string(condition, path, "flag")

func _validate_actions(actions, path: String) -> void:
    if actions == null:
        return
    if not (actions is Array):
        _error("%s must be an array" % path)
        return
    for index in range(actions.size()):
        var action = actions[index]
        var action_path := "%s[%d]" % [path, index]
        if not (action is Dictionary):
            _error("%s must be an object" % action_path)
            continue
        var action_type := String(action.get("type", ""))
        if not DIALOGUE_ACTION_TYPES.has(action_type):
            _error("%s has unsupported dialogue action type '%s'" % [action_path, action_type])
            continue
        match action_type:
            "set_flag":
                _require_string(action, action_path, "flag")
            "start_quest", "advance_quest":
                _require_ref("quests", String(action.get("quest", "")), "%s.quest" % action_path)

func _validate_rewards(rewards, path: String) -> void:
    if not (rewards is Dictionary):
        _error("%s must be an object" % path)
        return
    if int(rewards.get("xp", 0)) < 0:
        _error("%s.xp cannot be negative" % path)
    if int(rewards.get("gold", 0)) < 0:
        _error("%s.gold cannot be negative" % path)
    var items = rewards.get("items", [])
    if not (items is Array):
        _error("%s.items must be an array" % path)
        return
    for index in range(items.size()):
        var item = items[index]
        if not (item is Dictionary):
            _error("%s.items[%d] must be an object" % [path, index])
            continue
        _require_ref("items", String(item.get("id", "")), "%s.items[%d].id" % [path, index])
        if int(item.get("count", 1)) <= 0:
            _error("%s.items[%d].count must be positive" % [path, index])

func _validate_loot_table(loot_table, path: String) -> void:
    if not (loot_table is Array):
        _error("%s must be an array" % path)
        return
    for index in range(loot_table.size()):
        var entry = loot_table[index]
        if not (entry is Dictionary):
            _error("%s[%d] must be an object" % [path, index])
            continue
        _require_ref("items", String(entry.get("id", "")), "%s[%d].id" % [path, index])
        var chance := float(entry.get("chance", 0.0))
        if chance < 0.0 or chance > 1.0:
            _error("%s[%d].chance must be between 0 and 1" % [path, index])
        var count = entry.get("count", 1)
        if count is Array:
            if count.size() != 2 or int(count[0]) <= 0 or int(count[1]) < int(count[0]):
                _error("%s[%d].count range must be [positive_min, max]" % [path, index])
        elif int(count) <= 0:
            _error("%s[%d].count must be positive" % [path, index])

func _collect_spawn_points(root: Node) -> Array[String]:
    var out: Array[String] = []
    for node in _walk_nodes(root):
        var spawn_id = node.get("spawn_id")
        if spawn_id != null and String(spawn_id) != "":
            if out.has(String(spawn_id)):
                _error("Scene %s has duplicate spawn point '%s'" % [root.name, spawn_id])
            out.append(String(spawn_id))
    return out

func _walk_nodes(root: Node) -> Array[Node]:
    var out: Array[Node] = [root]
    var index := 0
    while index < out.size():
        var node := out[index]
        for child in node.get_children():
            if child is Node:
                out.append(child)
        index += 1
    return out

func _quest_has_stage(quest_id: String, stage_id: int) -> bool:
    for stage in get_quest(quest_id).get("stages", []):
        if stage is Dictionary and int(stage.get("stage", -2147483648)) == stage_id:
            return true
    return false

func _require_ref(table: String, content_id: String, path: String) -> void:
    if content_id == "":
        _error("%s is empty" % path)
    elif not has_id(table, content_id):
        _error("%s references missing %s ID '%s'" % [path, table, content_id])

func _require_string(entry: Dictionary, path: String, field: String) -> void:
    if String(entry.get(field, "")) == "":
        _error("%s.%s must be a non-empty string" % [path, field])

func _error(message: String) -> void:
    _validation_errors.append(message)
