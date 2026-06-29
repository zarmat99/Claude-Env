extends CharacterBody2D
## Simple enemy (M5): loads its definition from enemies.json by `enemy_id`, chases the player within
## aggro range, deals touch damage on a cooldown, and on death drops loot + counts the kill. Uses
## sibling components (Health/Stats/Loot/Hurtbox). No combat numbers are hardcoded here.

const PersistentWorldObject = preload("res://scripts/world/PersistentWorldObject.gd")
const WorldScale := preload("res://scripts/core/WorldScale.gd")

@export var enemy_id: String = ""
@export var persistent_id: String = ""
@export var aggro_range: float = 160.0
@export var attack_range: float = WorldScale.ENEMY_ATTACK_RANGE

var _data: Dictionary = {}
var _ai: Dictionary = {}
var _ai_type := "chaser"
var _faction_id := ""
var _player: Node2D = null
var _attack_cd := 0.0
var _preferred_range := 72.0
var _damage_type := "physical"

@onready var _health: HealthComponent = $HealthComponent
@onready var _stats: StatsComponent = $StatsComponent
@onready var _loot: LootComponent = $LootComponent

func _ready() -> void:
    if PersistentWorldObject.has_state(persistent_id, PersistentWorldObject.STATE_DEAD):
        queue_free()
        return
    add_to_group("enemy")
    _data = DataRegistry.get_enemy(enemy_id)
    if _data.is_empty():
        push_error("EnemyAI: unknown enemy_id '%s' on %s" % [enemy_id, name])
        queue_free()
        return
    _faction_id = String(_data.get("faction", ""))
    _ai = _data.get("ai", {})
    _ai_type = String(_ai.get("type", "chaser"))
    aggro_range = float(_ai.get("aggro_range", aggro_range))
    attack_range = float(_ai.get("attack_range", attack_range))
    _preferred_range = float(_ai.get("preferred_range", max(attack_range, 72.0)))
    _damage_type = String(_data.get("damage_type", "physical"))
    var s: Dictionary = _data.get("stats", {})
    _stats.set_stats(s)
    _health.setup(int(s.get("max_health", 10)))
    _loot.loot_table = _data.get("loot_table", [])
    _health.died.connect(_on_died)

func _physics_process(delta: float) -> void:
    if not _health.is_alive():
        return
    if _player == null or not is_instance_valid(_player):
        _player = get_tree().get_first_node_in_group("player")
        if _player == null:
            return
    if not FactionManager.is_hostile_to_player(_faction_id):
        velocity = Vector2.ZERO
        move_and_slide()
        return
    var to_player: Vector2 = _player.global_position - global_position
    var dist: float = to_player.length()
    velocity = _desired_velocity(to_player, dist)
    move_and_slide()

    _attack_cd = max(0.0, _attack_cd - delta)
    if dist <= attack_range and _attack_cd == 0.0:
        _attack_player()

func _desired_velocity(to_player: Vector2, dist: float) -> Vector2:
    if dist > aggro_range or to_player == Vector2.ZERO:
        return Vector2.ZERO
    var speed: float = float(_stats.get_stat("move_speed", 45))
    match _ai_type:
        "sentinel":
            return Vector2.ZERO
        "skirmisher":
            if dist < _preferred_range * 0.65:
                return -to_player.normalized() * speed
            if dist > _preferred_range:
                return to_player.normalized() * speed
            return Vector2.ZERO
        _:
            if dist > attack_range:
                return to_player.normalized() * speed
            return Vector2.ZERO

func _attack_player() -> void:
    if _player == null or not is_instance_valid(_player):
        return
    CombatSystem.damage_actor(self, _player, int(_stats.get_stat("damage", 2)), _damage_type)
    _attack_cd = max(0.05, float(_ai.get("attack_cooldown", 0.8)))

func get_ai_type() -> String:
    return _ai_type

func get_damage_type() -> String:
    return _damage_type

func _on_died(_source: Node) -> void:
    GameState.kills[enemy_id] = int(GameState.kills.get(enemy_id, 0)) + 1
    PersistentWorldObject.set_state(persistent_id, PersistentWorldObject.STATE_DEAD)
    if _loot:
        _loot.drop(global_position, get_parent(), persistent_id)
    set_physics_process(false)
    var t: Tween = create_tween()
    t.tween_property(self, "modulate:a", 0.0, 0.3)
    t.tween_callback(queue_free)
