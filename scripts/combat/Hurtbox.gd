extends Area2D
class_name Hurtbox
## A damageable region on an actor. Detected by a Hitbox, which calls `receive_hit`. Routes damage
## to the actor's HealthComponent (a direct child of `owner` named "HealthComponent"). Put this on
## the actor's hurt collision layer (player and enemies use different layers, so attacks only hit
## the intended team).

func receive_hit(amount: int, source: Node) -> void:
    var h = owner.get_node_or_null("HealthComponent") if owner else null
    if h and h.has_method("take_damage"):
        h.take_damage(amount, source)
