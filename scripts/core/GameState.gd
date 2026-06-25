extends Node
## Runtime source of truth (autoload). Everything persistable is reachable from here,
## so SaveManager can serialize a single snapshot. M0: structure only; fields are
## populated as systems land. Schema mirrors docs/architecture/DATA_SCHEMAS.md.

var current_map: String = ""

var player: Dictionary = {
    "position": Vector2.ZERO,
    "stats": {"level": 1, "xp": 0, "max_health": 30, "health": 30},
    "gold": 0,
    "inventory": [],          # Array of {"id": String, "count": int}
    "equipment": {},          # slot -> item_id
}

var quests: Dictionary = {"active": {}, "completed": []}   # active: quest_id -> {"stage": int}
var factions: Dictionary = {}                              # faction_id -> {"reputation": int}
var flags: Dictionary = {}                                 # flag -> bool
var world_objects: Dictionary = {}                         # persistent_id -> {"state": String}

func reset_to_new_game() -> void:
    # M0 stub: real new-game defaults are wired when systems land (M1+).
    pass
