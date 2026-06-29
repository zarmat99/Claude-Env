# Valdombra — SYSTEMS

Per-system responsibilities, dependencies, and the EventBus contract.

Live milestone progress is tracked in `docs/ai_memory/TASKS.md`, `HANDOFF.md`, and
`SESSION_LOG.md`. This file records system contracts plus the implementation level reached by the
current codebase, so it should avoid "current milestone" language that can go stale.

---

## EventBus (autoload) — `scripts/core/EventBus.gd`
- **Role**: declares global signals; the only channel for cross-system *notifications*.
- **Depends on**: nothing.
- **Signals (contract — emit through here, never invent ad-hoc cross-tree calls)**:
  - Quests: `quest_started(quest_id)` · `quest_stage_updated(quest_id, stage)` ·
    `quest_completed(quest_id)`
  - Inventory: `item_added(item_id, count)` · `item_removed(item_id, count)` ·
    `item_used(item_id)`
  - Equipment: `equipment_changed(slot, item_id)`
  - Combat/actors: `actor_damaged(actor, amount, source)` · `actor_died(actor)`
  - Dialogue: `dialogue_started(dialogue_id)` · `dialogue_ended(dialogue_id)`
  - World: `map_changed(map_id)` · `world_object_state_changed(persistent_id, state)`
  - Progression: `player_level_up(new_level)` · `xp_gained(amount)`
  - Skills: `skill_xp_gained(skill_id, amount)` / `skill_level_up(skill_id, new_level)` /
    `skill_used(skill_id)`
  - Economy: `gold_changed(new_total)`
  - Factions: `faction_reputation_changed(faction_id, old_value, new_value)`
- **Implementation**: live; signals used by the M1-M15 systems.

## DataRegistry (autoload) — `scripts/core/DataRegistry.gd`
- **Role**: load + validate every `data/*.json` at boot; expose typed lookups
  (`get_item(id)`, `get_quest(id)`, `get_dialogue(id)`, `get_npc(id)`, `get_enemy(id)`,
  `get_faction(id)`, `get_skill(id)`, `get_asset_set(id)`, `get_world_object(id)`, `get_map(id)`).
  Fail loudly on bad IDs/malformed data.
- **Depends on**: nothing (reads files).
- **Implementation**: M9 adds boot-time and test-callable validation for JSON shape, ID prefixes,
  cross-file references, quest/dialogue conditions, implemented dialogue actions, map scene paths,
  declared spawn points, transition targets, loot/reward item refs, and duplicate `persistent_id`s.
  M10 extends this to asset sets, generated atlas dimensions, tile metadata, world-object
  definitions, authored map dimensions/layers/spawns/transitions/objects, switch targets, and
  asset-tile references. M12 adds faction reputation conditions/actions plus NPC role/service/
  quest-offer metadata validation. M14 adds skill ability/damage schema checks plus enemy AI,
  damage type, armor, and resistance validation. M15 adds authored collision-rect, keyed-door, and
  encounter metadata validation. Lookups push errors for missing IDs instead of quietly
  accepting them.

## GameState (autoload) — `scripts/core/GameState.gd`
- **Role**: single runtime source of truth: `current_map`, player snapshot (position, stats,
  gold, inventory, equipment, skills), `quests {active, completed}`, `factions`, `flags`,
  `world_objects {persistent_id: state}`. Provides new-game defaults.
- **Depends on**: DataRegistry (defaults). Read/written by managers; serialized by SaveManager.
- **Implementation**: holds map, player, quest, inventory, flags, kills, and world object state.
  M9 dynamic pickups use `world_objects[persistent_id]` entries with `state`, `kind`, `map_id`,
  `item_id`, `count`, and `position`. M12 faction defaults are copied from data into
  `factions[faction_id].reputation`. M14 stores skill XP/levels in `player.skills`. Save/load uses
  GameState as the snapshot boundary; migrations are future work.

## SceneLoader (autoload) — `scripts/core/SceneLoader.gd`
- **Role**: load/unload map scenes into `Main/WorldRoot`; place the player at a named
  `SpawnPoint`; emit `map_changed`. Handles `AreaTransition` requests.
