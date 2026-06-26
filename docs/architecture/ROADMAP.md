# Valdombra — ROADMAP

Build systems before content. Each milestone leaves the project runnable. "Exit criteria" =
how we know the milestone is done. Detailed tasks live in `ai_memory/TASKS.md`.

Status note: this file is the milestone sequence and design intent, not the live tracker.
Current progress and next action live in `docs/ai_memory/HANDOFF.md`, `TASKS.md`, and
`SESSION_LOG.md`.

---

## M0 — Foundations & memory
- **Goal**: repo analysis, AI-memory + architecture docs, folder structure, Godot skeleton,
  autoload stubs. No gameplay.
- **Output**: `docs/ai_memory/*`, `docs/architecture/*`, `project.godot`, folder tree, autoload
  stubs (`EventBus`, `GameState`, `DataRegistry`, `SceneLoader`, `SaveManager`, `IdUtils`),
  empty `Main.tscn`.
- **Exit criteria**: project opens in Godot 4 with autoloads registered and no errors; docs
  complete.

## M1 — Player & test map
- **Goal**: controllable top-down player, camera follow, one test map with base collisions,
  minimal HUD.
- **Exit criteria**: player walks around the test map, collides with walls, camera follows, HUD
  shows health.

## M2 — Interaction & NPC
- **Goal**: `InteractionComponent`, NPC base + Blacksmith, key-press interaction, `DialogueBox`,
  first **data-driven** dialogue (no conditions required yet, but via DialogueManager).
- **Exit criteria**: walk to the blacksmith, press interact, read a JSON-defined dialogue.

## M3 — Quest system
- **Goal**: `QuestManager` with staged quests + abstract conditions, blacksmith assigns
  `quest_first_dungeon`, `QuestJournalUI`, stage advancement via EventBus.
- **Exit criteria**: talking to the blacksmith starts the quest; journal shows stage 0; an event
  advances the stage.

## M4 — Inventory & items
- **Goal**: `ItemData` + `items.json`, `InventoryManager`/`InventoryComponent`, `PickupItem`,
  collectible item; quest detects a required item (`has_item`).
- **Exit criteria**: pick up an item, it appears in inventory, a quest stage advances on having it.

## M5 — Combat
- **Goal**: `HealthComponent`, `Hitbox`/`Hurtbox`, `DamageData`, a simple enemy (Slime/Cave Rat)
  with `EnemyAI`, damage + death, basic loot on death.
- **Exit criteria**: attack an enemy, it takes damage and dies, drops loot.

## M6 — Vertical slice
- **Goal**: Village / Forest / Cave maps with `AreaTransition` + `SpawnPoint`; the full
  "recover the ancient fragment" loop: blacksmith → cave → fragment (guarded by an enemy) →
  return → reward.
- **Exit criteria**: a player can complete the quest end-to-end across the three maps.

## M7 — Save/load (minimal)
- **Goal**: `SaveManager` serialize/restore: current map, player position, inventory, quest
  state, collected items / persistent world-object states by `persistent_id`.
- **Exit criteria**: save, quit, reload — player, map, inventory, quest progress, and an opened
  chest / dead enemy persist.

## M8 — Progression
- **Goal**: XP, level, base stats, XP rewards (quests/kills), simple stat growth on level-up.
- **Exit criteria**: killing enemies / completing quests grants XP; reaching a threshold levels
  up and increases a stat.

## SR1 — Core scalability review
- **Goal**: review the M0-M8 skeleton before adding broader production systems.
- **Questions**:
  - Can test content be removed without breaking core systems?
  - Are quests/items/dialogues/enemies/maps still data-driven?
  - Is save/load still a single `GameState` snapshot boundary?
  - Are hardcoded controls, IDs, scene paths, or placeholder assumptions contained?
- **Exit criteria**: documented findings, required fixes either completed or promoted into M9.

## M9 — Data & tooling hardening
- **Goal**: make content growth safe before real world/story production starts.
- **Scope**: JSON validators, missing-reference checks, duplicate content-ID checks,
  duplicate-`persistent_id` checks, repeatable headless smoke tests, input-map cleanup, debug/test
  helpers for common flows.
- **Exit criteria**: invalid data fails loudly; a developer can run one command/checklist to verify
  data integrity, boot, save/load, map transitions, and the first quest flow.

## M10 — World authoring pipeline
- **Goal**: make maps, transitions, world objects, and encounters scalable to many regions.
- **Scope**: richer map index, region conventions, world-object library, chests/doors/switches,
  encounter placement conventions, spawn/transition validation, dev sandbox separation from real
  content, and a lightweight tileset/asset-proxy scalability probe.
- **Exit criteria**: adding a new connected map with pickups/enemies/chests/doors requires
  data/scene authoring only, not changes to manager code; a small mock tileset/asset set proves
  tile size, collision metadata, layers, props, naming, and import conventions are compatible with
  the future art pipeline without committing to final art.
- **Post-M10 note**: systems/validation passed, but the generated Imagen atlas failed visual
  review as a serious map asset. It behaved like a collage sliced into cells, not a true tileset.
  The roadmap must pass M10R before SR2/M11.

## M10R — Asset-pipeline remediation gate
- **Goal**: fix the failed M10 visual asset probe before any more systems/content expansion.
- **Source decision**: Image Gen remains the primary real-asset source. The fix is procedural:
  generate atomic assets under strict rules, not complete atlases/maps.
- **Scope**: define and enforce Image Gen asset rules; stop treating generated atlas images as
  production tilesets; separate tileable floors/walls from object sprites; define scale, pivots,
  collision, import presets, and visual-review gates; replace or quarantine the failed proxy map.
