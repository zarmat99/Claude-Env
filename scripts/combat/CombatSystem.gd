extends Node
## Central combat rules (M14). All typed damage should pass through here so armor, resistances, and
## future status rules stay out of player/enemy scripts.

const DAMAGE_TYPES := ["physical", "fire", "frost", "arcane", "poison"]

func make_damage(amount: int, damage_type: String = "physical", source: Node = null, armor_pierce: int = 0) -> DamageData:
    return DamageData.new(amount, _normalize_damage_type(damage_type), source, armor_pierce)

func damage_actor(source: Node, target: Node, amount: int, damage_type: String = "physical", armor_pierce: int = 0) -> int:
    return apply_damage(target, make_damage(amount, damage_type, source, armor_pierce))

func apply_damage(target: Node, damage: DamageData) -> int:
    if target == null or damage == null:
        return 0
    var health: Node = target.get_node_or_null("HealthComponent")
    if health == null or not health.has_method("take_damage"):
        return 0
    var final_amount: int = calculate_damage(target, damage)
    if final_amount <= 0:
        return 0
    health.take_damage(final_amount, damage.source)
    return final_amount

func calculate_damage(target: Node, damage: DamageData) -> int:
    if target == null or damage == null or damage.amount <= 0:
        return 0
    var damage_type := _normalize_damage_type(damage.damage_type)
    var resistance: float = clamp(_actor_resistance(target, damage_type), -0.75, 0.9)
    var after_resistance: int = int(ceil(float(damage.amount) * (1.0 - resistance)))
    var armor: int = max(0, _actor_armor(target) - damage.armor_pierce)
    return max(1, after_resistance - armor)

func is_damage_type(value: String) -> bool:
    return DAMAGE_TYPES.has(value)

func _normalize_damage_type(value: String) -> String:
    return value if DAMAGE_TYPES.has(value) else "physical"

func _actor_armor(actor: Node) -> int:
    if actor == null:
        return 0
    if actor.is_in_group("player"):
        var base: int = int(GameState.player.get("stats", {}).get("armor", 0))
        return max(0, base + EquipmentManager.get_stat_bonus("armor"))
    var stats: Node = actor.get_node_or_null("StatsComponent")
    if stats and stats.has_method("get_stat"):
        return max(0, int(stats.get_stat("armor", 0)))
    return 0

func _actor_resistance(actor: Node, damage_type: String) -> float:
    if actor == null:
        return 0.0
    var total: float = 0.0
    if actor.is_in_group("player"):
        total += _resistance_from_dict(GameState.player.get("stats", {}).get("resistances", {}), damage_type)
        for item_id in GameState.player.get("equipment", {}).values():
            var item_stats = DataRegistry.get_item(String(item_id)).get("stats", {})
            if item_stats is Dictionary:
                total += _resistance_from_dict(item_stats.get("resistances", {}), damage_type)
        return total
    var stats: Node = actor.get_node_or_null("StatsComponent")
    if stats and stats.has_method("get_stat"):
        total += _resistance_from_dict(stats.get_stat("resistances", {}), damage_type)
    return total

func _resistance_from_dict(value, damage_type: String) -> float:
    if value is Dictionary:
        return float(value.get(damage_type, 0.0))
    return 0.0
