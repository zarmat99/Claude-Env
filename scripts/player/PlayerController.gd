extends CharacterBody2D
class_name PlayerController
## Top-down player movement (M1). Reads the project input map (move_*) and collides via
## move_and_slide against StaticBody2D walls. Deliberately tiny: no combat / inventory / quest
## logic here (those live in their own components/systems).

@export var speed: float = 110.0  # pixels per second

func _ready() -> void:
    add_to_group("player")  # so PickupItem (and future systems) can identify the player

func _physics_process(_delta: float) -> void:
    var dir := Input.get_vector("move_left", "move_right", "move_up", "move_down")
    velocity = dir * speed
    move_and_slide()
