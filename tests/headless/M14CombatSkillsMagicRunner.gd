extends Node

const PlayerScene := preload("res://scenes/player/Player.tscn")
const EnemyBaseScene := preload("res://scenes/enemies/EnemyBase.tscn")
const SAVE_SLOT := 96

var _failures: Array[String] = []

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS
    _run.call_deferred()

func _run() -> void:
    print("[M14] Combat/skills/magic runner starting")
    _test_data_validation()
    _test_damage_rules()
    _test_hurtbox_legacy_numeric_damage()
    _test_skill_growth_and_save_load()
    await _test_player_abilities()
    await _test_enemy_archetypes()
    _cleanup_save_slot(SAVE_SLOT)
    await _frames(2)

    if _failures.is_empty():
        print("[M14] Combat/skills/magic runner OK")
        get_tree().quit(0)
    else:
        for failure in _failures:
            push_error("[M14] %s" % failure)
        print("[M14] Combat/skills/magic runner FAILED with %d failure(s)" % _failures.size())
        get_tree().quit(1)

func _test_data_validation() -> void:
    _assert(DataRegistry.validate_all(), "DataRegistry validation failed: %s" % str(DataRegistry.get_validation_errors()))
    for action in ["ability_1", "ability_2", "ability_3"]:
        _assert(InputMap.has_action(action), "Missing ability input action '%s'" % action)
    _assert(DataRegistry.all("enemies").size() >= 3, "M14 should define at least three enemy archetypes")
    _assert(DataRegistry.all("skills").size() >= 3, "M14 should define several skills/abilities")

func _test_damage_rules() -> void:
    GameState.reset_to_new_game()
    var source: Node2D = Node2D.new()
    source.name = "DamageSource"
    add_child(source)
    var target: Node2D = _make_actor("ArmoredTarget", {"max_health": 30, "armor": 2, "resistances": {"fire": 0.5}})
    add_child(target)
    var health: HealthComponent = target.get_node("HealthComponent") as HealthComponent

    _assert(CombatSystem.damage_actor(source, target, 10, "physical") == 8, "Physical damage should subtract armor")
    _assert(health.health == 22, "Armored target should have 22 HP after 8 damage")
    _assert(CombatSystem.damage_actor(source, target, 10, "fire") == 3, "Fire resistance should apply before armor")
    _assert(health.health == 19, "Fire damage should leave the target at 19 HP")
    _assert(CombatSystem.damage_actor(source, target, 10, "physical", 2) == 10, "Armor pierce should bypass matching armor")

    var player: Node2D = _make_actor("PlayerArmorTarget", {"max_health": 30})
    player.add_to_group("player")
    add_child(player)
    InventoryManager.add("item_leather_armor", 1)
    _assert(EquipmentManager.equip("item_leather_armor"), "Armor should equip for mitigation test")
    var player_health: HealthComponent = player.get_node("HealthComponent") as HealthComponent
    _assert(CombatSystem.damage_actor(source, player, 5, "physical") == 3, "Player equipped armor should mitigate damage")
    _assert(player_health.health == 27, "Player armor mitigation should reduce incoming damage")

    source.free()
    target.free()
    player.free()

func _test_hurtbox_legacy_numeric_damage() -> void:
    GameState.reset_to_new_game()
    var source: Node2D = Node2D.new()
    source.name = "LegacyHitSource"
    add_child(source)
    var target: Node2D = _make_actor("LegacyHurtboxTarget", {"max_health": 20})
    add_child(target)
    var hurtbox := Hurtbox.new()
    hurtbox.name = "Hurtbox"
    target.add_child(hurtbox)
    hurtbox.owner = target

    hurtbox.receive_hit(5, source)
    var health: HealthComponent = target.get_node("HealthComponent") as HealthComponent
    _assert(health.health == 15, "Hurtbox should accept legacy numeric damage without a cast error")

    source.free()
    target.free()

