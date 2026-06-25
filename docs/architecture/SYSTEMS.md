# Valdombra — SYSTEMS

Per-system responsibilities, dependencies, and the EventBus contract. Status: `stub` (skeleton
only) → `partial` → `done` per milestone. Update status as systems evolve.

---

## EventBus (autoload) — `scripts/core/EventBus.gd`
- **Role**: declares global signals; the only channel for cross-system *notifications*.
- **Depends on**: nothing.
- **Signals (contract — emit through here, never invent ad-hoc cross-tree calls)**:
  - Quests: `quest_started(quest_id)` · `quest_stage_updated(quest_id, stage)` ·
    `quest_completed(quest_id)`
  - Inventory: `item_added(item_id, count)` · `item_removed(item_id, count)`
  - Combat/actors: `actor_damaged(actor, amount, source)` · `actor_died(actor)`
  - Dialogue: `dialogue_started(dialogue_id)` · `dialogue_ended(dialogue_id)`
  - World: `map_changed(map_id)` · `world_object_state_changed(persistent_id, state)`
  - Progression: `player_level_up(new_level)` · `xp_gained(amount)`
  - Economy: `gold_changed(new_total)`
- **Status**: stub (M0).

## DataRegistry (autoload) — `scripts/core/DataRegistry.gd`
- **Role**: load + validate every `data/*.json` at boot; expose typed lookups
  (`get_item(id)`, `get_quest(id)`, `get_dialogue(id)`, `get_npc(id)`, `get_enemy(id)`,
  `get_faction(id)`, `get_skill(id)`, `get_map(id)`). Fail loudly on bad IDs/malformed data.
- **Depends on**: nothing (reads files).
- **Status**: stub (M0) → loads JSON as systems need it.

## GameState (autoload) — `scripts/core/GameState.gd`
- **Role**: single runtime source of truth: `current_map`, player snapshot (position, stats,
  gold, inventory, equipment), `quests {active, completed}`, `factions`, `flags`,
  `world_objects {persistent_id: state}`. Provides new-game defaults.
- **Depends on**: DataRegistry (defaults). Read/written by managers; serialized by SaveManager.
- **Status**: stub (M0) → grows per milestone.

## SceneLoader (autoload) — `scripts/core/SceneLoader.gd`
- **Role**: load/unload map scenes into `Main/WorldRoot`; place the player at a named
  `SpawnPoint`; emit `map_changed`. Handles `AreaTransition` requests.
- **Depends on**: GameState, EventBus, DataRegistry (map index).
- **Status**: stub (M0) → used from M1/M6.

## SaveManager (autoload) — `scripts/core/SaveManager.gd`
- **Role**: serialize a `GameState` snapshot to `user://saves/slot_N.json` and restore it
  (apply player, quests, flags, and per-`persistent_id` world-object state on load).
- **Depends on**: GameState (everything persistable flows through it). Schema in DATA_SCHEMAS.
- **Status**: stub (M0) → full in M7.

## IdUtils (static class) — `scripts/core/IdUtils.gd`
- **Role**: helpers for IDs (validation, prefix checks, persistent-id formatting). Not an autoload.
- **Status**: stub (M0).

## MapManager / world — `scripts/world/*`
- **Role**: `MapManager` tracks the active map + registered `PersistentWorldObject`s;
  `AreaTransition` triggers map swaps; `SpawnPoint` marks placement; `PersistentWorldObject`
  reads/writes its state by `persistent_id`.
- **Depends on**: SceneLoader, GameState, EventBus.
- **Status**: planned (M1 spawn/transition basics, M6 full, M7 persistence apply).

## QuestManager (autoload) — `scripts/quest/*`
- **Role**: start/advance/complete quests; evaluate `advance_on` conditions against GameState;
  react to EventBus events (`item_added`, `actor_died`, `map_changed`, `dialogue_*`) to advance
  stages; grant stage rewards. Models: `QuestData`, `QuestStage`.
- **Depends on**: DataRegistry, GameState, EventBus.
- **Status**: planned (M3).

## DialogueManager (autoload) — `scripts/dialogue/*`
- **Role**: run a dialogue graph; evaluate node/choice `conditions`; execute `actions`
  (start/advance quest, give/take item, set flag); drive `DialogueBox`. Model: `DialogueData`.
- **Depends on**: DataRegistry, GameState, EventBus, QuestManager/InventoryManager (for actions).
- **Status**: planned (M2 simple → conditional grows over time).

## InventoryManager (autoload) + InventoryComponent — `scripts/inventory/*`, `scripts/components/InventoryComponent.gd`
- **Role**: add/remove/query items, stacking, weight (later); `InventoryComponent` is the
  per-actor container; `InventoryManager` brokers operations + emits `item_added/removed`.
  Model: `ItemData`.
- **Depends on**: DataRegistry, GameState, EventBus.
- **Status**: planned (M4).

## Combat — `scripts/combat/*`, components
- **Role**: `Hitbox`/`Hurtbox` (Area2D) detect hits; `DamageData` carries amount/type/source;
  `HealthComponent` applies damage + emits `actor_damaged`/`actor_died`; `StatsComponent` holds
  combat stats; `CombatSystem` mediates rules. `LootComponent` drops loot on death.
- **Depends on**: EventBus, GameState (rewards), DataRegistry (enemy/loot defs).
- **Status**: planned (M5).

## Progression (stats/skills/levels) — `StatsComponent`, skills data
- **Role**: XP gain, level-up curve, stat growth, (later) skills. Reacts to `xp_gained`,
  emits `player_level_up`.
- **Depends on**: GameState, EventBus, DataRegistry (skills).
- **Status**: planned (M8).

## Factions & reputation — `FactionComponent`, factions data
- **Role**: actor faction membership; hostility checks; reputation values (later) influencing
  dialogue/combat/economy.
- **Depends on**: DataRegistry, GameState.
- **Status**: designed (post-M8).

## UI — `scripts/ui/*`, `scenes/ui/*`
- **Role**: `HUD` (health/level/active quest), `DialogueBox` (dialogue runner view),
  `InventoryUI`, `QuestJournalUI`. UIs are passive views that subscribe to EventBus and query
  managers; they never own game logic.
- **Depends on**: EventBus + managers (read-only).
- **Status**: HUD (M1), DialogueBox (M2), QuestJournalUI (M3), InventoryUI (M4).
