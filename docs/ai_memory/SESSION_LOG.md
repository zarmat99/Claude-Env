# Valdombra — SESSION LOG

> Append a new entry at the end of every session / work block. Newest at the top.

---

## 2026-06-28 - Session 031 - Make inventory items actionable

- **Report**: the inventory opened with `I`, but weapons, armor, and consumables were only listed as
  text, so the player could not equip, unequip, or use them in game.
- **Fix**: `InventoryUI` now renders action buttons for inventory entries: `Equip` for weapons/armor,
  `Use` for consumables with `use_effect`, and equipped-slot buttons under `Equipped` to unequip.
  The UI still delegates state changes to `EquipmentManager` and `InventoryManager`.
- **Regression**: extended `M13EconomyEquipmentRunner` with a headless UI probe that clicks the
  generated equip, unequip, and use buttons and verifies equipment state, inventory counts, and
  potion healing.
- **Tests**: `M13EconomyEquipmentRunner` passed; full `.\test.bat` passed (import +
  M9/M10/M10R/M11/M12/SR3/M13, exit 0).
- **Next**: M14 - combat, skills & magic.

---

## 2026-06-28 - Session 030 - Fix equipment save/load derived health

- **Report**: review found that `SaveManager._sync_player_from_world()` copied the live
  `HealthComponent.max_health` into `GameState.player.stats.max_health`. With armor equipped, this
  baked the equipment-derived max health into the saved base stat and could double-count equipment
  after load.
- **Fix**: `SaveManager` now preserves base `stats.max_health`, saves only current health from the
  live player, clamps it to the equipment-derived effective max, and restores the live
  `HealthComponent` using `EquipmentManager.get_effective_stat("max_health")`.
- **Regression**: extended `M13EconomyEquipmentRunner` with an armor save/load probe using a fake
  player + `HealthComponent`; it verifies base max health stays 30 while equipped leather armor
  derives effective max health 40 and preserves current health 35 across save/load.
- **Tests**: `M13EconomyEquipmentRunner` passed; full `.\test.bat` passed (import +
  M9/M10/M10R/M11/M12/SR3/M13, exit 0).
- **Next**: M14 - combat, skills & magic.

---

## 2026-06-28 - Session 029 - Fix merchant UX (always show wares)

- **Report**: talking to the in-village Merchant on a fresh save showed only "(Leave)" - every buy
  choice was gated by `gold_at_least` and the sell choice by owning the item, so a broke new player
  with nothing to sell saw an empty shop.
- **Fix**: `dialogue_merchant_valdombra` now always shows its buy options (with the price in the
  label), loops after each transaction (`next: "start"`) so the shop stays open, and keeps the sell
  option gated by ownership plus a "(Leave)". A purchase the player can't afford is still refused by
  `EconomyManager` (no spend), but the wares are always visible. Gold is earned via quests/selling.
- **Tests**: updated `M13EconomyEquipmentRunner._test_merchant_npc_dialogue` to cover broke browsing
  (wares visible, refused buy is a no-op, shop stays open) then an affordable purchase and leave.
  Full `.\test.bat` passed (exit 0).
- **Known UX follow-ups (M16)**: no on-screen gold readout in the HUD yet, and no "you can't afford
  that" feedback; a proper merchant/shop UI is M16. Starting gold is still 0 (gold comes from the
  first quest reward / selling).
- **Next**: M14 - combat, skills & magic.

---

## 2026-06-28 - Session 028 - Close M13 (containers + merchant)

- **Goal**: finish M13 by adding container inventories (T4) and a data-authored in-game merchant (T5).
- **M13-T4 (containers)**: extracted the stacking algorithm into a shared `ItemStacking` helper, added
  a reusable non-player `InventoryComponent` (own item list, same stacking rules, `transfer_all_to_player`),
  refactored `InventoryManager` to delegate to `ItemStacking` (removing duplicated logic), and made
  `Chest` hold an `InventoryComponent` for its contents.
- **M13-T5 (merchant)**: added a validated `data/merchants/merchants.json` table (stock + buy/sell
  multipliers, `merchant_` prefix), merchant-aware pricing/stock in `EconomyManager` (buy/sell take a
  `merchant` id), an optional `merchant` ref on the `buy_item`/`sell_item` dialogue actions, a real
  `npc_merchant_valdombra` with `dialogue_merchant_valdombra`, and placed the merchant in the Village
  (`scenes/npcs/Merchant.tscn` + `Village.tscn`). `DataRegistry` now validates merchants, the NPC
  `merchant` ref (required for role `merchant`), and the action `merchant` ref.
- **Tests**: extended `M13EconomyEquipmentRunner` with container-inventory transfer, merchant
  stock/pricing (in-stock buy, off-stock rejection, merchant-priced sell), and a merchant-NPC dialogue
  buy. Full `.\test.bat` passed (import + M9/M10/M10R/M11/M12/SR3/M13, exit 0) - no regressions.
- **Docs**: updated `DATA_SCHEMAS` (merchants schema + buy/sell `merchant` param + NPC merchant field),
  `SYSTEMS`, `ARCHITECTURE` (data files), `ROADMAP` (M13 complete), and the ai_memory tracker
  (M13-T4/T5/V1 to Done; M13 closed). **M13 is complete.**
- **Next**: M14 - combat, skills & magic (includes armor-based damage mitigation, deferred from M13).

---

## 2026-06-28 - Session 027 - M13 item/economy core

- **Goal**: build the M13 systems core (equipment, item use, economy/merchants) data-driven and
  headless-tested, before the remaining M13 content tasks.
- **Equipment (M13-T1)**: new `EquipmentManager` autoload brokers `GameState.player.equipment`
  (equip/unequip from inventory with slot swap) and derives effective combat stats on demand
  (weapon `damage`, armor `max_health`). `PlayerCombat` now reads
  `EquipmentManager.get_effective_stat(...)` for attack damage and max health, re-syncing on
  `equipment_changed` / `item_used`. Equipment persists through the existing save snapshot.
- **Item use (M13-T2)**: `InventoryManager.use_item` spends a consumable's `use_effect` (`heal`
  clamped to effective max health), refuses a wasted use at full health, and emits `item_used`.
