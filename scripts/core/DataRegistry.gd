extends Node
## Loads + exposes all res://data/*.json content, keyed by ID (autoload). Each file is a JSON
## object { "<id>": {...}, ... }. Lookups return the entry dict, or {} (with a warning) if absent.
## Schemas: docs/architecture/DATA_SCHEMAS.md.

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

var _tables: Dictionary = {}

func _ready() -> void:
    for key in FILES:
        _tables[key] = _load_object(FILES[key])

func _load_object(path: String) -> Dictionary:
    if not FileAccess.file_exists(path):
        push_warning("DataRegistry: missing data file %s" % path)
        return {}
    var text := FileAccess.get_file_as_string(path)
    var parsed = JSON.parse_string(text)
    if typeof(parsed) != TYPE_DICTIONARY:
        push_error("DataRegistry: %s is not a JSON object" % path)
        return {}
    return parsed

func _entry(table: String, id: String) -> Dictionary:
    var t: Dictionary = _tables.get(table, {})
    if not t.has(id):
        push_warning("DataRegistry: '%s' not found in %s" % [id, table])
        return {}
    return t[id]

func all(table: String) -> Dictionary:
    return _tables.get(table, {})

func get_item(id: String) -> Dictionary: return _entry("items", id)
func get_quest(id: String) -> Dictionary: return _entry("quests", id)
func get_dialogue(id: String) -> Dictionary: return _entry("dialogues", id)
func get_npc(id: String) -> Dictionary: return _entry("npcs", id)
func get_enemy(id: String) -> Dictionary: return _entry("enemies", id)
func get_faction(id: String) -> Dictionary: return _entry("factions", id)
func get_skill(id: String) -> Dictionary: return _entry("skills", id)
func get_map(id: String) -> Dictionary: return _entry("maps", id)
