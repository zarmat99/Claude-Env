# Valdombra — TASKS

> Task tracker. Each task: `ID · description · milestone · files · dependencies · status`.
> Move tasks between sections as state changes. IDs are stable.

Legend: status ∈ { backlog, in_progress, done, blocked }.

---

## In Progress
- (none — awaiting user go-ahead for Milestone 5)

## Backlog

### Milestone 5 — Combat
- **M5-T1 · HealthComponent / StatsComponent** · backlog.
- **M5-T2 · Hitbox/Hurtbox + DamageData** · backlog.
- **M5-T3 · EnemyBase + Slime/EnemyAI** · backlog.
- **M5-T4 · LootComponent (basic loot on death)** · backlog.

### Milestone 6 — Vertical slice
- **M6-T1 · Village/Forest/Cave maps + AreaTransition/SpawnPoint** · backlog.
- **M6-T2 · Move map loading into SceneLoader (data-driven via maps.json)** · backlog.
- **M6-T3 · "Recover the ancient fragment" quest end-to-end** · backlog.

### Milestone 7 — Save/load
- **M7-T1 · SaveManager full serialize/deserialize** · backlog.
- **M7-T2 · PersistentWorldObject apply-on-load** · backlog.

### Milestone 8 — Progression
- **M8-T1 · XP/level/stat growth + rewards** · backlog.

## Done
- **M0-T1 · Repo analysis + AI memory & architecture docs** · M0 · **done** (2026-06-25).
- **M0-T2 · Scaffold Godot skeleton** · M0 · **done** (2026-06-25).
- **M0-T3 · Verify project opens & runs in Godot 4** · M0 · **done** (2026-06-25): Godot 4.3 at
  `%LOCALAPPDATA%\Programs\Godot\Godot_v4.3-stable_win64.exe`; headless import + run clean.
- **M1-T0 · Input map** (WASD/arrows + E/Space) · M1 · files: project.godot · **done**
  (2026-06-25): 5 actions, 2 events each.
- **M1-T1 · PlayerController + Player.tscn** (top-down `CharacterBody2D` + `move_and_slide`) · M1 ·
  **done** (2026-06-25).
- **M1-T2 · Camera2D follow** (child of Player, position smoothing) · M1 · **done** (2026-06-25).
- **M1-T3 · Test map (Village) + base collisions** (border walls + obstacles; visuals + colliders
  from one geometry list) · M1 · **done** (2026-06-25).
- **M1-T4 · Minimal HUD** (health from GameState) + Main wiring (map+player+HUD) · M1 · **done**
  (2026-06-25). Verified headless + screenshot.
- **M2-T1 · InteractionComponent + PlayerInteraction** (Area2D layer-4 interactable; player area
  triggers nearest on `interact`; prompt via EventBus) · M2 · **done** (2026-06-25).
- **M2-T2 · NPCBase + Blacksmith** (data-driven from npcs.json; name label; blocks player) · M2 ·
  **done** (2026-06-25).
- **M2-T3 · DialogueBox UI** (speaker + wrapped text + choice buttons; ALWAYS process mode) · M2 ·
  **done** (2026-06-25).
- **M2-T4 · DialogueManager + first data-driven dialogue** (JSON node-graph, actions=set_flag,
  pauses game) · M2 · **done** (2026-06-25). Verified headless + screenshot.
- **M3-T1 · Quest data + Conditions** (quests.json + `Conditions.gd` shared predicate eval; quests
  modeled as dicts, not separate classes) · M3 · **done** (2026-06-25).
- **M3-T2 · QuestManager** (staged, event-driven advancement; talked_to momentary; rewards) · M3 ·
  **done** (2026-06-25).
- **M3-T3 · QuestJournalUI** (toggle J; active + completed) · M3 · **done** (2026-06-25).
- **M3-T4 · Blacksmith assigns quest_first_dungeon** (dialogue `start_quest` action; choices gated
  by quest state) · M3 · **done** (2026-06-25). Verified full flow headless + screenshot.
- **M4-T1 · items.json + item access** (health_potion, iron_sword, ancient_iron_fragment; items as
  dicts via DataRegistry) · M4 · **done** (2026-06-25).
- **M4-T2 · InventoryManager** (autoload broker over GameState.player.inventory; stacking/max_stack;
  add/remove/count) · M4 · **done** (2026-06-25). InventoryComponent deferred to first non-player
  inventory (M5+).
- **M4-T3 · PickupItem** (Area2D auto-collect on player overlap; persistent_id → world_objects) ·
  M4 · **done** (2026-06-25).
- **M4-T4 · Inventory UI + quest reads items** (InventoryUI toggle I; has_item advances quest) ·
  M4 · **done** (2026-06-25). Verified headless + screenshot.

## Blocked
- (none)
