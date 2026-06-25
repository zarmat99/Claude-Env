# Valdombra — PROJECT MEMORY

> Master context file. Any AI agent or human developer **MUST read this and `HANDOFF.md`
> before making changes**, and **MUST update** `PROJECT_MEMORY.md`, `SESSION_LOG.md`,
> `TASKS.md`, `HANDOFF.md` at the end of every work block. The real memory lives in these
> files, **not** in chat history.

---

## 1. Vision
A 2D top-down fantasy RPG with a medieval / dark-fantasy atmosphere. It borrows only the
**systemic feeling** of large open RPGs — free exploration, role-bearing NPCs, branching
quests, dungeons, loot, character growth, and a world that remembers what the player did.

It is **not** a clone of any existing game. No protected names, assets, lore, characters, or
proprietary mechanics are used. Start small (a 3-map vertical slice) but build a technical
skeleton that scales to a large, content-rich RPG **without rewrites**.

## 2. Genre / Pillars
- 2D top-down, action-light RPG.
- Pillars: free exploration · meaningful NPCs · staged & (later) branching quests · dungeons ·
  loot · character progression · **persistent world state**.

## 3. Stack
- Engine: **Godot 4.x**, GDScript.
- Rendering: **2D, top-down**.
- Data: **data-driven via JSON** under `res://data/` (loaded by `DataRegistry`).
- Graphics: **simple placeholders only** in early phases (ColorRects / simple shapes / tiny
  generated textures). No heavy external assets yet.
- Persistence: JSON save file under `user://`.

## 4. Architectural rules (hard constraints)
1. **Data-driven**: quests, dialogues, items, NPCs, enemies, factions, loot, skills, maps are
   defined in `res://data/**.json` with stable IDs — never hardcoded in scripts.
2. **Separation of systems**: no god-objects. The player does **not** contain quest/dialogue/
   inventory/save/combat logic directly.
3. **Component-based actors**: reusable Node components (Health, Stats, Inventory, Interaction,
   Equipment, Faction, Loot) attached to Player / NPC / Enemy.
4. **EventBus**: global cross-system notifications go through a signal bus (loose coupling).
5. **GameState**: single source of truth for runtime state (current map, player, quests,
   inventory, gold, flags, persistent world state).
6. **SaveManager owns persistence**: serialize/restore the `GameState` snapshot through one boundary.
7. **Quests are staged** with abstract conditions.
8. **Dialogue supports conditions** (even if first dialogue is simple).
9. **World = connected maps** (separate scenes + transitions), not one giant open world.
10. **Modular UI** (HUD / DialogueBox / InventoryUI / QuestJournalUI as separate scenes).
11. **Scalability before content**: a few clean data-driven systems beat many hardcoded ones.

## 5. Current state
- **Milestone 8 — COMPLETE and verified in Godot 4.3.** (M0–M7 complete before it.)
- Three connected maps (Village / Forest / Cave) with walk-on `AreaTransition`s and `SpawnPoint`s.
  `SceneLoader` swaps maps data-driven (`maps.json`), keeps a **persistent player**, and emits
  `map_changed`. **`quest_first_dungeon` is now completable in-world**: blacksmith → forest → cave
  (entered_area) → grab the fragment (has_item) → return + talk (talked_to) → reward.
- `SaveManager` now saves/loads JSON snapshots to `user://saves/slot_N.json`: current map, player
  position/stats/gold/inventory/equipment, quests, factions, flags, kills, and per-`persistent_id`
  `world_objects`.
- Pickups and enemies apply persistent `collected` / `dead` state on map load. Existing slimes have
  stable IDs: `enemy_village_slime_001`, `enemy_cave_slime_001`.
- Verified: M7 headless save/load test restored map, player position/health/gold, inventory,
  active quest stage, kill count, collected fragment, and dead enemy removal; boot clean.
- `ProgressionManager` now handles XP and level-ups. Quest rewards and enemy kills grant XP;
  reaching the threshold increases level, max health, refills health, increases damage, and emits
  `player_level_up`. HUD shows level + XP progress.
- SR1 core scalability review is complete (`docs/reviews/SR1_CORE_SCALABILITY_REVIEW.md`): no
  rewrite needed before M9; skeleton remains scalable, but M9 must harden validation, tests, input,
  dynamic-object persistence contracts, and runtime guardrails.
- Note: player death is still a placeholder (respawn full HP).
- Next: Milestone 9 (Data & tooling hardening).

## 6. Implemented systems
- **M1**: `PlayerController`, `Camera2D` follow, `Village` placeholder map, minimal `HUD`.
- **M2**: `DataRegistry`, `InteractionComponent` + `PlayerInteraction`, `NPC`, `DialogueManager` +
  `DialogueBox`.
- **M3**: `Conditions.gd` (shared predicate eval), `QuestManager` (staged, event-driven + rewards),
  `QuestJournalUI` (J). Dialogue filters choices by `conditions` + runs `start_quest`/`advance_quest`.
- **M4**: `InventoryManager` (player inventory broker, stacking), `PickupItem` (Area2D auto-collect
  + persistent_id), `InventoryUI` (I). Quest rewards go through InventoryManager.
- **M5**: `HealthComponent`, `StatsComponent`, `Hitbox`/`Hurtbox`, `LootComponent`, `EnemyAI`
  (Slime), `PlayerCombat` (melee + player health synced to GameState). EventBus actor_damaged/died;
  `GameState.kills` feeds `killed_enemy`.
