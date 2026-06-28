# Valdombra — TASKS

> Task tracker. Each task: `ID · description · milestone · files · dependencies · status`.
> Move tasks between sections as state changes. IDs are stable.

Legend: status ∈ { backlog, in_progress, done, blocked }.

---

## In Progress
- (none)

## Backlog

### M10R - Asset-pipeline remediation gate
- (none)

### SR2 - Map scalability review
- (none)

### M11 - Quest & dialogue production pipeline
- (none)

### M12 - NPCs, factions & reputation
- (none)

### SR3 follow-ups - narrative hardening (from SR3 review)
- (none - SR3-F1/F2/F3 done; see Done)

### M13 - items, equipment, economy & merchants
- (none - complete)

### Later roadmap
- Full milestone sequence and review gates live in `docs/architecture/ROADMAP.md` (M11-M20,
  SR2-SR5). Add detailed tasks here when each milestone becomes current.

## Done
- **M13-V1 - Verify, commit, and push M13** - M13 - files: `test.bat`,
  `tests/headless/M13EconomyEquipmentRunner.{gd,tscn}` - **done** (2026-06-28): full `.\test.bat`
  passes (import + M9/M10/M10R/M11/M12/SR3/M13); equipment/item-use/economy + containers + merchant
  committed and pushed. M13 complete.
- **M13-T5 - In-game merchant + data-authored stock** - M13 - files:
  `data/merchants/merchants.json`, `data/npcs/npcs.json`, `data/dialogues/dialogues.json`,
  `scenes/npcs/Merchant.tscn`, `scenes/maps/Village.tscn`, `scripts/economy/EconomyManager.gd`,
  `scripts/dialogue/DialogueManager.gd`, `scripts/core/DataRegistry.gd` - **done** (2026-06-28):
  added a `merchants.json` table (validated stock + buy/sell multipliers), a real `npc_merchant_valdombra`
  placed in the Village with a merchant dialogue, merchant-aware pricing/stock in `EconomyManager`,
  and an optional `merchant` ref on `buy_item`/`sell_item` actions.
- **M13-T4 - Container inventories** - M13 - files:
  `scripts/inventory/ItemStacking.gd`, `scripts/components/InventoryComponent.gd`,
  `scripts/inventory/InventoryManager.gd`, `scripts/world/Chest.gd`,
  `tests/headless/M13EconomyEquipmentRunner.{gd,tscn}` - **done** (2026-06-28): extracted stacking
  into a shared `ItemStacking` helper, added a reusable non-player `InventoryComponent` (used by
  `Chest` for its contents and transfer-to-player), and removed the duplicated stacking logic.
- **M13-T1 - Equipment & derived stats** - M13 - files:
  `scripts/equipment/EquipmentManager.gd`, `scripts/player/PlayerCombat.gd`, `project.godot`,
  `scripts/core/EventBus.gd`, `data/items/items.json`,
  `tests/headless/M13EconomyEquipmentRunner.{gd,tscn}` - **done** (2026-06-28): `EquipmentManager`
  brokers `GameState.player.equipment` (equip/unequip from inventory, slot swap), derives combat
  stats on demand (weapon `damage`, armor `max_health`), feeds `PlayerCombat`, and round-trips
  through save/load.
- **M13-T2 - Consumable item use** - M13 - files:
  `scripts/inventory/InventoryManager.gd`, `scripts/player/PlayerCombat.gd`, `scripts/core/EventBus.gd`,
  `tests/headless/M13EconomyEquipmentRunner.{gd,tscn}` - **done** (2026-06-28): `InventoryManager.use_item`
  applies a consumable's `use_effect` (heal, clamped to effective max health), consumes one, refuses a
  wasted use, and emits `item_used`; the live player health mirrors it.
- **M13-T3 - Economy & merchant trade** - M13 - files:
  `scripts/economy/EconomyManager.gd`, `scripts/dialogue/DialogueManager.gd`, `scripts/core/Conditions.gd`,
  `scripts/core/DataRegistry.gd`, `data/dialogues/dialogues.json`,
  `tests/headless/M13EconomyEquipmentRunner.{gd,tscn}` - **done** (2026-06-28): `EconomyManager`
  derives buy/sell prices from item `value`, brokers gold-checked buy/sell; dialogue actions
  `buy_item`/`sell_item` and the `gold_at_least` condition let merchants be authored in JSON.
