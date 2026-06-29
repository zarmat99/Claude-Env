extends RefCounted
class_name DamageData
## Lightweight damage packet. CombatSystem owns mitigation and application rules; callers pass this
## instead of raw integers when damage type or armor pierce matters.

var amount: int = 0
var damage_type: String = "physical"
var source: Node = null
var armor_pierce: int = 0

func _init(p_amount: int = 0, p_damage_type: String = "physical", p_source: Node = null, p_armor_pierce: int = 0) -> void:
    amount = max(0, p_amount)
    damage_type = p_damage_type if p_damage_type != "" else "physical"
    source = p_source
    armor_pierce = max(0, p_armor_pierce)