- **Exit criteria**: one small map renders with coherent tileable art, no atlas-cell gutters, no
  oversized props, no placeholder object overlays, and an approved screenshot captured from Godot.
  M10R must use Image Gen through `docs/architecture/IMAGE_GEN_ASSET_RULES.md`.

## SR2 — Map scalability review
- **Goal**: prove that the world can grow without architectural drift.
- **Questions**:
  - Can five new maps be added without manager-code changes?
  - Are transitions, spawn points, and persistent objects validated?
  - Is placeholder/dev content isolated from production content?
- **Exit criteria**: blockers are fixed before narrative/content production expands.

## M11 — Quest & dialogue production pipeline
- **Goal**: make story and quest authoring robust enough for real questlines.
- **Scope**: complete dialogue actions (`give_item`, `take_item`, rewards, flags), branching quest
  support, failure/alternate outcomes, quest/debug tools, journal polish, authoring conventions.
- **Exit criteria**: a multi-stage branching questline with consequences can be authored primarily
  in JSON and verified by tests/debug tooling.

## M12 — NPCs, factions & reputation
- **Goal**: support meaningful NPC roles and faction-based world reactions.
- **Scope**: faction membership, reputation values, hostility/friendliness, dialogue/quest gates,
  basic NPC role metadata, foundations for later routines.
- **Exit criteria**: faction reputation can change through gameplay and affect dialogue, quest
  availability, and actor hostility without hardcoded special cases.

## SR3 — Narrative scalability review
- **Goal**: verify that narrative systems can support real story production.
- **Questions**:
  - Can ten NPCs, five branching quests, and two factions be added without core rewrites?
  - Are conditions/actions expressive enough for the first real story act?
  - Are quest/debug tools adequate for authoring and regression checks?
- **Exit criteria**: narrative blockers fixed before economy/equipment/dungeon complexity grows.

## M13 — Items, equipment, economy & merchants
- **Goal**: turn loot and inventory into a scalable RPG item/economy system.
- **Scope**: equipment slots/stats, merchants, containers, prices, sell/buy flow, robust loot tables,
  item use effects, basic balance conventions.
- **Exit criteria**: weapons/armor/consumables/materials/quest items can be authored in data and
  used by merchants, loot, rewards, inventory, and save/load.

## M14 — Combat, skills & magic
- **Goal**: expand combat from a simple test loop into a scalable ruleset.
- **Scope**: enemy archetypes, damage rules, combat abilities, skill growth hooks, magic/spell data,
  AI variants, tuning data.
- **Exit criteria**: at least three enemy archetypes and several player abilities/spells can be
  authored through data/components without bloating player/enemy scripts.

## M15 — Dungeons & encounters
- **Goal**: support authored dungeon gameplay and reusable encounter structure.
- **Scope**: dungeon map conventions, locked doors/keys/levers, chests, boss rooms, encounter data,
  reward rooms, optional semi-modular dungeon pieces.
- **Exit criteria**: one small dungeon can be built with persistent doors/chests/enemies, a boss or
  set-piece encounter, rewards, and save/load correctness.

## SR4 — Systems stress review
- **Goal**: stress the architecture with quantity before building lots of final content.
- **Stress dataset**: roughly 10 maps, 20 NPCs, 10 quests, 50 items, several factions, multiple
  merchants, several dungeons, and save/load in mid-flow.
- **Exit criteria**: performance, data validation, save/load, quest flow, and authoring ergonomics
  are acceptable or fixed before production region work.

## M16 — Persistence & UX hardening
- **Goal**: make core player-facing UX and persistence production-ready.
- **Scope**: save UI, multiple slots, autosave rules, save migrations, game over/respawn, settings,
  input remapping, pause/menu flow, error handling.
- **Exit criteria**: a normal player can save/load/manage settings without debug keys, and old save
  versions can be migrated or rejected clearly.

## M17 — Art/audio pipeline
- **Goal**: define how real assets enter the project without disrupting systems.
- **Scope**: art style guide, tileset/import conventions, animation conventions, audio hooks,
  placeholder replacement strategy, asset naming/organization.
- **Exit criteria**: a small playable area can use non-placeholder visuals/audio through documented
  pipelines while gameplay systems remain unchanged.

## M18 — First real region & story act
- **Goal**: build the first production-quality region and story act using the established pipelines.
- **Scope**: real map cluster, NPC cast, questline, dungeon/encounter, rewards, faction/economy
  touchpoints, art/audio pass at target quality for the slice.
- **Exit criteria**: the old Village/Forest/Cave test slice can be removed or demoted to a dev
  sandbox without breaking the real game.

## SR5 — Production readiness review
- **Goal**: decide whether the project is ready for broad world/story expansion.
- **Questions**:
  - Is adding content mostly authoring work rather than engine work?
  - Are validation and tests catching broken references/state?
  - Can the first real region be expanded without rewrites?
- **Exit criteria**: clear go/no-go for content production; required fixes are scheduled before M19.

## M19 — World & story expansion
- **Goal**: produce the full game content using the proven pipelines.
- **Scope**: additional regions, questlines, dungeons, NPCs, factions, items, encounters, audio/art
  expansion.
- **Exit criteria**: enough content exists for a feature-complete alpha path through the game.

## M20 — Alpha stabilization
- **Goal**: stabilize the feature-complete game.
- **Scope**: bug fixing, balance, performance, save compatibility, UX polish, packaging/export,
  content QA.
- **Exit criteria**: alpha build is playable end-to-end with known issues tracked and no major
  architectural blockers.