func _test_skill_growth_and_save_load() -> void:
    GameState.reset_to_new_game()
    SkillManager.ensure_player_skills()
    _assert(SkillManager.get_level("skill_one_handed") == 1, "One-Handed should start at level 1")
    _assert(SkillManager.add_xp("skill_one_handed", 21), "Adding skill XP should succeed")
    _assert(SkillManager.get_level("skill_one_handed") == 2, "Skill XP should level One-Handed")
    _assert(SkillManager.get_xp("skill_one_handed") == 1, "Skill XP overflow should be preserved")
    _assert(SaveManager.save_game(SAVE_SLOT), "Saving skill state should succeed")
    GameState.reset_to_new_game()
    SkillManager.ensure_player_skills()
    _assert(SkillManager.get_level("skill_one_handed") == 1, "Reset should restore default skill level")
    _assert(SaveManager.load_game(SAVE_SLOT), "Loading skill state should succeed")
    _assert(SkillManager.get_level("skill_one_handed") == 2, "Loaded save should restore skill level")
    _assert(SkillManager.get_xp("skill_one_handed") == 1, "Loaded save should restore skill XP")

func _test_player_abilities() -> void:
    GameState.reset_to_new_game()
    SkillManager.ensure_player_skills()
    var player: Node2D = PlayerScene.instantiate() as Node2D
    add_child(player)
    player.global_position = Vector2.ZERO
    await _frames(2)

    var enemy: Node2D = EnemyBaseScene.instantiate() as Node2D
    enemy.set("enemy_id", "enemy_bone_sentinel")
    enemy.set("persistent_id", "m14_sentinel_probe")
    add_child(enemy)
    enemy.global_position = Vector2(80, 0)
    await _frames(2)

    var enemy_health: HealthComponent = enemy.get_node("HealthComponent") as HealthComponent
    var abilities: PlayerAbilities = player.get_node("PlayerAbilities") as PlayerAbilities
    _assert(enemy_health.health == 18, "Bone sentinel should load 18 HP from data")
    _assert(abilities.use_ability("skill_firebolt"), "Firebolt should hit the nearest enemy")
    _assert(enemy_health.health == 6, "Firebolt should apply fire weakness plus armor mitigation")
    _assert(SkillManager.get_xp("skill_firebolt") == 5, "Firebolt use should grant skill XP")
    _assert(not abilities.use_ability("skill_firebolt"), "Firebolt cooldown should block immediate reuse")

    var player_health: HealthComponent = player.get_node("HealthComponent") as HealthComponent
    CombatSystem.damage_actor(enemy, player, 10, "physical")
    _assert(player_health.health == 20, "Player should take damage before testing self-heal")
    _assert(abilities.use_ability("skill_mending_word"), "Mending Word should heal a wounded player")
    _assert(player_health.health == 28, "Mending Word should restore 8 HP")
    _assert(SkillManager.get_xp("skill_mending_word") == 4, "Mending Word should grant skill XP")

    enemy.free()
    player.free()

func _test_enemy_archetypes() -> void:
    GameState.reset_to_new_game()
    var expected: Dictionary = {
        "enemy_slime": "chaser",
        "enemy_cave_rat": "skirmisher",
        "enemy_bone_sentinel": "sentinel",
    }
    for enemy_id in expected.keys():
        var enemy: Node2D = EnemyBaseScene.instantiate() as Node2D
        enemy.set("enemy_id", String(enemy_id))
        enemy.set("persistent_id", "m14_%s_probe" % String(enemy_id))
        add_child(enemy)
        await _frames(2)
        _assert(enemy.call("get_ai_type") == String(expected[enemy_id]), "%s should load its configured AI type" % enemy_id)
        _assert(enemy.call("get_damage_type") == String(DataRegistry.get_enemy(String(enemy_id)).get("damage_type", "physical")), "%s should load its damage type" % enemy_id)
        enemy.free()

func _make_actor(node_name: String, stats: Dictionary) -> Node2D:
    var actor: Node2D = Node2D.new()
    actor.name = node_name
    var health: HealthComponent = HealthComponent.new()
    health.name = "HealthComponent"
    actor.add_child(health)
    var stat_component: StatsComponent = StatsComponent.new()
    stat_component.name = "StatsComponent"
    actor.add_child(stat_component)
    stat_component.set_stats(stats)
    health.setup(int(stats.get("max_health", 30)))
    return actor

func _frames(count: int) -> void:
    for _i in range(count):
        await get_tree().process_frame

func _cleanup_save_slot(slot: int) -> void:
    var dir := DirAccess.open("user://saves")
    if dir:
        dir.remove("slot_%d.json" % slot)

func _assert(condition: bool, message: String) -> void:
    if not condition:
        _failures.append(message)
