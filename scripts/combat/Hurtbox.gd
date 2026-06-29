extends Area2D
class_name Hurtbox
## A damageable region on an actor. Detected by a Hitbox, which calls `receive_hit`. Routes damage
## to the actor's HealthComponent (a direct child of `owner` named "HealthComponent"). Put this on
## the actor's hurt collision layer (player and enemies use different layers, so attacks only hit
## the intended team).

func receive_hit(amount_or_damage, source: Node = null, damage_type: String = "physical", armor_pierce: int = 0) -> void:
    if owner == null:
        return
    var damage: DamageData = null
    if amount_or_damage is DamageData:
        damage = amount_or_damage
    else:
        damage = DamageData.new(int(amount_or_damage), damage_type, source, armor_pierce)
    CombatSystem.apply_damage(owner, damage)
