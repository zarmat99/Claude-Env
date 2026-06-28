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
- Graphics: **Image Gen is the primary real-asset source**, but generated assets must follow
  `docs/architecture/IMAGE_GEN_ASSET_RULES.md`. Direct generated atlases/maps are concept-only;
  gameplay art must be generated as atomic terrain tiles or sprites, processed, metadata-tracked,
  and approved in a Godot screenshot.
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
10. **Modular UI** (HUD / DialogueBox / InventoryUI / QuestJournalUI / QuestDebugUI as separate scenes).
11. **Scalability before content**: a few clean data-driven systems beat many hardcoded ones.

## 5. Current state
- **M12 is complete and verified (`.\test.bat` passes; committed and pushed on `master`).** M0-M12,
  M10R, SR1, and SR2 are complete; SR3 is the next milestone.
- Village / Forest / Cave remain the connected dev sandbox/regression slice. The failed M10
  `map_probe_ruins` asset-probe map has been removed from active content.
- `SceneLoader` swaps maps data-driven (`maps.json`), keeps a persistent player, and emits
  `map_changed`. `quest_first_dungeon` remains completable in-world: blacksmith -> forest -> cave
  -> fragment -> return + talk -> reward.
- `SaveManager` saves/loads JSON snapshots to `user://saves/slot_N.json`: current map, player
  position/stats/gold/inventory/equipment, quests, factions, flags, kills, and per-`persistent_id`
  `world_objects`.
- Pickups and enemies apply persistent `collected` / `dead` state on map load. M10 adds persistent
  chest/door/switch states (`opened`, `open`, `on`) and validates authored object placement.
- `ProgressionManager` handles XP and level-ups. Quest rewards and enemy kills grant XP; level-up
  increases level, max health, health, damage, and emits `player_level_up`. HUD shows level + XP.
- M9 adds `DataRegistry.validate_all()` preflight checks, input actions, unknown-ID runtime
  guardrails, dynamic pickup persistence through `GameState.world_objects`, and persistent headless
  regression coverage.
- M10 adds `asset_sets.json`, `world_objects.json`, `AuthoredMap.gd`, chest/door/switch scenes,
  authored map validation, and `M10WorldAuthoringRunner`. The failed generated atlas and
  `ProbeRuins.tscn` were removed from active content after visual review.
- **Important asset warning**: the Imagen atlas is not acceptable as a serious tileset. It is a
  collage in grid form: not tileable, visibly framed/guttered, inconsistent in scale, and produces
  bad maps when sliced into cells. It has been removed from active assets; use git history/review
  docs only if the failed example is needed.
- User decision (2026-06-26): Image Gen remains the source of real assets. The corrected pipeline
  is documented in `docs/architecture/IMAGE_GEN_ASSET_RULES.md`: generate one atomic asset at a
  time, process/pack by tooling, separate terrain from sprites, and require screenshot approval.
- M10R generated and integrated the first governed candidate batch: five terrain tiles and six
  object sprites total in `generated_assets.json`, including multi-tile tree/cottage/stalagmite/
  boulder props. Village/Forest/Cave now render generated terrain/prop candidates for review.
  Generated props build footprint collisions from metadata, and old placeholder wall visuals are
  hidden. The corrected set is approved as the base Image Gen asset-pipeline rule set.
- SR2 passed in `docs/reviews/SR2_MAP_SCALABILITY_REVIEW.md`: the map pipeline can proceed to M11
  with no blocking fixes. Real production maps should use the data-authored/governed-asset path,
  not placeholder scene shortcuts.
- M11 production dialogue actions, branching conventions, the Branch Tester regression fixture, and
  the F10 Quest Debug overlay are complete. Quest/debug authoring can be inspected in game.
- M12 adds `FactionManager`, reputation conditions/actions, NPC role/service/quest-offer metadata,
  the in-game Reputation Tester fixture, faction state in Quest Debug, and faction-aware enemy
  hostility.
- M12 verification passed: JSON parses, `git diff --check` is clean, and `.\test.bat` runs green
  (Godot import plus M9 regression, M10 quarantine/world-object smoke, M10R asset preview, M11
  dialogue/branching regression, and M12 faction reputation regression). M12 is committed and pushed.