- **M6**: `SceneLoader` (data-driven map swap + persistent player + `map_changed`), `SpawnPoint`,
  `AreaTransition` (walk-on, deferred swap), `PlaceholderMap` (room base); Forest + Cave maps.
- **M7**: `SaveManager` full JSON save/load; `PersistentWorldObject` helper; pickup `collected`
  state and enemy `dead` state persist across map reload/save-load.
- **M8**: `ProgressionManager` (autoload) handles XP rewards, level thresholds, max-health/damage
  growth, `player_level_up`, enemy `xp_reward`, and HUD level/XP display.
- **Autoloads live**: EventBus, GameState, DataRegistry, InventoryManager, QuestManager,
  DialogueManager, SceneLoader, SaveManager, ProgressionManager.
- **Controls**: move WASD/arrows · interact E/Space · journal J · inventory I · attack left-mouse ·
  save F5 · load F9.

## 7. Planned systems (by milestone — see `architecture/ROADMAP.md`)
- M8 Progression (XP/level/stats) is complete.
- SR1 Core scalability review is complete. M9 Data & tooling hardening is next.
- M9-M20 are now scheduled in `docs/architecture/ROADMAP.md` as the path from prototype skeleton
  to production content: tooling/data validation, world authoring, quest/dialogue pipeline, factions,
  economy/equipment, combat/skills/magic, dungeons, UX/persistence hardening, art/audio pipeline,
  first real region/story act, world expansion, and alpha stabilization.
- Scalability reviews are explicit milestones: SR1 after M8, SR2 after world authoring, SR3 after
  narrative systems, SR4 before production region work, and SR5 before broad world/story expansion.
- Strategic rule: keep the current Village/Forest/Cave content as dev sandbox/regression content
  until a real production region exists; do not let test content become a hidden dependency of core
  systems.

## 8. What NOT to do
- ❌ No giant `Player.gd` that does everything.
- ❌ No hardcoded RPG content (items/quests/dialogue/NPCs/enemies) inside scripts.
- ❌ No out-of-scope features ahead of the current milestone.
- ❌ No duplicated logic.
- ❌ No deleting existing files without explaining why first.
- ❌ No heavy dependencies / large external asset packs without asking the user.
- ❌ Do **not** resurrect the previously wiped prototypes ("Aethermoor" Phaser game, "Grimward"
  Canvas2D rebuild). They were intentionally removed (history kept in git by SHA).
- ⚠️ If a request conflicts with the scalable architecture, **STOP and flag it** instead of
  shipping a fragile shortcut.

## 9. Naming conventions
- **Scene/script files defining a class or node**: `PascalCase` (`Player.gd`, `HealthComponent.gd`,
  `Village.tscn`).
- **Data files**: `snake_case` (`items.json`, `quests.json`).
- **`class_name`**: `PascalCase`. **Methods / variables**: `snake_case`.
- **Signals**: `snake_case`, past-tense for facts (`actor_died`, `item_added`).
- **Constants / enums values**: `UPPER_SNAKE_CASE`. **Private members**: `_leading_underscore`.
- **Node names** in scenes: `PascalCase`.
- **Content IDs**: `lower_snake_case` with a type prefix (see §10).

## 10. ID rules (critical for save/load & data-driven design)
- **Content IDs** (defined in `data/`): `item_iron_sword`, `item_health_potion`,
  `item_ancient_iron_fragment`, `quest_first_dungeon`, `npc_blacksmith_valdombra`,
  `enemy_cave_rat`, `faction_valdombra_village`, `dialogue_blacksmith_intro`, `map_village`,
  `map_forest`, `map_cave_01`, `skill_one_handed`.
- **Persistent world-object IDs** (`persistent_id`): every world object whose state must survive
  save/reload (chests, unique loot, doors, bosses, switches) carries a stable, globally-unique
  `persistent_id`: `chest_forest_001`, `enemy_cave_boss_001`, `door_mine_locked_001`,
  `item_ancient_iron_world_001`.
- IDs are **stable forever** once shipped in a save; never reuse or renumber.

## 11. Current milestone state
**M8 — Progression: COMPLETE** (XP/level/stat growth + quest/enemy XP rewards; verified in Godot
4.3). M0–M7 complete before it. **SR1 complete**; M9 not started.

## 12. Recommended next step
Begin **Milestone 9**: data/tooling hardening. Implement validators/preflight, repeatable headless
regression checks, input-map cleanup, dynamic world-object persistence contract, and runtime
guardrails for unknown content IDs. Findings are in `docs/reviews/SR1_CORE_SCALABILITY_REVIEW.md`.

## 13. Summary for a new agent (read this first)
Valdombra is a from-scratch, data-driven, component-based 2D top-down fantasy RPG in Godot 4 +
GDScript, designed to scale. **Milestone 8 is complete and verified**: Village, Forest, and Cave
are connected by data-driven map transitions, `quest_first_dungeon` is playable end-to-end, and
save/load restores the core runtime state plus persistent world-object states. XP/level progression
now works through quest and enemy rewards. SR1 found no need for a rewrite; the next milestone is
**M9 data/tooling hardening**.

Read `HANDOFF.md` first for the exact current state and next action, then `TASKS.md` and
`SESSION_LOG.md` for live progress. Use `architecture/ARCHITECTURE.md`,
`architecture/DATA_SCHEMAS.md`, and `architecture/SYSTEMS.md` as technical contracts; they should
not override the live state files. Do not hardcode content; do not build ahead of the roadmap.