- **Depends on**: GameState, EventBus, DataRegistry (map index).
- **Implementation**: swaps data-driven maps, keeps the persistent player, places `SpawnPoint`s,
  emits `map_changed`, rejects invalid map/spawn IDs, and respawns active dynamic pickups from
  `GameState.world_objects`. M10 authored maps still enter through normal map scenes; `AuthoredMap`
  builds its runtime children before `SceneLoader` resolves the requested spawn.

## SaveManager (autoload) — `scripts/core/SaveManager.gd`
- **Role**: serialize a `GameState` snapshot to `user://saves/slot_N.json` and restore it
  (apply player, quests, flags, and per-`persistent_id` world-object state on load).
- **Depends on**: GameState (everything persistable flows through it). Schema in DATA_SCHEMAS.
- **Implementation**: M7 save/load is live; M9 moves debug save/load keys behind input actions
  (`save_game`, `load_game`). M12 ensures old saves get missing faction defaults on load. Load
  restores the snapshot without emitting `map_changed`, so quest stages do not advance merely
  because a saved map is reloaded. M13 equipment stats stay derived: save/load preserves base
  `stats.max_health`, stores current health separately, and restores the live `HealthComponent`
  using equipment-derived effective max health. M14 saves/loads `player.skills` and normalizes
  missing skill state from `skills.json`.

## IdUtils (static class) — `scripts/core/IdUtils.gd`
- **Role**: helpers for IDs (validation, prefix checks, persistent-id formatting). Not an autoload.
- **Implementation**: present as a static helper, not an autoload.

## MapManager / world — `scripts/world/*`
- **Role**: `MapManager` tracks the active map + registered `PersistentWorldObject`s;
  `AreaTransition` triggers map swaps; `SpawnPoint` marks placement; `PersistentWorldObject`
  reads/writes its state by `persistent_id`.
- **Depends on**: SceneLoader, GameState, EventBus.
- **Implementation**: `SpawnPoint`, `AreaTransition`, `PlaceholderMap`, and
  `PersistentWorldObject` are live. Static pickups/enemies apply `collected` / `dead` state on map
  load. M9 adds active dynamic pickup state so runtime loot drops can be saved and respawned until
  collected. M10 adds `AuthoredMap` for data-authored tile layers, collisions, spawns, transitions,
  and placed objects, plus reusable `Chest`, `Door`, and `Switch` scenes/scripts. M15 adds authored
  collision rectangles, keyed doors, and map-level encounter metadata for dungeon fixtures.
  Chest/door/switch state persists as `opened`, `open`, and `on` in `GameState.world_objects`.

## QuestManager (autoload) — `scripts/quest/*`
- **Role**: start/advance/complete quests; evaluate `advance_on` conditions against GameState;
  react to EventBus events (`item_added`, `actor_died`, `map_changed`, `dialogue_*`) to advance
  stages; grant stage rewards. Models: `QuestData`, `QuestStage`.
- **Depends on**: DataRegistry, GameState, EventBus.
- **Implementation**: M3 done and exercised by the M6 vertical slice. M11 adds explicit
  `set_quest_stage` branching support through dialogue actions while keeping completion rewards on
  quest stages. SR3-F2 lets a stage's `advance_on` be a single condition, an array (AND), or an
  `any_of`/`all_of` object; `talked_to` inside a set stays momentary.

## DialogueManager (autoload) — `scripts/dialogue/*`
- **Role**: run a dialogue graph; evaluate node/choice `conditions`; execute `actions`
  (start/advance quest, give/take item, reward grants, set/clear flag, reputation changes); drive
  `DialogueBox`.
  Model: `DialogueData`.
- **Depends on**: DataRegistry, GameState, EventBus, QuestManager/InventoryManager (for actions).
- **Implementation**: dialogue graph, conditional choices, pause handling, and the M11 production
  action set (`set_flag`, `clear_flag`, `start_quest`, `advance_quest`, `set_quest_stage`,
  `give_item`, `take_item`, `give_reward`) are live. M12 adds `change_reputation` and
  `set_reputation`. Branching authoring conventions are documented in
  `docs/architecture/QUEST_DIALOGUE_AUTHORING.md`; validation rejects unsupported action types.
  SR3 adds a soft-lock guard (a choiceless or fully-gated node offers a Continue/Leave affordance via
  `advance()` and optional node-level `next`) and `entry_rules` for state-reactive opening nodes.