- Note: player death is still a placeholder (respawn full HP).
- Next: SR3 (Narrative scalability review), then M13.

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
- **M9**: `DataRegistry` validates JSON/data references and map scenes; managers refuse unknown
  content IDs; runtime loot drops register active dynamic pickup state in `world_objects`; input
  uses actions for inventory/journal/attack/save/load; persistent tests live in `tests/headless/`.
- **M10**: `AuthoredMap` builds data-authored maps from `maps.json`: tile layers, collision
  metadata, spawn points, transitions, and placed objects. `DataRegistry` validates asset sets,
  world-object definitions, authored layer dimensions/tile IDs, transition targets, object
  references, switch targets, loot/items/enemies, and duplicate `persistent_id`s. Chest, door, and
  switch objects persist state through `GameState.world_objects`.
- **M11**: production dialogue actions (`give_item`, `take_item`, `give_reward`, flags, quest stage
  jumps), branching quest conventions, a richer Branch Tester fixture, and F10 Quest Debug are live.
- **M12**: `FactionManager` initializes/clamps/saves faction reputation, dialogue can change or set
  reputation, conditions can gate on reputation, NPCs declare validated role metadata, Quest Debug
  shows faction state, and enemies respect faction hostility before chasing.
- **Autoloads live**: EventBus, GameState, DataRegistry, InventoryManager, QuestManager,
  DialogueManager, FactionManager, SceneLoader, SaveManager, ProgressionManager.
- **Controls**: move WASD/arrows · interact E/Space · journal J · inventory I · attack left-mouse ·
  save F5 · load F9 · quest debug F10. Code now reads input action names for
  journal/inventory/attack/save/load/debug.

## 7. Planned systems (by milestone — see `architecture/ROADMAP.md`)
- M8 Progression, SR1 Core scalability review, M9 Data & tooling hardening, M10 reusable
  world-authoring systems, M10R governed asset generation/approval, SR2 map scalability review, M11
  quest/dialogue production pipeline are complete. M12 NPC/faction/reputation implementation is
  complete but pending full Godot verification and commit/push before SR3.
- M11-M20 remain scheduled in `docs/architecture/ROADMAP.md` as the path from prototype skeleton
  to production content: quest/dialogue pipeline, factions, economy/equipment, combat/skills/magic,
  dungeons, UX/persistence hardening, art/audio pipeline, first real region/story act, world
  expansion, and alpha stabilization.
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
**M12 - NPCs, factions & reputation: COMPLETE and verified.** M12 has data-backed faction
reputation, reputation actions/conditions, validated NPC role metadata, faction-aware enemy
hostility, an in-game Reputation Tester fixture, and M12 headless regression coverage in `test.bat`.
`.\test.bat` passes and M12 is committed and pushed. SR3 is the next milestone.

## 12. Recommended next step
Proceed with **SR3-T1 - Narrative scalability review** (confirm narrative/faction systems scale to
real story production) before moving into M13 economy/equipment.

## 13. Summary for a new agent (read this first)
Valdombra is a from-scratch, data-driven, component-based 2D top-down fantasy RPG in Godot 4 +
GDScript, designed to scale. **M0-M12, M10R, SR1, and SR2 are complete and verified** (`.\test.bat`
passes; M12 committed and pushed). Village/Forest/Cave remain the playable dev slice and now show
approved generated terrain/prop candidates. Save/load, progression, quest flow, dynamic pickups,
quarantine checks, world-object states, M10R asset preview, M11 dialogue actions/branching, and M12
faction reputation are covered by `.\test.bat` once runnable. Quest/faction authoring can be
inspected in game with the F10 Quest Debug overlay. The next step is **SR3-T1 narrative scalability
review**.

Read `HANDOFF.md` first for the exact current state and next action, then `TASKS.md` and
`SESSION_LOG.md` for live progress. Use `architecture/ARCHITECTURE.md`,
`architecture/DATA_SCHEMAS.md`, and `architecture/SYSTEMS.md` as technical contracts; they should
not override the live state files. Do not hardcode content; do not build ahead of the roadmap.
