extends Node
## Player progression broker (autoload). It listens to XP reward events, stores level/xp/stats in
## GameState.player.stats, and emits player_level_up when thresholds are crossed.

const BASE_LEVEL := 1
const BASE_XP := 0
const BASE_MAX_HEALTH := 30
const BASE_DAMAGE := 6
const XP_BASE_THRESHOLD := 50
const XP_PER_LEVEL_STEP := 25
const MAX_HEALTH_PER_LEVEL := 5
const DAMAGE_PER_LEVEL := 1

func _ready() -> void:
    ensure_player_stats()
    EventBus.xp_gained.connect(add_xp)
    EventBus.actor_died.connect(_on_actor_died)

func ensure_player_stats() -> void:
    var stats: Dictionary = GameState.player.get("stats", {})
    stats["level"] = max(BASE_LEVEL, int(stats.get("level", BASE_LEVEL)))
    stats["xp"] = max(BASE_XP, int(stats.get("xp", BASE_XP)))
    stats["max_health"] = max(1, int(stats.get("max_health", BASE_MAX_HEALTH)))
    stats["health"] = clamp(int(stats.get("health", stats["max_health"])), 0, int(stats["max_health"]))
    stats["damage"] = max(1, int(stats.get("damage", BASE_DAMAGE)))
    GameState.player["stats"] = stats

func add_xp(amount: int) -> void:
    if amount <= 0:
        return
    ensure_player_stats()
    var stats: Dictionary = GameState.player["stats"]
    stats["xp"] = int(stats.get("xp", 0)) + amount
    while int(stats["xp"]) >= xp_to_next_level(int(stats["level"])):
        stats["xp"] = int(stats["xp"]) - xp_to_next_level(int(stats["level"]))
        _level_up(stats)
    GameState.player["stats"] = stats

func xp_to_next_level(level: int = -1) -> int:
    var current := int(GameState.player.get("stats", {}).get("level", BASE_LEVEL)) if level < 0 else level
    return XP_BASE_THRESHOLD + max(0, current - BASE_LEVEL) * XP_PER_LEVEL_STEP

func _level_up(stats: Dictionary) -> void:
    stats["level"] = int(stats.get("level", BASE_LEVEL)) + 1
    stats["max_health"] = int(stats.get("max_health", BASE_MAX_HEALTH)) + MAX_HEALTH_PER_LEVEL
    stats["health"] = int(stats["max_health"])
    stats["damage"] = int(stats.get("damage", BASE_DAMAGE)) + DAMAGE_PER_LEVEL
    _apply_health_to_live_player(stats)
    EventBus.player_level_up.emit(int(stats["level"]))

func _apply_health_to_live_player(stats: Dictionary) -> void:
    var player := SceneLoader.get_player() if SceneLoader.is_bound() else get_tree().get_first_node_in_group("player")
    if player == null or not is_instance_valid(player):
        return
    var health := player.get_node_or_null("HealthComponent")
    if health and health.has_method("setup"):
        health.setup(int(stats.get("max_health", BASE_MAX_HEALTH)), int(stats.get("health", BASE_MAX_HEALTH)))

func _on_actor_died(actor: Node) -> void:
    if actor == null or not actor.is_in_group("enemy"):
        return
    var raw_enemy_id = actor.get("enemy_id")
    if raw_enemy_id == null:
        return
    var enemy_id := String(raw_enemy_id)
    if enemy_id == "":
        return
    var enemy := DataRegistry.get_enemy(enemy_id)
    var xp := int(enemy.get("xp_reward", 0))
    if xp > 0:
        EventBus.xp_gained.emit(xp)