- **SR3-F1 - Eliminate dialogue soft-lock** - SR3 - files:
  `scripts/dialogue/DialogueManager.gd`, `scripts/ui/DialogueBox.gd`, `scripts/core/DataRegistry.gd`,
  `data/dialogues/dialogues.json`, `tests/headless/SR3NarrativeHardeningRunner.{gd,tscn}` - **done**
  (2026-06-28): added `DialogueManager.advance()` + a default Continue/Leave affordance so a
  choiceless or fully-gated node ends or follows a node-level `next` instead of soft-locking the
  paused tree; node `next` is validated.
- **SR3-F2 - Multi-condition quest objectives** - SR3 - files:
  `scripts/quest/QuestManager.gd`, `scripts/core/DataRegistry.gd`, `data/quests/quests.json`,
  `tests/headless/SR3NarrativeHardeningRunner.{gd,tscn}` - **done** (2026-06-28): `advance_on` now
  accepts a single condition, an array (AND), or `any_of`/`all_of`; `talked_to` stays momentary
  inside a set; validated by `DataRegistry`.
- **SR3-F3 - State-reactive dialogue** - SR3 - files:
  `scripts/dialogue/DialogueManager.gd`, `scripts/core/DataRegistry.gd`,
  `data/dialogues/dialogues.json`, `tests/headless/SR3NarrativeHardeningRunner.{gd,tscn}` - **done**
  (2026-06-28): dialogues accept `entry_rules` to pick the opening node by state, with `entry` as the
  guaranteed fallback; validated by `DataRegistry`.
- **SR3-T1 - Narrative scalability review** - SR3 - files:
  `docs/reviews/SR3_NARRATIVE_SCALABILITY_REVIEW.md`, `docs/architecture/ROADMAP.md` - **done**
  (2026-06-28): reviewed quest/dialogue/NPC/faction systems, validation coverage, and debug tooling.
  Verdict: proceed to M13; no blocking rewrite. Promoted SR3-F1 (dialogue soft-lock guard,
  near-term) and SR3-F2/F3 (multi-condition objectives, reactive dialogue) before M18.
- **M12-V1 - Verify, commit, and push M12** - M12 - files: `test.bat`,
  `tests/headless/M12FactionReputationRunner.{gd,tscn}` - **done** (2026-06-28): `.\test.bat` passes
  (Godot import + M9/M10/M10R/M11/M12 headless runners, exit 0); committed and pushed the full M12
  implementation on `master`.
- **M12-T4 - Hostility/friendliness foundations** - M12 - files:
  `scripts/factions/FactionManager.gd`, `scripts/enemies/EnemyAI.gd`, `data/factions/factions.json`,
  `tests/headless/M12FactionReputationRunner.gd` - **done** (2026-06-28): connected faction
  relationships and player reputation to actor hostility decisions without map-specific scripts.
- **M12-T3 - NPC role metadata and debug coverage** - M12 - files:
  `data/npcs/npcs.json`, `scripts/core/DataRegistry.gd`, `scripts/ui/QuestDebugUI.gd` - **done**
  (2026-06-28): NPCs now declare validated `role`, `services`, and `quests_offered`; the F10 debug
  overlay shows faction reputation/friendly/hostile state.
- **M12-T2 - Reputation-gated dialogue/quest fixtures** - M12 - files:
  `data/{dialogues,quests,npcs}.json`, `scenes/npcs/ReputationTester.tscn`,
  `scenes/maps/Village.tscn`, `tests/headless/M12FactionReputationRunner.{gd,tscn}` - **done**
  (2026-06-28): added the in-game Reputation Tester and a JSON-only fixture where reputation gates
  dialogue availability, quest outcomes, rewards, and hostile consequences.
- **M12-T1 - Faction reputation state and actions** - M12 - files:
  `scripts/factions/FactionManager.gd`, `project.godot`, `scripts/core/{EventBus,GameState,SaveManager,Conditions,DataRegistry}.gd`,
  `scripts/dialogue/DialogueManager.gd` - **done** (2026-06-28): added data-backed faction
  reputation state, save/load defaults, `change_reputation`/`set_reputation` actions, and
  reputation gate conditions.
- **M11-T4 - Journal/debug authoring tools** - M11 - files:
  `scripts/ui/QuestDebugUI.gd`, `scenes/ui/QuestDebugUI.tscn`, `scenes/main/Main.gd`,
  `project.godot`, `tests/headless/M9RegressionRunner.gd` - **done** (2026-06-28): added an
  authoring overlay toggled by `quest_debug_toggle` / F10 that shows map, level/XP/gold, active
  quest stages, completed quests, flags, and inventory for in-game questline verification.
