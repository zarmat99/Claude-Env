extends Node
class_name StatsComponent
## Minimal reusable stat bag (damage, move_speed, max_health, ...). M5 fills it from enemy data;
## the player will use it for derived stats from M8. Kept as a plain dictionary for flexibility.

@export var stats: Dictionary = {}

func set_stats(d: Dictionary) -> void:
    stats = d.duplicate(true)

func get_stat(key: String, default_value = 0):
    return stats.get(key, default_value)
