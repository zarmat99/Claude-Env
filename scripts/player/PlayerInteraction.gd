extends Area2D
class_name PlayerInteraction
## Sits on the player. Tracks nearby InteractionComponents and, on the `interact` action, triggers
## the nearest one. Publishes the current prompt via EventBus for the HUD. The collision mask must
## match the interaction layer (configured in the scene). Uses _unhandled_input so it naturally
## stops firing while the game is paused (e.g. during dialogue).

var _nearby: Array[Area2D] = []

func _ready() -> void:
    area_entered.connect(_on_area_entered)
    area_exited.connect(_on_area_exited)

func _unhandled_input(event: InputEvent) -> void:
    if event.is_action_pressed("interact"):
        _try_interact()

func _on_area_entered(area: Area2D) -> void:
    if area.is_in_group("interactable") and not _nearby.has(area):
        _nearby.append(area)
        _publish_prompt()

func _on_area_exited(area: Area2D) -> void:
    if _nearby.has(area):
        _nearby.erase(area)
        _publish_prompt()

func _try_interact() -> void:
    var target := _nearest()
    if target and target.has_method("interact"):
        target.interact(owner)

func _nearest() -> Area2D:
    var best: Area2D = null
    var best_d := INF
    for a in _nearby:
        if not is_instance_valid(a):
            continue
        var d := global_position.distance_squared_to(a.global_position)
        if d < best_d:
            best_d = d
            best = a
    return best

func _publish_prompt() -> void:
    var t := _nearest()
    EventBus.interaction_prompt_changed.emit(String(t.get("prompt")) if t else "")