- **M11-T3 - Quest/dialogue regression fixtures** - M11 - files:
  `data/{quests,dialogues,npcs}.json`, `tests/headless/M11DialogueActionsRunner.gd`,
  `scenes/npcs/BranchTester.tscn` - **done** (2026-06-28): added a multi-stage branching
  regression quest with item grants/removals, branch rewards, and persistent flag consequences.
  The M11 runner now verifies both final outcomes, and the Branch Tester NPC uses the richer
  in-game fixture.
- **M11-T2 - Branching quest authoring conventions** - M11 - files:
  `docs/architecture/QUEST_DIALOGUE_AUTHORING.md`, `docs/architecture/DATA_SCHEMAS.md`,
  `docs/architecture/SYSTEMS.md`, `scripts/quest/QuestManager.gd`,
  `scripts/dialogue/DialogueManager.gd`, `scripts/core/{Conditions,DataRegistry}.gd`,
  `data/{quests,dialogues}.json`, `tests/headless/M11DialogueActionsRunner.gd` - **done**
  (2026-06-28): defined quest/dialogue branching conventions, added `set_quest_stage` and
  `flag_not_set`, and verified two alternate branch outcomes through the M11 headless fixture.
- **M11-T1 - Production dialogue actions** - M11 - files:
  `scripts/dialogue/DialogueManager.gd`, `scripts/core/DataRegistry.gd`,
  `scripts/quest/QuestManager.gd`, `data/dialogues/dialogues.json`,
  `tests/headless/M11DialogueActionsRunner.gd`, `test.bat` - **done** (2026-06-28): implemented
  and validated `give_item`, `take_item`, `give_reward`, `clear_flag`, and existing quest/flag
  actions as the production dialogue action set. Added a headless M11 fixture to keep the contract
  under regression.
- **SR2-T1 - Review M10 world authoring scalability** - SR2 - files:
  `docs/reviews/SR2_MAP_SCALABILITY_REVIEW.md`, `docs/architecture/ROADMAP.md` - **done**
  (2026-06-27): reviewed map authoring, transitions/spawns, persistent objects, dev sandbox
  isolation, and governed asset assumptions. Verdict: proceed to M11; no blocking fixes before
  narrative systems.
- **M10R-T5 - Visual approval gate** - M10R - files:
  `data/assets/generated_assets.json`, `docs/architecture/IMAGE_GEN_ASSET_RULES.md`,
  `docs/ai_memory/DECISIONS.md` - **done** (2026-06-27): user approved the corrected generated
  terrain/prop set after house scale and tree trunk-only collision fixes; generated assets are now
  marked `approved: true`.
- **M10R-T6 - Generate first governed Image Gen asset set** - M10R - files:
  `assets/source/image_gen/`, `assets/{tilesets,sprites}/generated/`,
  `data/assets/{generated_assets,asset_sets}.json`, `scenes/maps/{Village,Forest,Cave}.tscn`,
  `scripts/world/{GeneratedPropSprite,Village,PlaceholderMap,M10RAssetPlayground}.gd`,
  `tests/headless/M10RAssetPreviewRunner.gd` - **done technically / pending visual approval**
  (2026-06-27): generated governed terrain/object candidates with Image Gen, including multi-tile
  prop candidates, processed chroma-key sprites, rebuilt the dev atlas, registered metadata, and
  placed candidates in the current test maps. All new generated assets remain `approved: false`
  until visual review.
- **M10R-T4 - Separate terrain tiles from object sprites** - M10R - files:
  `docs/architecture/IMAGE_GEN_ASSET_RULES.md`, `scripts/world/GeneratedPropSprite.gd`,
  `data/assets/generated_assets.json` - **done** (2026-06-27): terrain candidates live in the
  generated terrain atlas, object candidates are processed transparent sprites with bottom-center
  pivot, `world_size`, and `footprint_tiles` metadata.
- **M10R-T3 · Quarantine failed M10 probe content** · M10R · files:
  `assets/tilesets/proxy_dark_fantasy_atlas.png`, `scenes/maps/ProbeRuins.tscn`,
  `data/{assets,world}/`, `data/maps/maps.json`, `scenes/maps/Forest.tscn`,
  `tests/headless/M10WorldAuthoringRunner.gd` · **done** (2026-06-26): removed the failed atlas,
  import file, probe scene, active map link, proxy asset set, and proxy world-object data from
  active content; runner now verifies the failed probe is inactive while preserving useful M10
  code smoke coverage.
- **M10R-T2 · Choose tile-source strategy** · M10R · files:
  `docs/architecture/IMAGE_GEN_ASSET_RULES.md`, `docs/ai_memory/DECISIONS.md` · **done**
  (2026-06-26): user confirmed Image Gen remains the primary real-asset source; the fix is atomic
  generation plus processing/review rules, not switching to external packs.