- **Economy/merchants (M13-T3)**: new `EconomyManager` autoload derives buy/sell prices from item
  `value` (buy ×1.0 ceil, sell ×0.5 floor) and brokers gold-checked buy/sell. Dialogue actions
  `buy_item`/`sell_item` and the new `gold_at_least` condition let merchants be authored in JSON;
  added a `dialogue_m13_merchant_fixture` and an `item_leather_armor` test item.
- **Wiring**: registered the two autoloads (after InventoryManager, before the quest/dialogue
  managers), added `equipment_changed`/`item_used` signals, and extended `DataRegistry` validation
  for the new condition/actions.
- **Tests**: added `tests/headless/M13EconomyEquipmentRunner.{gd,tscn}` (equipment + derived stats +
  save/load, consumable use, direct buy/sell, and merchant-dialogue buy/sell), wired into `test.bat`.
  Full `.\test.bat` passed (import + M9/M10/M10R/M11/M12/SR3/M13, exit 0) - no regressions.
- **Docs**: updated `DATA_SCHEMAS`, `SYSTEMS`, `ARCHITECTURE` (autoloads), `ROADMAP` (M13 status),
  and the ai_memory tracker (M13-T1/T2/T3 to Done; M13-T4/T5 backlog).
- **Next**: M13-T4 container inventories and M13-T5 in-game merchant + data-authored stock, then M14.

---

## 2026-06-28 - Session 026 - Resolve SR3 narrative-hardening follow-ups

- **Goal**: implement the three SR3 follow-ups (F1/F2/F3) before M13 so narrative authoring runs on
  safe, expressive systems.
- **SR3-F1 (dialogue soft-lock guard)**: added `DialogueManager.advance()` and a default
  Continue/Leave button in `DialogueBox` so a node with no visible choices (authored empty or fully
  gated out) follows a node-level `next` or ends instead of soft-locking the paused tree. Node `next`
  is validated by `DataRegistry`.
- **SR3-F2 (multi-condition objectives)**: `QuestManager` now evaluates `advance_on` as a single
  condition, an array (AND), or an `any_of`/`all_of` object via `_advance_satisfied`/
  `_single_advance_met`; `talked_to` inside a set stays momentary (only at the talk moment).
  `DataRegistry._validate_advance_on` validates all forms.
- **SR3-F3 (state-reactive dialogue)**: dialogues accept `entry_rules` (first matching rule selects
  the opening node; `entry` is the guaranteed fallback); resolved in `DialogueManager._resolve_entry`
  and validated by `DataRegistry`.
- **Tests**: added `tests/headless/SR3NarrativeHardeningRunner.{gd,tscn}` covering the soft-lock
  guard, AND + any_of (item and kill paths) advancement with the momentary-talk rule, and reactive
  entry selection. Wired into `test.bat`. Full `.\test.bat` passed (Godot import + M9/M10/M10R/M11/
  M12/SR3, exit 0) — no regressions.
- **Docs**: updated `DATA_SCHEMAS.md`, `QUEST_DIALOGUE_AUTHORING.md`, `SYSTEMS.md`, the SR3 review
  (resolution note), and the ai_memory tracker (F1/F2/F3 moved to Done).
- **Next**: M13 - items, equipment, economy & merchants.

---

## 2026-06-28 - Session 025 - SR3 narrative scalability review

- **Goal**: run the SR3 gate — decide whether the M11/M12 narrative systems can support real story
  production before M13.
- **Method**: read the live narrative code (`QuestManager`, `DialogueManager`, `Conditions`,
  `FactionManager`, `NPC`, `QuestDebugUI`, `DialogueBox`) and the `DataRegistry` validation, not the
  docs, and graded findings with file:line evidence like SR1/SR2.
- **Deliverable**: `docs/reviews/SR3_NARRATIVE_SCALABILITY_REVIEW.md`. Verdict: **proceed to M13, no
  blocking rewrite.** Definitions are data-driven with strong ref validation; system separation
  holds; branching is a documented contract; debug + headless tooling is adequate.