## InventoryManager (autoload) + InventoryComponent — `scripts/inventory/*`, `scripts/components/InventoryComponent.gd`
- **Role**: add/remove/query items, stacking, weight (later); `InventoryComponent` is the
  per-actor container; `InventoryManager` brokers operations + emits `item_added/removed`.
  Model: `ItemData`.
- **Depends on**: DataRegistry, GameState, EventBus.
- **Implementation**: player inventory, stacking, pickups, and inventory UI are live. M9 makes
  add/remove reject unknown item IDs. M13 adds `use_item`, which spends a `consumable`'s `use_effect`
  (`heal` clamps to the equipment-derived max health) and emits `item_used`. M13 also extracts the
  stacking algorithm into the shared `ItemStacking` helper and adds a reusable non-player
  `InventoryComponent` (used by `Chest` for its contents + transfer-to-player), so the player broker
  and containers share one stacking implementation.

## EquipmentManager (autoload) — `scripts/equipment/EquipmentManager.gd`
- **Role**: broker `GameState.player.equipment` (slot → item_id); equip/unequip weapons/armor from
  the player inventory; derive effective player stats (base + sum of equipped `stats`).
- **Depends on**: DataRegistry, GameState, InventoryManager, EventBus.
- **Implementation**: M13. `equip` moves an item from inventory into its `slot`, returning any prior
  occupant; `unequip` reverses it; `get_effective_stat(key)` = base stat + equipment bonus
  (combat reads `damage`, health reads `max_health`). Derived values are computed on demand (never
  stored), so save/load needs no migration; equipment persists as part of the GameState snapshot.
  Emits `equipment_changed`.

## EconomyManager (autoload) — `scripts/economy/EconomyManager.gd`
- **Role**: derive buy/sell prices from item `value` and broker gold-checked buy/sell against the
  player inventory and `GameState.player.gold`.
- **Depends on**: DataRegistry, GameState, InventoryManager, EventBus.
- **Implementation**: M13. `buy_price` = value × buy-mult (ceil), `sell_price` = value × sell-mult
  (floor); `buy`/`sell` refuse when unaffordable or unowned and emit `gold_changed`. Passing a
  `merchant` id applies that merchant's multipliers and limits buying to its `stock`
  (`data/merchants/merchants.json`). Dialogue `buy_item`/`sell_item` actions (with an optional
  `merchant`) and the `gold_at_least` condition let merchants be authored in JSON;
  `npc_merchant_valdombra` is a live in-village example. A dedicated merchant/trade UI is M16.

## Dungeon fixtures & encounters â€” `AuthoredMap`, `Door`, `world_objects`, map authoring
- **Role**: compose dungeon rooms from authored map data: collision rectangles, persistent placed
  objects, locked/keyed doors, switches/gates, enemies/bosses, reward chests, and encounter metadata.
- **Depends on**: DataRegistry, AuthoredMap, InventoryManager, PersistentWorldObject, SaveManager.
- **Implementation**: M15. `Door` can require and optionally consume an item before opening.
  `AuthoredMap` builds `collision_rects` into StaticBody2D blockers and draws them as simple
  dungeon walls. `maps.json` can declare `encounters` that group enemy, gate, and reward persistent
  IDs. The dev Trial Dungeon is reachable from Cave and covered by `M15DungeonEncounterRunner`.

## Combat — `scripts/combat/*`, components
- **Role**: `Hitbox`/`Hurtbox` (Area2D) detect hits; `DamageData` carries amount/type/source;
  `HealthComponent` applies damage + emits `actor_damaged`/`actor_died`; `StatsComponent` holds
  combat stats; `CombatSystem` mediates rules. `LootComponent` drops loot on death.
- **Depends on**: EventBus, GameState (rewards), DataRegistry (enemy/loot defs).
- **Implementation**: M5 simple combat is live (health, stats, hitbox/hurtbox, enemy AI, loot).
  M9 loot drops register dynamic pickup persistence state. M13 makes the player's melee damage and
  max health read `EquipmentManager.get_effective_stat(...)` (base + equipped bonuses). M14 adds
  `DamageData` + `CombatSystem` as the typed-damage boundary: hitboxes, enemy attacks, and abilities
  route through centralized armor/resistance/armor-pierce rules.

