extends Node
## Loads + validates res://data/*.json at boot and exposes typed lookups by ID (autoload).
## M0: stub. Eager JSON loading is wired per milestone as each table is needed.
## Schemas: docs/architecture/DATA_SCHEMAS.md.

const DATA_DIR := "res://data/"

func _ready() -> void:
    # M0 stub: no eager load yet. Lookups return {} and warn until implemented.
    pass

func get_item(id: String) -> Dictionary: return _not_impl("item", id)
func get_quest(id: String) -> Dictionary: return _not_impl("quest", id)
func get_dialogue(id: String) -> Dictionary: return _not_impl("dialogue", id)
func get_npc(id: String) -> Dictionary: return _not_impl("npc", id)
func get_enemy(id: String) -> Dictionary: return _not_impl("enemy", id)
func get_faction(id: String) -> Dictionary: return _not_impl("faction", id)
func get_skill(id: String) -> Dictionary: return _not_impl("skill", id)
func get_map(id: String) -> Dictionary: return _not_impl("map", id)

func _not_impl(table: String, id: String) -> Dictionary:
    push_warning("DataRegistry.%s lookup not implemented yet (M0 stub): %s" % [table, id])
    return {}
