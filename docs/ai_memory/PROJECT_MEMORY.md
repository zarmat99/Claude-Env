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
- **SR4 (systems stress review) is complete and verified**: `SR4SystemsStressRunner` injects a
  review-scale synthetic dataset in memory (10+ maps, 20 NPCs, 10 quests, 50 items, several factions,
  merchants, and dungeons), validates it, exercises mid-flow save/load, restores the real project
  data, and confirms the architecture can proceed to M16 with no blocking rewrite. Review:
  `docs/reviews/SR4_SYSTEMS_STRESS_REVIEW.md`. Full `.\test.bat` passes (exit 0); committed and pushed.
- **M15 (dungeons/encounters) is complete and verified** (`.\test.bat` green; committed/pushed):
  a data-authored Trial Dungeon fixture is reachable from Cave and covers keyed doors, lever-opened
  gates, persistent enemies/bosses, encounter metadata, reward chests, authored collision rects, and
  save/load correctness. M0-M15, M10R, SR1, SR2, SR3, and SR4 are complete; M16 is next.
- **M14 (combat/skills/magic) is complete and verified**:
  typed damage rules, armor/resistances, skill XP/state, player abilities, three enemy archetypes,
  Cave placements, data validation, and M14 regression coverage.
- **M13 (items/equipment/economy/merchants) is complete and verified**: equipment + derived combat
  stats, consumable item use, buy/sell with merchant stock/pricing, a reusable container
  `InventoryComponent`, and a data-authored village merchant.
- Post-M13 review fix: `SaveManager` preserves base `stats.max_health` when armor is equipped,
  saves current health separately, and restores live player health with
  `EquipmentManager.get_effective_stat("max_health")`. `M13EconomyEquipmentRunner` covers armored
  save/load so derived max health is not baked into base stats.
- Post-M13 inventory UX fix: `InventoryUI` now exposes clickable `Equip`, `Use`, and equipped-slot
  unequip buttons while delegating the actual state changes to `EquipmentManager` and
  `InventoryManager`. `M13EconomyEquipmentRunner` covers the UI action flow.
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
- Verification: JSON parses, `git diff --check` is clean, Godot import/class cache passes, and
  `SR4SystemsStressRunner` passes. Full `.\test.bat` last ran green through M15; the SR4-inclusive
  full suite could not be rerun in this block because command escalation hit the environment usage
  limit.
- Note: player death is still a placeholder (respawn full HP).
- Next: start M16 - persistence & UX hardening.

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
- **SR3 hardening**: dialogue soft-lock guard (`DialogueManager.advance()` + Continue/Leave
  affordance + node-level `next`), multi-condition quest `advance_on` (single / array AND /
  `any_of` / `all_of`, `talked_to` kept momentary), and `entry_rules` state-reactive opening nodes;
  validated by `DataRegistry` and covered by `SR3NarrativeHardeningRunner`.
- **M13**: `EquipmentManager` brokers `GameState.player.equipment` (equip/unequip + slot swap) and
  derives effective combat stats (weapon `damage`, armor `max_health`); `InventoryManager.use_item`
  spends consumables (`heal`); a shared `ItemStacking` helper + reusable `InventoryComponent` back
  both the player inventory and containers (`Chest`); `EconomyManager` derives buy/sell prices from
  item `value` with optional per-merchant stock/multipliers (`merchants.json`). Dialogue
  `buy_item`/`sell_item` (optional `merchant`) and the `gold_at_least` condition author merchants in
  JSON; `npc_merchant_valdombra` is live in the Village. `InventoryUI` exposes the player-facing
  equip/use/unequip actions. Save/load carries equipment + gold and keeps equipment-derived max
  health out of base `stats.max_health`.
- **M14**: `CombatSystem`/`DamageData` centralize typed damage, armor, resistance, and armor-pierce;
  `SkillManager` stores skill level/XP under `GameState.player.skills`; `PlayerAbilities` executes
  `skills.json` abilities through `ability_1/2/3`; enemies support data-authored `chaser`,
  `skirmisher`, and `sentinel` AI variants. M14 is covered by `M14CombatSkillsMagicRunner`.
- **M15**: `AuthoredMap` now supports authored collision rectangles and map-level encounter
  metadata. `Door` supports optional key requirements and key consumption. `map_trial_dungeon_01`
  is reachable from Cave and exercises keyed doors, switch gates, a boss encounter, a reward chest,
  and save/load persistence. M15 is covered by `M15DungeonEncounterRunner`.
- **SR4 stress review**: `SR4SystemsStressRunner` clones `DataRegistry` tables in memory, injects a
  review-scale synthetic dataset, validates data/ref coverage, saves and loads a mid-flow state,
  restores the real data, and keeps throwaway stress content out of production JSON. Verdict:
  proceed to M16; no blocking rewrite.
- **Autoloads live**: EventBus, GameState, DataRegistry, FactionManager, ProgressionManager,
  SceneLoader, SaveManager, InventoryManager, EquipmentManager, CombatSystem, SkillManager,
  EconomyManager, QuestManager, DialogueManager.
