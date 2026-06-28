extends Node
## Runtime source of truth (autoload). Everything persistable is reachable from here,
## so SaveManager can serialize a single snapshot. Schema mirrors
## docs/architecture/DATA_SCHEMAS.md.

var current_map: String = ""

var player: Dictionary = {
    "position": Vector2.ZERO,
    "stats": {"level": 1, "xp": 0, "max_health": 30, "health": 30, "damage": 6},
    "gold": 0,
    "inventory": [],          # Array of {"id": String, "count": int}
    "equipment": {},          # slot -> item_id
}

var quests: Dictionary = {"active": {}, "completed": []}   # active: quest_id -> {"stage": int}
var factions: Dictionary = {}                              # faction_id -> {"reputation": int}
var flags: Dictionary = {}                                 # flag -> bool
var world_objects: Dictionary = {}                         # persistent_id -> {"state": String}
var kills: Dictionary = {}                                 # enemy_id -> count killed (M5+)

func reset_to_new_game() -> void:
    current_map = ""
    player = {
        "position": Vector2.ZERO,
        "stats": {"level": 1, "xp": 0, "max_health": 30, "health": 30, "damage": 6},
        "gold": 0,
        "inventory": [],
        "equipment": {},
    }
    quests = {"active": {}, "completed": []}
    factions = _default_factions()
    flags = {}
    world_objects = {}
    kills = {}

func _default_factions() -> Dictionary:
    var out: Dictionary = {}
    for raw_faction_id in DataRegistry.all("factions").keys():
        var faction_id := String(raw_faction_id)
        out[faction_id] = {"reputation": int(DataRegistry.get_faction(faction_id).get("default_reputation", 0))}
    return out
