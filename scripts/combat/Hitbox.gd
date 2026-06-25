extends Area2D
class_name Hitbox
## A damage-dealing region (e.g. a melee swing). Call `strike(source)` to activate it for a couple
## of physics frames and damage every overlapping Hurtbox. Set `collision_mask` to the target team's
## hurt layer. Keep `monitoring` off in the scene; `strike` toggles it.

@export var damage: int = 5

func strike(source: Node) -> void:
    monitoring = true
    await get_tree().physics_frame
    await get_tree().physics_frame
    for a in get_overlapping_areas():
        if a.has_method("receive_hit"):
            a.receive_hit(damage, source)
    monitoring = false
