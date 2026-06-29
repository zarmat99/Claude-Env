extends Node
class_name PlayerAbilities
## Executes data-authored combat abilities/spells from skills.json. This keeps ability logic out of
## PlayerCombat, which remains responsible only for the basic melee swing.

var _cooldowns: Dictionary = {}

@onready var _player: Node2D = get_parent() as Node2D
@onready var _health: HealthComponent = $"../HealthComponent"

func _ready() -> void:
    SkillManager.ensure_player_skills()

func _process(delta: float) -> void:
    for skill_id in _cooldowns.keys():
        _cooldowns[skill_id] = max(0.0, float(_cooldowns[skill_id]) - delta)

func _unhandled_input(event: InputEvent) -> void:
    for raw_skill_id in DataRegistry.all("skills").keys():
        var skill_id := String(raw_skill_id)
        var skill := DataRegistry.get_skill(skill_id)
        if not (skill.get("ability", null) is Dictionary):
            continue
        var action: String = String(skill.get("input_action", ""))
        if action != "" and InputMap.has_action(action) and event.is_action_pressed(action):
            use_ability(skill_id)
            get_viewport().set_input_as_handled()
            return

func use_ability(skill_id: String) -> bool:
    if not DataRegistry.has_id("skills", skill_id):
        push_error("PlayerAbilities: unknown skill '%s'" % skill_id)
        return false
    if get_cooldown_remaining(skill_id) > 0.0:
        return false
    var skill := DataRegistry.get_skill(skill_id)
    var ability = skill.get("ability", {})
    if not (ability is Dictionary):
        return false

    var succeeded: bool = false
    match String(ability.get("type", "")):
        "area_damage":
            succeeded = _use_area_damage(ability)
        "self_heal":
            succeeded = _use_self_heal(ability)
        _:
            push_error("PlayerAbilities: unsupported ability type '%s'" % String(ability.get("type", "")))
            return false

    if succeeded:
        _cooldowns[skill_id] = max(0.0, float(skill.get("cooldown", 0.0)))
        SkillManager.grant_use_xp(skill_id)
        EventBus.skill_used.emit(skill_id)
    return succeeded

func get_cooldown_remaining(skill_id: String) -> float:
    return float(_cooldowns.get(skill_id, 0.0))

func _use_area_damage(ability: Dictionary) -> bool:
    var center: Vector2 = _player.global_position
    var origin: String = String(ability.get("origin", "nearest_enemy"))
    var range: float = max(0.0, float(ability.get("range", 0.0)))
    if origin == "nearest_enemy":
        var target := _nearest_enemy(range)
        if target == null:
            return false
        center = target.global_position

    var radius: float = max(1.0, float(ability.get("radius", 1.0)))
    var amount: int = _ability_damage(ability)
    var damage_type: String = String(ability.get("damage_type", "physical"))
    var armor_pierce: int = max(0, int(ability.get("armor_pierce", 0)))
    var hit_any: bool = false
    for enemy in get_tree().get_nodes_in_group("enemy"):
        if not (enemy is Node2D) or not is_instance_valid(enemy):
            continue
        var enemy_node := enemy as Node2D
        if enemy_node.global_position.distance_to(center) > radius:
            continue
        if CombatSystem.damage_actor(_player, enemy_node, amount, damage_type, armor_pierce) > 0:
            hit_any = true
    return hit_any

func _use_self_heal(ability: Dictionary) -> bool:
    if _health == null or not _health.is_alive():
        return false
    var before: int = _health.health
    _health.heal(max(1, int(ability.get("amount", 1))))
    return _health.health > before

func _ability_damage(ability: Dictionary) -> int:
    var amount: int = max(0, int(ability.get("damage", 0)))
    var scale_stat: String = String(ability.get("scale_stat", ""))
    if scale_stat != "":
        amount += int(round(float(EquipmentManager.get_effective_stat(scale_stat)) * float(ability.get("scale", 0.0))))
    return max(1, amount)

func _nearest_enemy(max_range: float) -> Node2D:
    var best: Node2D = null
    var best_distance: float = INF
    for enemy in get_tree().get_nodes_in_group("enemy"):
        if not (enemy is Node2D) or not is_instance_valid(enemy):
            continue
        var enemy_node := enemy as Node2D
        var health: Node = enemy_node.get_node_or_null("HealthComponent")
        if health and health.has_method("is_alive") and not health.is_alive():
            continue
        var distance: float = _player.global_position.distance_to(enemy_node.global_position)
        if distance <= max_range and distance < best_distance:
            best = enemy_node
            best_distance = distance
    return best
