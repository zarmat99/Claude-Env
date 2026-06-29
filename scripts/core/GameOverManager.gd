extends Node
## Player death flow (M16). Dying does NOT respawn in place: it pauses the game and the GameOver
## screen makes the player reload a save. The only fallback (when no save exists at all) is starting a
## fresh game, so the player is never hard-stuck.

# Skeleton start, mirrors Main.START_MAP / Main.START_SPAWN (used only for the no-save fallback).
const START_MAP := "map_bootstrap"
const START_SPAWN := "spawn_default"
const SAVE_SLOT_COUNT := 3  # kept local so this autoload never depends on a UI class_name

var is_game_over := false

func _ready() -> void:
    EventBus.player_died.connect(_on_player_died)

func _on_player_died() -> void:
    if is_game_over:
        return
    is_game_over = true
    get_tree().paused = true  # the GameOver overlay runs with PROCESS_MODE_ALWAYS

func has_any_save() -> bool:
    if SaveManager.has_autosave():
        return true
    for slot in range(SAVE_SLOT_COUNT):
        if SaveManager.has_save(slot):
            return true
    return false

## Called by the GameOver screen after SaveManager has loaded a save, to resume play.
func resume_after_load() -> void:
    if not is_game_over:
        return
    is_game_over = false
    get_tree().paused = false
    EventBus.player_respawned.emit()

## Fallback only: no save to load, so begin a fresh run at the dev-sandbox start.
func restart_new_game() -> void:
    is_game_over = false
    GameState.reset_to_new_game()
    var stats: Dictionary = GameState.player.get("stats", {})
    stats["health"] = _effective_max_health(stats)
    GameState.player["stats"] = stats
    if SceneLoader.is_bound():
        SceneLoader.change_map(START_MAP, START_SPAWN, false)
    get_tree().paused = false
    EventBus.player_respawned.emit()

func _effective_max_health(stats: Dictionary) -> int:
    if has_node("/root/EquipmentManager"):
        return max(1, EquipmentManager.get_effective_stat("max_health"))
    return max(1, int(stats.get("max_health", 30)))