- **Controls**: move WASD/arrows · interact E/Space · journal J · inventory I · attack left-mouse ·
  save F5 · load F9 · quest debug F10. Code now reads input action names for
  journal/inventory/attack/save/load/debug/abilities. Ability keys are 1/2/3.

## 7. Planned systems (by milestone — see `architecture/ROADMAP.md`)
- M8 Progression, SR1 core review, M9 data/tooling hardening, M10 world authoring, M10R governed
  assets, SR2 map review, M11 quest/dialogue pipeline, M12 NPCs/factions/reputation, SR3 narrative
  review, M13 items/equipment/economy/merchants, M14 combat/skills/magic, and M15
  dungeons/encounters, plus SR4 systems stress review, are all complete.
- M16-M20 remain scheduled in `docs/architecture/ROADMAP.md` as the path from prototype skeleton
  to production content: UX/persistence hardening, art/audio pipeline, first real region/story act,
  world expansion, and alpha stabilization.
- Scalability reviews are explicit milestones: SR1 after M8, SR2 after world authoring, SR3 after
  narrative systems, SR4 before production region work, and SR5 before broad world/story expansion.
- Manual verification gates are required for player-facing work. MV1 sits between M13 and M14:
  Codex opens the visible game window, narrates each intended action before doing it, and records/
  fixes/promotes every issue found before proceeding.
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
  `map_forest`, `map_cave_01`, `map_trial_dungeon_01`, `skill_one_handed`,
  `item_trial_dungeon_key`, `enemy_trial_sentinel`.
- **Persistent world-object IDs** (`persistent_id`): every world object whose state must survive
  save/reload (chests, unique loot, doors, bosses, switches) carries a stable, globally-unique
  `persistent_id`: `chest_forest_001`, `enemy_cave_boss_001`, `door_mine_locked_001`,
  `item_ancient_iron_world_001`, `door_trial_locked_001`, `enemy_trial_sentinel_001`.
- IDs are **stable forever** once shipped in a save; never reuse or renumber.

## 11. Current milestone state
**SR4 - systems stress review: COMPLETE and verified.** `SR4SystemsStressRunner` injects 10+ maps,
20 NPCs, 10 quests, 50 items, several factions/merchants/dungeons, and authored encounter fixtures in
memory, then validates data refs, tests mid-flow save/load, restores real data, and validates again.
Review verdict: proceed to M16; no blocking rewrite. Full `.\test.bat` passes (exit 0) and SR4 is
committed and pushed. M16 (persistence & UX hardening) is the next milestone.

**M15 - dungeons & encounters: COMPLETE.** `map_trial_dungeon_01` is a data-authored dungeon fixture
reachable from Cave, with authored collision rects, keyed door/key consumption, switch-opened reward
gate, boss encounter metadata, reward chest, persistent enemy/door/switch/chest state, and
`M15DungeonEncounterRunner`. Godot import, full `.\test.bat`, and `git diff --check` passed.

**M14 - combat, skills & magic: COMPLETE.** Typed damage, armor/resistances, skill persistence,
player abilities, enemy archetypes, data validation, Cave placements, and regression coverage are
live. Godot import, `M14CombatSkillsMagicRunner`, full `.\test.bat`, and `git diff --check` passed.

**MV1 - shared visible in-game verification: INTERRUPTED.** It was added and started, then the user
explicitly requested stopping it and moving on to M14.

**M13 - items, equipment, economy & merchants: COMPLETE.** Equipment + derived combat stats,
consumable item use, buy/sell with merchant stock/pricing, a reusable container `InventoryComponent`,
clickable inventory equip/use/unequip actions, and a data-authored village merchant are live,
save-aware, and covered by
`tests/headless/M13EconomyEquipmentRunner`. M0-M13 plus SR1/SR2/SR3 are complete.

## 12. Recommended next step
Start **M16 - persistence & UX hardening**: save UI, multiple slots, autosave rules, save migration/
rejection handling, game-over/respawn, settings, input remapping, pause/menu flow, and UX error
feedback.

## 13. Summary for a new agent (read this first)
Valdombra is a from-scratch, data-driven, component-based 2D top-down fantasy RPG in Godot 4 +
GDScript, designed to scale. **M0-M15, M10R, SR1, SR2, SR3, and SR4 are complete** (`.\test.bat` passes).
Village/Forest/Cave remain the playable dev slice and now show approved generated terrain/prop
candidates. Save/load, progression, quest flow, dynamic pickups, quarantine checks, world-object
states, M10R asset preview, M11 dialogue actions/branching, M12 faction reputation, SR3 hardening,
M13 equipment/economy/container/merchant coverage, M14 combat/skills/magic coverage, M15
dungeon/encounter coverage, and SR4 systems stress coverage are all in `.\test.bat`.
Quest/faction authoring can be inspected in game with the F10 Quest Debug overlay. Next milestone is
M16 persistence & UX hardening.

Read `HANDOFF.md` first for the exact current state and next action, then `TASKS.md` and
`SESSION_LOG.md` for live progress. Use `architecture/ARCHITECTURE.md`,
`architecture/DATA_SCHEMAS.md`, and `architecture/SYSTEMS.md` as technical contracts; they should
not override the live state files. Do not hardcode content; do not build ahead of the roadmap.
