extends Node
## Player skill progression broker (M14). Skill state lives under GameState.player.skills, keyed by
## skill id, so save/load remains snapshot-based.

const BASE_LEVEL := 1
const BASE_XP := 0

func _ready() -> void:
    ensure_player_skills()

func ensure_player_skills() -> void:
    var raw_skills = GameState.player.get("skills", {})
    var skills: Dictionary = raw_skills if raw_skills is Dictionary else {}
    for raw_skill_id in DataRegistry.all("skills").keys():
        var skill_id := String(raw_skill_id)
        var def := DataRegistry.get_skill(skill_id)
        var raw_state = skills.get(skill_id, {})
        var state: Dictionary = raw_state if raw_state is Dictionary else {}
        var max_level: int = max(BASE_LEVEL, int(def.get("max_level", BASE_LEVEL)))
        skills[skill_id] = {
            "level": clamp(int(state.get("level", BASE_LEVEL)), BASE_LEVEL, max_level),
            "xp": max(BASE_XP, int(state.get("xp", BASE_XP))),
        }
    GameState.player["skills"] = skills

func get_state(skill_id: String) -> Dictionary:
    ensure_player_skills()
    var skills: Dictionary = GameState.player.get("skills", {})
    var state = skills.get(skill_id, {"level": BASE_LEVEL, "xp": BASE_XP})
    return state if state is Dictionary else {"level": BASE_LEVEL, "xp": BASE_XP}

func get_level(skill_id: String) -> int:
    return int(get_state(skill_id).get("level", BASE_LEVEL))

func get_xp(skill_id: String) -> int:
    return int(get_state(skill_id).get("xp", BASE_XP))

func xp_to_next_level(skill_id: String, level: int = -1) -> int:
    if not DataRegistry.has_id("skills", skill_id):
        return 1
    var def := DataRegistry.get_skill(skill_id)
    var current: int = get_level(skill_id) if level < 0 else level
    var base: int = max(1, int(def.get("xp_to_level", 20)))
    var step: int = max(0, int(def.get("xp_level_step", 10)))
    return base + max(0, current - BASE_LEVEL) * step

func add_xp(skill_id: String, amount: int) -> bool:
    if amount <= 0:
        return false
    if not DataRegistry.has_id("skills", skill_id):
        push_error("SkillManager: unknown skill '%s'" % skill_id)
        return false
    ensure_player_skills()
    var def := DataRegistry.get_skill(skill_id)
    var max_level: int = max(BASE_LEVEL, int(def.get("max_level", BASE_LEVEL)))
    var skills: Dictionary = GameState.player["skills"]
    var raw_state = skills.get(skill_id, {"level": BASE_LEVEL, "xp": BASE_XP})
    var state: Dictionary = raw_state if raw_state is Dictionary else {"level": BASE_LEVEL, "xp": BASE_XP}
    if int(state.get("level", BASE_LEVEL)) >= max_level:
        state["level"] = max_level
        state["xp"] = 0
        skills[skill_id] = state
        return false

    state["xp"] = int(state.get("xp", BASE_XP)) + amount
    EventBus.skill_xp_gained.emit(skill_id, amount)
    while int(state["level"]) < max_level and int(state["xp"]) >= xp_to_next_level(skill_id, int(state["level"])):
        state["xp"] = int(state["xp"]) - xp_to_next_level(skill_id, int(state["level"]))
        state["level"] = int(state["level"]) + 1
        EventBus.skill_level_up.emit(skill_id, int(state["level"]))
    if int(state["level"]) >= max_level:
        state["xp"] = 0
    skills[skill_id] = state
    GameState.player["skills"] = skills
    return true

func grant_use_xp(skill_id: String) -> bool:
    if not DataRegistry.has_id("skills", skill_id):
        return false
    return add_xp(skill_id, int(DataRegistry.get_skill(skill_id).get("xp_per_use", 0)))