- **M10R-T1 · Write Image Gen asset generation rules** · M10R · files:
  `docs/architecture/IMAGE_GEN_ASSET_RULES.md` · **done** (2026-06-26): added mandatory rules for
  terrain tiles, transition tiles, object sprites, actor sprites, metadata, prompt templates,
  failure conditions, processing, and visual approval gates.
- **M10-T5 · Tileset/asset scalability probe** · M10 · files:
  `assets/tilesets/proxy_dark_fantasy_atlas.png`, `data/assets/asset_sets.json`,
  `tests/headless/M10WorldAuthoringRunner.{gd,tscn}` · **done with failure finding** (2026-06-25):
  generated an Imagen atlas and normalized it to a 1024x1024 8x8 technical atlas; validation proved
  import/schema mechanics, but screenshot review proved the direct generated-atlas approach is not
  acceptable for serious map art. Follow-up moved to M10R.
- **M10-T4 · Dev sandbox vs production start separation** · M10 · files:
  `data/maps/maps.json`, `scenes/maps/Forest.tscn` · **done** (2026-06-25): kept the existing
  Village/Forest/Cave slice as dev sandbox content; the failed probe map added during M10 was
  removed from active content during M10R.
- **M10-T3 · Spawn/transition/encounter validation expansion** · M10 · files:
  `scripts/core/DataRegistry.gd`, `data/maps/maps.json` · **done** (2026-06-25): validation now
  checks authored spawns, transition targets, map layer dimensions/tile IDs, placed pickups,
  enemies, loot, switch targets, and duplicate persistent IDs across scene and authored content.
- **M10-T2 · Persistent world-object library** · M10 · files:
  `scripts/world/{Chest,Door,Switch,PersistentWorldObject}.gd`, `scenes/world/{Chest,Door,Switch}.tscn`,
  `data/world/world_objects.json` · **done** (2026-06-25): added reusable chest, door, and switch
  objects with persistent `opened`, `open`, and `on` states.
- **M10-T1 · Map index and authoring conventions** · M10 · files:
  `scripts/world/AuthoredMap.gd`, `data/maps/maps.json`, `docs/architecture/DATA_SCHEMAS.md` ·
  **done** (2026-06-25): maps can now declare region/dev role plus data-authored layers, spawns,
  transitions, and object placements consumed by `AuthoredMap`.
- **M9-V1 · Verify M9 in Godot, then commit/push** · M9 · files: `test.bat`,
  `tests/headless/M9RegressionRunner.{gd,tscn}` · **done** (2026-06-25): Godot import and M9
  regression suite pass; command verified via `.\test.bat`.
- **M9-T1 · Data validators + duplicate ID / persistent_id checks** · M9 · files:
  `scripts/core/DataRegistry.gd`, `data/{factions,maps}.json` · **done** (2026-06-25): added
  preflight validation for JSON shape, content IDs, cross-file
  references, scene paths, map/spawn references, unsupported dialogue actions, loot/reward refs,
  and duplicate `persistent_id`s.
- **M9-T2 · Repeatable headless smoke/regression checks** · M9 · files:
  `tests/headless/M9RegressionRunner.{gd,tscn}`, `test.bat` · **done** (2026-06-25): persistent
  suite covers data validation, boot, map transitions,
  first quest flow, save/load, progression, and dynamic pickup persistence.
- **M9-T3 · Input-map cleanup for hardcoded controls** · M9 · files:
  `project.godot`, `scripts/{ui,player,core}` · **done** (2026-06-25): inventory, journal,
  attack, save, and load now use input actions.
- **M9-T4 · Dynamic world-object persistence contract** · M9 · files:
  `scripts/components/LootComponent.gd`, `scripts/world/PersistentWorldObject.gd`,
  `scripts/core/SceneLoader.gd` · **done** (2026-06-25): runtime loot drops register active dynamic
  pickup state in `GameState.world_objects` and respawn from it.
- **M9-T5 · Runtime guardrails for unknown content IDs** · M9 · files:
  `scripts/{inventory,dialogue,quest,core,items,enemies,npcs,progression}` · **done** (2026-06-25):
  unknown IDs now push errors and refuse invalid state in manager and scene entry points.
- **SR1-T1 · Review core scalability after M8** · SR1 · files:
  `docs/reviews/SR1_CORE_SCALABILITY_REVIEW.md` · **done** (2026-06-25): project remains scalable
  enough to proceed; required hardening promoted into M9; no rewrite needed before M9.
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
