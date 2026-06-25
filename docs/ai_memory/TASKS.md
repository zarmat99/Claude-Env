# Valdombra — TASKS

> Task tracker. Each task: `ID · description · milestone · files · dependencies · status`.
> Move tasks between sections as state changes. IDs are stable.

Legend: status ∈ { backlog, in_progress, done, blocked }.

---

## In Progress
- (none — SR1 is ready to start)

## Backlog

### SR1 — Core scalability review
- **SR1-T1 · Review core scalability after M8** · backlog.

### Milestone 9 — Data & tooling hardening
- **M9-T1 · Data validators + duplicate ID / persistent_id checks** · backlog.
- **M9-T2 · Repeatable headless smoke/regression checks** · backlog.
- **M9-T3 · Input-map cleanup for hardcoded controls** · backlog.

### Later roadmap
- Full milestone sequence and review gates live in `docs/architecture/ROADMAP.md` (M10-M20,
  SR2-SR5). Add detailed tasks here when each milestone becomes current.

## Done
- **M8-T1 · XP/level/stat growth + rewards** · M8 · files:
  `scripts/progression/ProgressionManager.gd`, `project.godot`, `scripts/core/GameState.gd`,
  `scripts/core/SaveManager.gd`, `scripts/player/PlayerCombat.gd`, `scripts/ui/HUD.gd`,
  `scenes/ui/HUD.tscn` · **done** (2026-06-25): quest rewards and enemy kills grant XP; level-up
  increases max health and damage, refills health, emits `player_level_up`, and HUD shows level/XP.
- **DOC-T2 · Define production-scalability roadmap with review gates** · docs · **done**
  (2026-06-25): `ROADMAP.md` now schedules M9-M20 and SR1-SR5 so content production stays aligned
  with the goal of scalable world/story authoring.
- **DOC-T1 · Remove stale live-status wording from architecture docs** · docs · **done**
  (2026-06-25): `ROADMAP.md`, `SYSTEMS.md`, `ARCHITECTURE.md`, `PROJECT_MEMORY.md`, and handoff
  memory aligned before M7.
- **M7-T1 · SaveManager full serialize/deserialize** · M7 · files:
  `scripts/core/SaveManager.gd`, `scripts/core/SceneLoader.gd`, `scripts/core/GameState.gd` ·
  **done** (2026-06-25): JSON snapshots to `user://saves/slot_N.json`; restores map, player
  position/stats/gold/inventory/equipment, quests, factions, flags, world objects, and kills.
- **M7-T2 · PersistentWorldObject apply-on-load** · M7 · files:
  `scripts/world/PersistentWorldObject.gd`, `scripts/items/PickupItem.gd`,
  `scripts/enemies/EnemyAI.gd`, `scenes/maps/{Village,Cave}.tscn` · **done** (2026-06-25):
  collected pickups and dead enemies are removed on map load via stable `persistent_id`s.
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
- **M5-T1 · HealthComponent / StatsComponent** (reusable; EventBus actor_damaged/died) · M5 ·
  **done** (2026-06-25).
- **M5-T2 · Hitbox / Hurtbox** (team via collision layers; DamageData deferred — amount+source) ·
  M5 · **done** (2026-06-25).
- **M5-T3 · EnemyBase + Slime + EnemyAI** (chase + touch damage; data-driven stats) · M5 · **done**
  (2026-06-25).
- **M5-T4 · Death → kills + LootComponent + PlayerCombat** (killed_enemy hook; loot drops; melee
  attack; player health synced to GameState) · M5 · **done** (2026-06-25). Verified headless +
  screenshot.
- **M6-T1 · SpawnPoint / AreaTransition / PlaceholderMap + Forest & Cave maps** · M6 · **done**
  (2026-06-25).
- **M6-T2 · SceneLoader (data-driven map swap via maps.json, persistent player, map_changed)** ·
  M6 · **done** (2026-06-25). AreaTransition swaps deferred (physics-flush safe).
- **M6-T3 · quest_first_dungeon end-to-end** (village→forest→cave→fragment→return→reward) · M6 ·
  **done** (2026-06-25). Verified headless + screenshot.

## Blocked
- (none)