## Progression — `scripts/progression/ProgressionManager.gd`, `StatsComponent`, skills data
- **Role**: XP gain, level-up curve, stat growth, skill XP/levels. Reacts to `xp_gained`,
  grants enemy kill XP from `xp_reward`, stores `level`/`xp`/base stats in `GameState.player.stats`,
  stores skills in `GameState.player.skills`, and emits `player_level_up` / skill events.
- **Depends on**: GameState, EventBus, DataRegistry (skills).
- **Implementation**: M8 player level progression is live; quest rewards and enemy kills grant XP,
  level thresholds increase max health and damage, HUD shows level/XP. M14 adds `SkillManager`
  for skill XP/level state plus save/load support, and `PlayerAbilities` executes data-authored
  combat/magic abilities from `skills.json` via input actions `ability_1`/`ability_2`/`ability_3`.

## Factions & reputation — `scripts/factions/FactionManager.gd`, factions data
- **Role**: actor faction membership, mutable player reputation, friendly/hostile thresholds, and
  faction-to-faction relationship checks.
- **Depends on**: DataRegistry, GameState, EventBus.
- **Implementation**: M12 is live. `FactionManager` initializes default reputation from
  `factions.json`, clamps changes to -100..100, emits `faction_reputation_changed`, exposes
  `is_hostile_to_player`, `is_friendly_to_player`, `are_hostile`, and `are_friendly`, and stores
  mutable state in `GameState.factions` for save/load. Dialogue can change reputation; conditions
  can gate on reputation; `EnemyAI` checks faction hostility before chasing/attacking.

## UI — `scripts/ui/*`, `scenes/ui/*`
- **Role**: `HUD` (health/level/active quest), `DialogueBox` (dialogue runner view),
  `InventoryUI`, `QuestJournalUI`, and `QuestDebugUI`. UIs are passive views that subscribe to
  EventBus and query managers; they never own game logic.
- **Depends on**: EventBus + managers (queries and delegated commands).
- **Implementation**: HUD (M1), DialogueBox (M2), QuestJournalUI (M3), InventoryUI (M4), and the
  M11 QuestDebugUI authoring overlay are live. M9 routes journal/inventory toggles through input
  actions; M11 adds `quest_debug_toggle` for quest authoring state inspection; M12 extends the
  overlay with faction reputation/friendly/hostile state. M13 makes InventoryUI actionable: it
  renders `Equip`, `Use`, and equipped-slot unequip buttons, while the actual state changes stay in
  `EquipmentManager` and `InventoryManager`.

## Testing / checks - `tests/headless/*`
- **Role**: persistent regression coverage for milestone-critical flows.
- **Implementation**: M9 adds `tests/headless/M9RegressionRunner.tscn` plus `test.bat`. The runner
  covers data validation, boot, map transitions, first quest completion, save/load, progression,
  and dynamic pickup persistence. M10 adds `M10WorldAuthoringRunner`, and `test.bat` now runs both
  M9 and M10. The M10 runner validates proxy atlas import, authored map generation, object
  placement, chest loot persistence, and switch/door persistence across map reloads. M11 adds
  `M11DialogueActionsRunner` for production dialogue actions and branching quest fixtures. M12
  adds `M12FactionReputationRunner` for faction defaults, reputation actions/gates, hostile/friendly
  state, and save/load persistence. M13 adds `M13EconomyEquipmentRunner` for equipment, economy,
  containers, save/load, and inventory UI actions. M14 adds `M14CombatSkillsMagicRunner` for typed damage,
  armor/resistance mitigation, skill save/load, player abilities, and enemy archetype loading. M15
  adds `M15DungeonEncounterRunner` for keyed doors, switch gates, boss encounters, reward chests,
  and dungeon save/load persistence. SR4 adds `SR4SystemsStressRunner`, which injects a synthetic
  review-scale dataset in memory (10+ maps, 20 NPCs, 10 quests, 50 items, several factions/merchants/
  dungeons), validates it, checks mid-flow save/load, restores real data, and keeps the production
  JSON free of throwaway stress content.