- **Findings**: Medium-High SR3-F1 — a dialogue node with zero visible choices leaves the paused game
  with no exit (DialogueBox renders no fallback; validation doesn't require one) → near-term
  hardening. Medium SR3-F2 — quest stages advance on a single `advance_on` condition (no AND-array /
  OR). Medium SR3-F3 — dialogue node text/entry are static (no state-reactive greetings). Plus low
  notes (OR/range conditions, no distinct failed-quest state, constant reputation thresholds).
- **Decision**: review-only per SR precedent — no engine code changed. Promoted SR3-F1/F2/F3 to
  `TASKS.md` (F1 near-term, F2/F3 before M18). No `test.bat` run needed (docs-only change).
- **Next**: M13 - items, equipment, economy & merchants.

---

## 2026-06-28 - Session 024 - Verify and ship M12

- **Goal**: run the full Godot regression suite for M12, then commit/push the completed
  implementation and update the project docs.
- **Verification**: `.\test.bat` passed end-to-end — Godot headless import plus the M9, M10, M10R,
  M11, and M12 headless runners all reported OK (exit code 0). The M10R preview runner regenerated
  its review screenshot deterministically (no tracked-file diff).
- **Ship**: committed the full M12 change set (`FactionManager`, reputation actions/conditions, NPC
  role metadata, `ReputationTester` fixture, faction-aware `EnemyAI`, faction debug overlay, M12
  runner, doc updates) and pushed `master`.
- **Docs**: flipped M12 from "implemented, verification pending" to "complete and verified" across
  `HANDOFF`, `PROJECT_MEMORY`, `TASKS`, and `ROADMAP`; moved `M12-V1` to Done.
- **Next**: SR3 - Narrative scalability review.

---

## 2026-06-28 - Session 023 - Complete M12 faction reputation

- **Goal**: complete the full M12 NPC/factions/reputation milestone before moving to the next
  review gate.
- **Implementation**: added `FactionManager` as the data-backed broker for `GameState.factions`,
  default reputation, clamped reputation changes, friendly/hostile thresholds, and faction
  relationship checks. Dialogue actions now support `change_reputation` and `set_reputation`;
  conditions support `faction_reputation_at_least` and `faction_reputation_below`.
- **Authoring coverage**: NPC data now carries validated `role`, `services`, and `quests_offered`
  metadata. The in-game `Reputation Tester` NPC in the Village drives a reputation fixture that can
  produce trusted or hostile outcomes through JSON only.
- **Runtime effects**: enemy AI now respects faction reputation before chasing/attacking, old saves
  get missing faction defaults on load, and F10 Quest Debug shows faction reputation/friendly/
  hostile state.
- **Validation**: added `M12FactionReputationRunner` to test faction defaults, dialogue-driven
  reputation changes, quest gates/outcomes, save/load persistence, and hostility state. Static
  checks passed (`ConvertFrom-Json`, `git diff --check`, stale-doc scan). Full `.\test.bat` could
  not run because environment escalation hit the usage limit.
- **Milestone**: M12 implementation is complete; full Godot regression plus commit/push are still
  pending. Next milestone after that is SR3 - Narrative scalability review.

---

## 2026-06-28 - Session 022 - Complete M11 quest pipeline

- **Goal**: complete the entire M11 quest/dialogue production milestone, not just the next task.
- **M11-T3**: added `quest_m11_regression_fixture` and `dialogue_m11_regression_fixture`, a
  multi-stage branching quest that gives/removes potions, gates choices by stage/items/flags,
  completes through two outcome stages, and grants branch-specific rewards. `Branch Tester` now
  uses this richer in-game probe.
- **M11-T4**: added `QuestDebugUI` and `QuestDebugUI.tscn`, wired into `Main` and toggled by
  `quest_debug_toggle` / F10. It shows map, LV/XP/gold, active quest stage IDs/descriptions,
  completed quests, flags, and inventory for authoring verification.
- **Validation**: M9 input validation now checks `quest_debug_toggle`; the M11 runner verifies both
  final paths of the multi-stage regression fixture. `.\test.bat` passed.
- **Milestone**: M11 is complete. Next milestone is M12 - NPCs, factions & reputation.

---

## 2026-06-28 - Session 021 - Branching quest conventions

- **Goal**: complete M11-T2 by turning branching quest/dialogue design into an authoring contract
  and a verified minimal fixture.
- **Authoring contract**: added `docs/architecture/QUEST_DIALOGUE_AUTHORING.md` with stage-band
  conventions, quest-scoped outcome flag naming, dialogue-choice ordering, reward placement rules,
  and fixture naming rules.
- **Implementation**: added `flag_not_set` conditions and `set_quest_stage` dialogue actions.
  `QuestManager.set_stage()` can jump active quests to branch stages and immediately complete
  reward-bearing final stages.
- **Regression**: added `quest_m11_branch_fixture` and `dialogue_m11_branch_fixture`; the M11
  headless runner now verifies two alternate outcomes, branch flags, quest completion, and
  branch-specific rewards.
- **In-game probe**: added `npc_m11_branch_tester` / `BranchTester.tscn` to the Village so the
  branching fixture can be tried manually in game without attaching it to real story content.
- **Next**: M11-T3 - expand the small branching fixture into a fuller multi-stage quest/dialogue
  regression with item removals and persistent consequences.

---

## 2026-06-28 - Session 020 - Production dialogue actions

- **Goal**: complete M11-T1 so real questlines can use validated dialogue actions instead of
  one-off code paths.
- **Implementation**: expanded `DialogueManager` and `DataRegistry` to support `clear_flag`,
  `give_item`, `take_item`, and `give_reward` alongside the existing quest/flag actions.
  `QuestManager.grant_rewards()` is now the shared reward application path for quest completion
  and dialogue reward actions.
- **Regression**: added `dialogue_m11_action_fixture` and `tests/headless/M11DialogueActionsRunner`
  to verify data validation, item add/remove, reward XP/gold/item grants, flag cleanup, and dialogue
  unpause behavior. `test.bat` now runs the M11 dialogue action regression after M9/M10/M10R.
- **Next**: M11-T2 - branching quest authoring conventions.

---

## 2026-06-27 - Session 019 - Governed map asset candidates

- **Goal**: create serious Image Gen test assets before the next milestone and place them into the
  current test maps without breaking the scalable asset rules.
- **Assets generated**: new village grass and cave floor terrain tiles; multi-tile oak tree,
  village cottage, cave stalagmite barricade, and mossy boulder object sprites. Chroma-key sources
  were preserved under `assets/source/image_gen/`; processed assets live under
  `assets/{tilesets,sprites}/generated/`.
- **Integration**: rebuilt `m10r_dev_tileset.png` as a 5-column terrain atlas, expanded
  `generated_assets.json` metadata with `world_size`, bottom-center pivots, and footprints, added
  `GeneratedPropSprite.gd`, and placed generated candidates in Village/Forest/Cave. Placeholder
  map floors can now draw generated terrain while collision remains unchanged.
- **Follow-up fix**: generated props now create `StaticBody2D` footprint collisions from
  `footprint_tiles`; old placeholder wall visuals are hidden; the old internal Village rectangle
  obstacle blocks were removed from collision/visuals.
- **Second review fix**: replaced the cottage candidate with a cleaner top-down cottage and reduced
  its world render size; trees now use trunk-only collision via `collision_size`/`collision_offset`
  and a foreground `visual_z_index` so the canopy can remain in front while the player passes
  underneath.
- **Approval**: user approved the corrected visual/collision direction. All generated asset entries
  are now marked `approved: true`; M10R is complete.
- **SR2**: completed `docs/reviews/SR2_MAP_SCALABILITY_REVIEW.md`. Verdict: map architecture can
  proceed to M11 with no blocking fixes; keep real map production on the data-authored/governed
  asset path.
- **Next**: M11-T1 - production dialogue actions (`give_item`, `take_item`, reward/flag flows).
- **Review state**: generated assets were approved by the user after the visual/collision fixes and
  are marked `approved: true`.
- **Validation**: `.\test.bat` passed once after the asset integration and M10R preview runner
  update. A later experimental map-preview runner hung in headless and was removed from
  `test.bat`; its untracked local files were not included in the intended change set.

---

## 2026-06-26 - Session 018 - Remove failed M10 probe files

- **Goal**: remove the failed old asset/map files from active content before generating governed
  replacements.
- **Files removed**: `assets/tilesets/proxy_dark_fantasy_atlas.png`,
  `assets/tilesets/proxy_dark_fantasy_atlas.png.import`, `scenes/maps/ProbeRuins.tscn`.
- **Files modified**: `data/maps/maps.json`, `data/assets/asset_sets.json`,
  `data/world/world_objects.json`, `scenes/maps/Forest.tscn`,
  `tests/headless/M10WorldAuthoringRunner.gd`, docs/memory/schema files.
- **Result**: `map_probe_ruins`, `asset_proxy_dark_fantasy`, and `world_object_proxy_*` are no
  longer active. Forest is back to Village/Cave connectivity only. The M10 runner now verifies the
  failed probe is inactive and smoke-tests chest/door/switch persistence.
- **Next**: M10R-T6 - generate the first governed Image Gen asset set.

---

## 2026-06-26 - Session 017 - Image Gen asset rules

- **Goal**: keep Image Gen as the real asset source while preventing another generated-atlas failure.
- **User decision**: Image Gen remains the asset source; the fix is to create strict generation
  rules and generate assets one by one when needed.
- **Files created**: `docs/architecture/IMAGE_GEN_ASSET_RULES.md`.
- **Files modified**: `docs/architecture/{ROADMAP,ARCHITECTURE}.md`,
  `docs/reviews/M10_ASSET_PIPELINE_FAILURE.md`,
  `docs/ai_memory/{PROJECT_MEMORY,HANDOFF,TASKS,DECISIONS,SESSION_LOG}.md`.
- **Rules added**: no direct generated atlases/maps for gameplay; generate atomic terrain tiles,
  transition tiles, object sprites, and actor sprites; keep originals; process and pack assets with
  tooling; require metadata and approved in-Godot screenshots.
- **Next**: M10R-T6 - generate the first governed Image Gen asset set: at least 3 seamless terrain
  tiles and 2 transparent object sprites, then produce an approved Godot screenshot.

---

## 2026-06-25 - Session 016 - M10 visual asset probe failure

- **Goal**: respond to the failed M10 in-game screenshot and prevent the project from continuing on
  a broken asset-pipeline assumption.
- **Finding**: the M10 code path works mechanically, but the generated Imagen atlas is not a serious
  tileset. It is a framed collage sliced into cells, with non-tileable terrain, inconsistent prop
  scale, visible gutters, and placeholder object overlays.
- **Files created**: `docs/reviews/M10_ASSET_PIPELINE_FAILURE.md`.
- **Files modified**: `docs/architecture/ROADMAP.md`,
  `docs/ai_memory/{PROJECT_MEMORY,HANDOFF,TASKS,SESSION_LOG}.md`.
- **Decision**: insert **M10R - Asset-pipeline remediation gate** before SR2/M11. Do not proceed to
  broader map/narrative scaling until a real tile-source strategy and screenshot approval gate are
  in place.
- **Next**: M10R-T1/T2 - choose the asset source strategy and replace or quarantine the failed
  generated atlas.

---

## 2026-06-25 - Session 015 - Milestone 10: world authoring pipeline

- **Goal**: implement M10 and turn the asset-proxy decision into a real, validated map-authoring
  pipeline.
- **Files created**: `assets/tilesets/proxy_dark_fantasy_atlas.png`,
  `data/assets/asset_sets.json`, `data/world/world_objects.json`,
  `scripts/world/{AuthoredMap,Chest,Door,Switch}.gd`, `scenes/world/{Chest,Door,Switch}.tscn`,
  `scenes/maps/ProbeRuins.tscn`, `tests/headless/M10WorldAuthoringRunner.{gd,tscn}`.
- **Files modified**: `data/maps/maps.json`, `scenes/maps/Forest.tscn`,
  `scenes/main/Main.gd`, `scripts/core/DataRegistry.gd`, `scripts/world/PersistentWorldObject.gd`,
  `test.bat`, and architecture/AI-memory docs.
- **Asset probe**: generated a serious dark-fantasy proxy atlas with Imagen, copied it into the
  repo, then normalized it to a strict 1024x1024 8x8 atlas after validation caught the generated
  image's non-technical 1254x1254 dimensions.
- **World authoring**: `map_probe_ruins` is now a data-authored sandbox map connected from Forest.
  `AuthoredMap` builds tile layers, collision cells, spawn points, transitions, and placed objects
  from `maps.json`.
- **World objects**: added reusable chest, door, and switch scenes/scripts. Their states persist as
  `opened`, `open`, and `on` in `GameState.world_objects`; switches can open target doors by
  `persistent_id`.
- **Validation**: `DataRegistry.validate_all()` now checks asset sets, atlas dimensions, tile IDs
  and collision metadata, world-object definitions, authored map dimensions/layers/spawns,
  transitions, placed pickups/enemies/chests/switches, loot refs, switch targets, and duplicate
  `persistent_id`s.
- **Tests**: `test.bat` now runs M9 plus M10. M10 verifies proxy atlas import, authored spawn/
  transition/object generation, chest loot persistence, and switch/door persistence across map
  reloads.
- **Checks run**: Godot headless import OK; final `.\test.bat` OK.
- **Final result**: **Milestone 10 COMPLETE and verified.**
- **Next**: SR2 - Map scalability review.

---

## 2026-06-25 - Session 014 - M10 asset-proxy roadmap refinement

- **Goal**: clarify whether M10 map authoring should test art/asset scalability before real maps.
- **Decision**: M10 should include a lightweight tileset/asset-proxy probe, not final art
  production. The probe validates tile size, collision metadata, map layers, props, naming/import
  conventions, and compatibility with future art.
- **Files modified**: `docs/architecture/ROADMAP.md`,
  `docs/ai_memory/{PROJECT_MEMORY,HANDOFF,TASKS,SESSION_LOG}.md`.
- **Rationale**: map authoring depends on asset constraints, so the pipeline must be tested early;
  real art direction and production assets still belong to M17/M18.
- **Next**: start M10 with map pipeline tasks including `M10-T5`.

---

## 2026-06-25 - Session 013 - Milestone 9: data & tooling hardening

- **Goal**: implement M9 data/tooling hardening from SR1: validators, persistent tests, input map
  cleanup, dynamic world-object persistence contract, and runtime guardrails.
- **Files created**: `tests/headless/M9RegressionRunner.gd`,
  `tests/headless/M9RegressionRunner.tscn`, `test.bat`.
- **Files modified**: `scripts/core/DataRegistry.gd`, `scripts/core/SceneLoader.gd`,
  `scripts/core/SaveManager.gd`, `scripts/world/PersistentWorldObject.gd`,
  `scripts/components/LootComponent.gd`, runtime managers/actors that use content IDs,
  `project.godot`, `data/{factions,maps}.json`, and docs/memory/schema files.
- **Design**: `DataRegistry.validate_all()` is now the preflight boundary for JSON shape, ID
  prefixes, cross-file references, quest/dialogue conditions, supported dialogue actions,
  map scenes/spawns/transitions, loot/reward refs, and duplicate `persistent_id`s. Runtime manager
  APIs now reject unknown IDs instead of creating invalid state.
- **Dynamic persistence**: runtime loot drops register active pickup entries in
  `GameState.world_objects` with `kind`, `map_id`, `item_id`, `count`, and `position`.
  `SceneLoader` respawns active dynamic pickups on map load; collecting them changes state to
  `collected`.
- **Input cleanup**: inventory, quest journal, primary attack, save, and load now read InputMap
  actions instead of raw keys/buttons.
- **Persistent tests**: M9 runner covers data validation, boot, map transitions, first quest flow,
  save/load, progression, and dynamic pickup persistence. `test.bat` runs Godot import and then the
  M9 runner.
- **Runtime fixes during verification**: fixed the runner's `persistent_id` lookup on nodes without
  that property, fixed `test.bat` path quoting by using `%~dp0.`, and updated the boot print to
  "Milestone 9".
- **Checks run**: JSON parse OK for all data files; static data reference check OK; persistent ID
  text scan OK (5 IDs); Godot headless import OK; direct M9 runner OK; final `.\test.bat` OK;
  `git diff --check` clean apart from normal CRLF warnings.
- **Final result**: **Milestone 9 COMPLETE and verified.**
- **Next**: Milestone 10 - World authoring pipeline.

---

## 2026-06-25 — Session 012 — SR1 core scalability review

- **Goal**: review the M0-M8 skeleton before M9 and decide whether the project remains scalable
  enough to proceed toward production pipelines.
- **Files created**: `docs/reviews/SR1_CORE_SCALABILITY_REVIEW.md`.
- **Files modified**: `docs/ai_memory/{PROJECT_MEMORY,HANDOFF,TASKS,SESSION_LOG}.md`.
- **Verdict**: no rewrite needed before M9. The system separation remains healthy: `GameState`
  remains the save boundary, `EventBus` routes cross-system notifications, content definitions are
  JSON-backed, actors remain component-based, and the test slice can remain a dev sandbox.
- **Findings promoted to M9**: data/reference validation, persistent headless regression tests,
  input-map cleanup, dynamic world-object persistence contract (especially dropped loot), and runtime
  guardrails against unknown content IDs. M10 keeps the follow-up to split dev sandbox/start content
  from production world authoring.
- **Next**: Milestone 9 — Data & tooling hardening.

---

## 2026-06-25 — Session 011 — Milestone 8: progression

- **Goal**: add XP, level, stat growth, quest/enemy XP rewards, and HUD progression feedback.
- **Files created**: `scripts/progression/ProgressionManager.gd`.
- **Files modified**: `project.godot` (+ProgressionManager autoload), `scripts/core/GameState.gd`
  (default `damage`), `scripts/core/SaveManager.gd` (normalize `damage`), `scripts/player/
  PlayerCombat.gd` (attack damage from player stats), `scripts/ui/HUD.gd` + `scenes/ui/HUD.tscn`
  (level/XP display), `scenes/main/Main.gd`, docs/memory/architecture files.
- **Design**: `ProgressionManager` listens to `EventBus.xp_gained` and `EventBus.actor_died`.
  Quest rewards already emit `xp_gained`; enemy deaths now grant `xp_reward` from `enemies.json`.
  Progression state lives in `GameState.player.stats` (`level`, `xp`, `max_health`, `health`,
  `damage`) so save/load stays simple.
- **Level rules (M8 baseline)**: level 1 starts at 0/50 XP; each next threshold adds 25 XP. Level-up
  grants +5 max health, refills health, +1 damage, and emits `player_level_up`.
- **Bug found/fixed**: initial level-up updated `GameState` but not the live player's
  `HealthComponent`, so `SaveManager.save_game()` synced the old 30 max HP back into the snapshot.
  Fixed by applying level-up health to the live player component.
- **Tests (Godot 4.3 headless)**: editor import OK; boot OK; temporary M8 scene verified direct XP,
  level-up event/stat growth, quest XP completion, enemy kill XP, kill count preservation, and
  save/load of progression stats. Temp scene and slot 98 removed afterward.
- **Final result**: **Milestone 8 COMPLETE and verified.**
- **Next**: SR1 — Core scalability review.

---

## 2026-06-25 — Session 010 — Production roadmap and scalability gates

- **Goal**: update the roadmap now that the prototype skeleton is substantial enough to plan the
  path toward the real game map and story.
- **Files modified**: `docs/architecture/ROADMAP.md`, `docs/ai_memory/{PROJECT_MEMORY,HANDOFF,
  TASKS,DECISIONS,SESSION_LOG}.md`.
- **Design**: roadmap now continues beyond M8 through M20 and includes mandatory scalability review
  gates SR1-SR5. The reviews protect the main objective: systems and authoring pipelines should make
  it simple to build the real world and story later, while current Village/Forest/Cave content stays
  removable test/dev sandbox content.
- **Roadmap shape**: M9 data/tooling hardening, M10 world authoring, M11 quest/dialogue production,
  M12 NPC/factions/reputation, M13 items/equipment/economy/merchants, M14 combat/skills/magic,
  M15 dungeons/encounters, M16 persistence/UX hardening, M17 art/audio pipeline, M18 first real
  region/story act, M19 world/story expansion, M20 alpha stabilization.
- **Next**: implement M8, then perform SR1 before M9.

---

## 2026-06-25 — Session 009 — Milestone 7: save/load

- **Goal**: implement minimal save/load and persistent world-object restore.
- **Files created**: `scripts/world/PersistentWorldObject.gd`.
- **Files modified**: `scripts/core/{SaveManager,SceneLoader,GameState}.gd`,
  `scripts/items/PickupItem.gd`, `scripts/enemies/EnemyAI.gd`, `scenes/maps/{Village,Cave}.tscn`,
  `scenes/main/Main.gd`, docs/memory files.
- **Design**: `SaveManager` serializes a normalized JSON snapshot to
  `user://saves/slot_N.json` and restores it back into `GameState`. Save syncs the live player
  position/health from the scene; load applies the snapshot, reloads the saved map through
  `SceneLoader.change_map(..., emit_event=false)`, then reapplies player position/health. Suppressing
  `map_changed` on load prevents quest stages from advancing simply because the saved map was
  reloaded.
- **Persistence**: pickups now share the `PersistentWorldObject` helper for `collected`; enemies
  have exported `persistent_id`s and mark `world_objects[persistent_id] = {"state": "dead"}` on
  death. Existing slimes: `enemy_village_slime_001`, `enemy_cave_slime_001`.
- **Controls**: F5 saves slot 0, F9 loads slot 0. Programmatic API:
  `SaveManager.save_game(slot)` / `SaveManager.load_game(slot)`.
- **Tests (Godot 4.3 headless)**: editor import OK; boot OK; temporary M7 scene saved slot 99,
  reset state, loaded it, and verified current map, player position/health/gold, inventory,
  quest stage 20, kill count, collected fragment, and dead slime removal. Temp scene and slot 99
  removed afterward.
- **Final result**: **Milestone 7 COMPLETE and verified.**
- **Next**: Milestone 8 — progression (XP/level/stat growth).

---

## 2026-06-25 — Session 008 — Documentation cleanup before M7

- **Goal**: remove stale milestone/status language from architecture docs before starting M7.
- **Files modified**: `docs/architecture/{ROADMAP,SYSTEMS,ARCHITECTURE}.md`,
  `docs/ai_memory/{PROJECT_MEMORY,HANDOFF,TASKS,SESSION_LOG}.md`.
- **Design**: `HANDOFF.md`, `TASKS.md`, and `SESSION_LOG.md` are the live progress sources.
  Architecture docs now stay focused on contracts, sequence, and implementation level rather than
  claiming a "current" milestone.
- **Result**: fixed the stale M0 summary in `PROJECT_MEMORY.md`, removed the old "M0 current /
  pending skeleton" language from `ROADMAP.md`, updated `SYSTEMS.md` to the actual M6/M7 state, and
  clarified that the `ARCHITECTURE.md` tree includes planned extension points.
- **Tests/checks**: documentation-only change; no Godot run required for this block. Pre-cleanup
  smoke test had already passed in Godot 4.3 headless with `[Valdombra] Boot OK - Milestone 6.`.
- **Next**: Milestone 7 — save/load.

---

## 2026-06-25 — Session 007 — Milestone 6: vertical slice

- **Goal**: three connected maps + data-driven map loading; the fragment quest completable
  end-to-end in-world.
- **Files created**: `scripts/world/{SpawnPoint,AreaTransition,PlaceholderMap}.gd`,
  `scenes/maps/{Forest,Cave}.tscn`.
- **Files modified**: `scripts/core/SceneLoader.gd` (real impl: `bind` + `change_map` + map_changed),
  `data/maps/maps.json` (3 maps), `scenes/maps/Village.tscn` (+spawns + ToForest transition),
  `scenes/main/Main.gd` (persistent player + SceneLoader-driven start map).
- **Design**: `WorldRoot` holds [current map] + [persistent player]; `SceneLoader` swaps only the
  map node and repositions the player at the requested `SpawnPoint`, then emits `map_changed`.
  `AreaTransition` = walk-on Area2D (builds its own collider + placeholder visual) that calls
  `change_map` **deferred** (body_entered runs during the physics flush; adding map Area2Ds mid-flush
  is illegal — "can't change monitoring state while flushing queries"). `PlaceholderMap` = bordered
  room base for Forest/Cave; Village keeps its bespoke script + adds spawn/transition nodes.
- **Tests (headless)**: village → (walk-on pad) → forest; forest → cave ⇒ `entered_area` advances
  quest to 10; fragment pickup ⇒ `has_item` to 20; return + talk to blacksmith ⇒ **completed**, gold
  20 + iron sword granted. stderr clean after the deferred fix. Screenshot of the cave
  (player / transition pad / slime / fragment).
- **Final result**: **Milestone 6 COMPLETE and verified — `quest_first_dungeon` is now fully
  playable in-world** across three maps.
- **Note for M7**: enemies don't yet carry a `persistent_id`, so a killed enemy would respawn on map
  reload; add that when implementing save persistence.
- **Next**: Milestone 7 — save/load.

---

## 2026-06-25 — Session 006 — Milestone 5: combat

- **Goal**: reusable combat components, a melee attack, an enemy that chases/damages, death + loot,
  the `killed_enemy` quest hook.
- **Files created**: `scripts/components/{HealthComponent,StatsComponent,LootComponent}.gd`,
  `scripts/combat/{Hitbox,Hurtbox}.gd`, `scripts/enemies/EnemyAI.gd`, `scripts/player/PlayerCombat.gd`,
  `scenes/enemies/{EnemyBase,Slime}.tscn`.
- **Files modified**: `data/enemies/enemies.json` (enemy_slime), `scenes/player/Player.tscn`
  (+HealthComponent, +AttackHitbox, +PlayerCombat), `scenes/maps/Village.tscn` (+Slime),
  `scenes/main/Main.gd` (print).
- **Design**: `HealthComponent` (take_damage/heal; emits `actor_damaged`/`actor_died`; `owner` =
  actor). `Hitbox.strike()` enables for 2 physics frames and damages overlapping `Hurtbox`es; teams
  via collision layers (player hurt = 8, enemy hurt = 16; player AttackHitbox masks 16). Enemy =
  CharacterBody2D + components + `EnemyAI` (chase in aggro range, touch damage on cooldown). On
  death: `GameState.kills[enemy_id]++` (so `killed_enemy` conditions work) + `LootComponent` drops
  PickupItems + fade/free. `PlayerCombat` owns the player's HealthComponent and syncs health into
  `GameState.player.stats.health` (HUD/save). Attack = left mouse (hardcoded; rebindable later).
  `DamageData` not introduced yet (amount + source suffice).
- **Tests (headless)**: 2 hits killed the slime (12 hp, 6 dmg); `kills["enemy_slime"]=1`;
  `killed_enemy` condition true; enemy touch damage reduced player 30 → 28 (HUD updated);
  LootComponent spawned a pickup deterministically. Screenshot: player + slime, HUD HP 28/30.
- **Note**: player death is an M5 placeholder (respawn at full HP); real game-over later.
- **Final result**: **Milestone 5 COMPLETE and verified.** Play: approach the green slime, left-click
  to attack.
- **Next**: Milestone 6 — vertical slice (Village/Forest/Cave + transitions; the fragment quest
  end-to-end via SceneLoader).

---

## 2026-06-25 — Session 005 — Milestone 4: inventory & items

- **Goal**: data-driven items, an inventory broker, world pickups, an inventory UI; the quest reads
  picked-up items.
- **Files created**: `scripts/inventory/InventoryManager.gd` (autoload), `scripts/items/PickupItem.gd`
  + `scenes/items/PickupItem.tscn`, `scripts/ui/InventoryUI.gd` + `scenes/ui/InventoryUI.tscn`.
- **Files modified**: `data/items/items.json` (health_potion, iron_sword, ancient_iron_fragment),
  `project.godot` (+InventoryManager autoload, before QuestManager), `scripts/quest/QuestManager.gd`
  (rewards now call `InventoryManager.add`; removed the temporary `_add_item`),
  `scripts/player/PlayerController.gd` (joins group "player"), `scenes/maps/Village.tscn` (2
  health-potion pickups), `scenes/main/Main.gd` (+InventoryUI).
- **Design**: the player's inventory stays in `GameState.player.inventory` (save-friendly);
  `InventoryManager` brokers it honoring stackable/max_stack. `PickupItem` = Area2D that
  auto-collects on player overlap, carries a `persistent_id`, and marks `GameState.world_objects`
  collected (M7 hook). Inventory UI toggles with **I**. Non-player inventories
  (containers/merchants) are deferred to an `InventoryComponent` when first needed (M5+).
- **Tests (headless)**: items load; stacking (3 potions = 1 slot, +sword = 2 slots); remove;
  auto-pickup on overlap (+1, node freed); `has_item` advanced the quest (forced stage 10 → 20).
  Screenshot: inventory shows Health Potion x3, Iron Sword x1, Ancient Iron Fragment x1, Gold 0.
- **Note**: Area2D `body_entered` needs a few physics frames; the first pickup test under-waited
  (fixed by awaiting more frames). Real walk-over works.
- **Final result**: **Milestone 4 COMPLETE and verified.** Play: walk over the yellow pickups in
  the village, press **I** to view the inventory.
- **Next**: Milestone 5 — combat (HealthComponent, Hitbox/Hurtbox, an enemy, damage/death, loot).

---

## 2026-06-25 — Session 004 — Milestone 3: quest system

- **Goal**: staged, data-driven quests; dialogue that starts/gates by quest state; a journal.
- **Files created**: `scripts/core/Conditions.gd` (shared predicate eval, preload-based),
  `scripts/quest/QuestManager.gd` (autoload), `scripts/ui/QuestJournalUI.gd` +
  `scenes/ui/QuestJournalUI.tscn`, `play.bat`.
- **Files modified**: `project.godot` (+QuestManager autoload), `scripts/core/GameState.gd`
  (+`kills`), `scripts/core/EventBus.gd` (+`npc_talked`), `scripts/dialogue/DialogueManager.gd`
  (filter choices by `conditions`; +`start_quest`/`advance_quest` actions; track `_visible_choices`),
  `scripts/npcs/NPC.gd` (emit `npc_talked`), `scenes/main/Main.gd` (+QuestJournal),
  `data/quests/quests.json` (quest_first_dungeon), `data/dialogues/dialogues.json` (quest-aware
  blacksmith).
- **Design**: `Conditions.gd` evaluates all condition types against GameState and is shared by
  BOTH quest stage advancement and dialogue choice gating. `QuestManager` is event-driven
  (item_added, actor_died, map_changed, npc_talked). `talked_to` advances **momentarily** (on the
  event) so a "return to X" stage isn't auto-satisfied by an earlier conversation; other conditions
  advance on state recheck. Rewards: xp via EventBus (stored from M8), gold + items into GameState.
  Quests/QuestData kept as **dicts** (consistent with dialogue) rather than separate model classes.
  Journal toggles with J (hardcoded key for now; overlay, no pause).
- **Tests (Godot 4.3, headless)**: import clean; full flow verified — dialogue gating
  ("Looking for work" → "Thanks again" after completion), `start_quest` at stage 0,
  `entered_area`→10, `has_item`→20, `talked_to`→complete, gold=20 + iron sword granted. Screenshot
  confirms the journal shows the active quest + current stage.
- **Final result**: **Milestone 3 COMPLETE and verified.** In-game: talk to the blacksmith, accept
  the quest, press **J** for the journal. (The quest can't finish in-world yet — needs the cave map
  at M6 + item pickup at M4; systems proven via events.)
- **Next**: Milestone 4 — inventory & items.

---

## 2026-06-25 — Session 003 — Milestone 2: interaction, NPC, dialogue

- **Goal**: data-driven interaction + NPC + dialogue. Walk to an NPC, press interact, read a
  branching dialogue defined in JSON.
- **Files created**: `scripts/components/InteractionComponent.gd`,
  `scripts/player/PlayerInteraction.gd`, `scripts/npcs/NPC.gd`,
  `scripts/dialogue/DialogueManager.gd`, `scripts/ui/DialogueBox.gd`, `scenes/npcs/NPCBase.tscn`,
  `scenes/npcs/Blacksmith.tscn`, `scenes/ui/DialogueBox.tscn`.
- **Files modified**: `scripts/core/DataRegistry.gd` (now actually loads all `data/*.json`),
  `scripts/core/EventBus.gd` (+`interaction_prompt_changed`), `project.godot` (+`DialogueManager`
  autoload), `scenes/player/Player.tscn` (+PlayerInteraction area), `scenes/maps/Village.tscn`
  (+Blacksmith instance), `scenes/main/Main.gd` (+DialogueBox), `scripts/ui/HUD.{gd,tscn}`
  (+interaction prompt), `data/npcs/npcs.json` + `data/dialogues/dialogues.json` (blacksmith +
  intro dialogue).
- **Design**: interaction is player-centric — NPCs carry an `InteractionComponent` (Area2D on
  collision layer 4, monitorable); the player's `PlayerInteraction` (Area2D, mask 4) tracks nearby
  ones and triggers the nearest on `interact`. `DialogueManager` runs a JSON node-graph, executes
  `actions` (set_flag now; quest/item later) and pauses the tree during dialogue (DialogueBox is
  `process_mode = ALWAYS` so its buttons work while paused). Choice `conditions` are parsed but not
  yet evaluated (M3).
- **Problem fixed (important)**: adding `class_name` scripts without an editor import left Godot's
  global class cache stale → "Could not find type InteractionComponent" at headless run. **Fix**:
  run `--headless --editor --quit` (or open the editor) to regenerate
  `.godot/global_script_class_cache.cfg` before headless game runs.
- **Tests (Godot 4.3)**: editor import exit 0 (no errors); dev run — DataRegistry returns the
  blacksmith; `DialogueManager.start` → active; choosing "Looking for work" set flag
  `met_blacksmith`; the final choice ended the dialogue and unpaused. Screenshot confirms the NPC +
  name label + the DialogueBox (speaker, wrapped text, all 3 choice buttons).
- **Final result**: **Milestone 2 COMPLETE and verified.** In-game: walk to the blacksmith, press
  E/Space, pick choices (feel-test with `run.bat` → F5).
- **Next**: Milestone 3 — quest system (staged quests, QuestManager, QuestJournalUI; blacksmith
  assigns a quest).

---

## 2026-06-25 — Session 002 — Milestone 1: player, camera, test map, HUD

- **Goal**: Make the game playable at a basic level — controllable top-down player on a test map,
  camera follow, collisions, minimal HUD. No NPC/quest/inventory.
- **Files created**: `scripts/player/PlayerController.gd`, `scenes/player/Player.tscn`,
  `scripts/world/Village.gd`, `scenes/maps/Village.tscn`, `scripts/ui/HUD.gd`,
  `scenes/ui/HUD.tscn`, `run.bat`.
- **Files modified**: `project.godot` (added `[input]`: move_up/down/left/right = WASD + arrows,
  interact = E + Space; Godot canonicalized it on open), `scenes/main/Main.{gd,tscn}` (Main now
  assembles map + player + HUD; boot label removed). Removed `.gitkeep` from the six now-populated
  dirs.
- **Decisions**: input map lives in `project.godot` (idiomatic, editor-visible). The M1 map
  geometry is declared once in `Village.gd` and reused for both visuals (`_draw`) and colliders
  (no external assets). Map instantiation is temporarily in `Main.gd` (moves into `SceneLoader` at
  M6). Player = `CharacterBody2D` (motion_mode Floating) + `move_and_slide`.
- **Problems**: none of substance (one transient tooling hiccup during screenshot capture; retried
  OK).
- **Tests run (Godot 4.3)**:
  - Input map: throwaway script confirmed all 5 actions registered (2 events each).
  - Headless run: exit 0, prints "[Valdombra] Boot OK - Milestone 1.", no script/scene errors.
  - Screenshot (windowed, via a temporary throwaway scene, then deleted): player centered (camera
    follows), ground + both obstacle blocks render, HUD shows "HP 30/30".
- **Final result**: **Milestone 1 COMPLETE and verified.** Movement/collision are best confirmed
  by feel (`run.bat` → F5), since headless has no key input.
- **Next**: Milestone 2 — interaction + NPC + DialogueBox + first data-driven dialogue.

---

## 2026-06-25 — Session 001 — Milestone 0: foundations, memory, skeleton & verification

- **Goal**: Bootstrap the project. Analyze the repo, propose a scalable structure, create the
  AI-memory + architecture docs, scaffold the Godot skeleton, and verify it in-engine. No
  gameplay code.
- **Repo analysis**: Empty clean slate. Only `.gitignore` tracked. No `project.godot`, no Godot
  files, no `docs/`. Branch: `master`.
- **Files created — documentation**:
  - `docs/ai_memory/{PROJECT_MEMORY,SESSION_LOG,DECISIONS,TASKS,HANDOFF}.md`
  - `docs/architecture/{ARCHITECTURE,DATA_SCHEMAS,SYSTEMS,ROADMAP}.md`
- **Files created — skeleton (after user approved: JSON data confirmed)**:
  - `project.godot` — 5 autoloads, `gl_compatibility`, 480x270 viewport, nearest texture filter.
  - `scripts/core/`: `EventBus.gd`, `GameState.gd`, `DataRegistry.gd`, `SceneLoader.gd`,
    `SaveManager.gd` (autoload stubs) + `IdUtils.gd` (static helpers).
  - `scenes/main/Main.tscn` + `Main.gd` — boot scene: `WorldRoot` + `UIRoot` + boot label.
  - `data/{items,quests,dialogues,npcs,enemies,factions,skills,maps}.json` — empty `{}`.
  - Full folder tree with `.gitkeep` in empty dirs.
- **Files modified**: `.gitignore` (replaced with Godot 4 rules).
- **Decisions taken**: D1–D10 in `DECISIONS.md`. User confirmed: JSON data, title "Valdombra",
  English docs, proceed with the skeleton, and (later) "download Godot yourself".
- **Problems encountered**: Godot was not installed on the machine. Downloaded **Godot 4.3
  Standard (win64)** to `%LOCALAPPDATA%\Programs\Godot` and validated with it.
- **Tests run**:
  - All 8 `data/*.json` parse OK.
  - Godot 4.3 headless **import/validate**: exit 0, no script/scene errors.
  - Godot 4.3 headless **run**: exit 0, prints "[Valdombra] Boot OK - Milestone 0 skeleton.".
  - Import did not modify any tracked files; `.godot/` cache is git-ignored.
- **Final result**: **Milestone 0 COMPLETE and verified in-engine (Godot 4.3).** Skeleton commit
  `302c53d` pushed to `origin/master`; verification doc updates committed on top.
- **Next**: Await the user's go-ahead, then begin **M1** (input map → player + test map + camera +
  minimal HUD).
