extends Node
## Player death/respawn flow (M16). Replaces the M5 "respawn at full HP in place" placeholder.
## On death it pauses the tree and lets the GameOver overlay offer Respawn or Load. Respawn restores
## health, applies a small gold penalty, and returns the player to the current map's default spawn.

const RESPAWN_GOLD_PENALTY := 0.25  # fraction of carried gold lost on death

var is_game_over := false

func _ready() -> void:
    EventBus.player_died.connect(_on_player_died)

func _on_player_died() -> void:
    if is_game_over:
        return
    is_game_over = true
    get_tree().paused = true  # the GameOver overlay runs with PROCESS_MODE_ALWAYS

## Stand the player back up at the current map's safe spawn, minus a gold penalty.
func respawn() -> void:
    if not is_game_over:
        return
    is_game_over = false
    _apply_gold_penalty()
    var stats: Dictionary = GameState.player.get("stats", {})
    stats["health"] = _effective_max_health(stats)
    GameState.player["stats"] = stats
    if SceneLoader.is_bound() and GameState.current_map != "":
        SceneLoader.change_map(GameState.current_map, _default_spawn(GameState.current_map), false)
    get_tree().paused = false
    EventBus.player_respawned.emit()

## Alternative to respawn: reload the most recent save (autosave first, then the quicksave slot).
func load_last_save() -> bool:
    var ok := SaveManager.load_autosave() if SaveManager.has_autosave() else SaveManager.load_game(SaveManager.QUICKSAVE_SLOT)
    if ok:
        is_game_over = false
        get_tree().paused = false
        EventBus.player_respawned.emit()
    return ok

func has_last_save() -> bool:
    return SaveManager.has_autosave() or SaveManager.has_save(SaveManager.QUICKSAVE_SLOT)

func _apply_gold_penalty() -> void:
    var gold := int(GameState.player.get("gold", 0))
    var penalty := int(floor(float(gold) * RESPAWN_GOLD_PENALTY))
    if penalty > 0:
        GameState.player["gold"] = gold - penalty
        EventBus.gold_changed.emit(GameState.player["gold"])

func _default_spawn(map_id: String) -> String:
    var spawns = DataRegistry.get_map(map_id).get("spawn_points", [])
    return String(spawns[0]) if spawns is Array and not spawns.is_empty() else ""

func _effective_max_health(stats: Dictionary) -> int:
    if has_node("/root/EquipmentManager"):
        return max(1, EquipmentManager.get_effective_stat("max_health"))
    return max(1, int(stats.get("max_health", 30)))
