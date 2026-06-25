# SR1 — Core Scalability Review

Date: 2026-06-25  
Scope: M0-M8 skeleton after progression, before M9 data/tooling hardening.

## Verdict
The project is still structurally scalable. The main systems are separated well enough to keep:
`GameState` is the persistence boundary, cross-system notifications go through `EventBus`, content
definitions live in JSON, actors are component-based, and the test slice can remain a dev sandbox.

No rewrite is needed before M9. The main risk is not architecture shape; it is permissiveness. The
current code accepts missing IDs, unsupported actions, temporary tests, and hardcoded controls
because that was useful for the prototype. Those must be hardened before real map/story production.

## Findings

### High — Content/data references do not fail loudly enough
- **Evidence**: `DataRegistry._entry()` warns and returns `{}` for unknown IDs
  (`scripts/core/DataRegistry.gd:34-39`). `InventoryManager.add()` then accepts that empty item
  definition and still appends the requested `item_id` to the inventory
  (`scripts/inventory/InventoryManager.gd:10-25`).
- **Risk**: As content grows, typoed IDs can become valid-looking runtime state instead of failing
  at authoring time. This would make quest rewards, loot, inventory, NPC/dialogue references, and
  map references hard to debug.
- **Required follow-up**: M9 validator/preflight for all JSON IDs and cross-file references; runtime
  manager APIs should reject unknown content IDs instead of silently continuing.

### High — Regression tests are temporary, not part of the repo
- **Evidence**: M7/M8 were verified with throwaway headless scenes that were removed after passing.
  There is no persistent `tests/` or `dev_tests/` harness in the working tree.
- **Risk**: The project already has cross-system flows (dialogue → quest → inventory → map →
  save/load → progression). Without repeatable tests, later changes can break old milestones
  invisibly.
- **Required follow-up**: M9 should add a repeatable headless smoke/regression suite for boot, data
  validation, map transitions, quest completion, save/load, and progression.

### High — Dynamic spawned world objects are not persistable yet
- **Evidence**: `LootComponent.drop()` instantiates `PickupItem` nodes at runtime and assigns only
  `item_id`, `count`, and position (`scripts/components/LootComponent.gd:20-24`). `SaveManager`
  serializes only `GameState` fields and `world_objects`, not arbitrary live scene nodes
  (`scripts/core/SaveManager.gd:68-89`).
- **Risk**: Dropped loot can disappear across save/load if it has not been collected. This is fine
  for the prototype but not for real dungeons/economy.
- **Required follow-up**: M9 should define the persistence contract for dynamic world objects. Full
  economy/loot behavior can land later, but the save model must be explicit before content grows.

### Medium — User/debug controls remain hardcoded outside the input map
- **Evidence**: Inventory uses `KEY_I` (`scripts/ui/InventoryUI.gd:12-17`), journal uses `KEY_J`
  (`scripts/ui/QuestJournalUI.gd:13-18`), save/load use `KEY_F5`/`KEY_F9`
  (`scripts/core/SaveManager.gd:9-16`), and attack uses `MOUSE_BUTTON_LEFT`
  (`scripts/player/PlayerCombat.gd:19-21`).
- **Risk**: Input remapping and UI/UX hardening become scattered if more controls follow this
  pattern.
- **Required follow-up**: M9 should move current controls into `project.godot` input actions and
  update code to use action names.

### Medium — Dialogue action schema is broader than implementation
- **Evidence**: `_run_actions()` implements `set_flag`, `start_quest`, and `advance_quest`, then
  silently ignores everything else (`scripts/dialogue/DialogueManager.gd:73-83`). The schema already
  advertises actions such as `give_item` and `take_item`.
- **Risk**: A content author can write a dialogue action that appears valid but does nothing.
- **Required follow-up**: M9 validation should reject unsupported action types until M11 implements
  the full production dialogue/quest action set.

### Medium — Dev/test start content is still wired into boot
- **Evidence**: `Main.gd` hardcodes `START_MAP := "map_village"` and `START_SPAWN := "spawn_default"`
  (`scenes/main/Main.gd:12-24`).
- **Risk**: Removing or demoting the Village/Forest/Cave test slice requires code edits. That is
  acceptable now, but real production content should not depend on the dev sandbox.
- **Required follow-up**: M10 should introduce a world-authoring/start-location convention so dev
  sandbox and production start can diverge cleanly.

### Low — Save versioning exists but migration policy is minimal
- **Evidence**: `SaveManager` records `SAVE_VERSION` and rejects newer saves, but old-save migration
  is not yet a real policy (`scripts/core/SaveManager.gd:47-51`).
- **Risk**: This is acceptable before real saves ship, but production saves will need migration or
  clear incompatibility handling.
- **Required follow-up**: Track for M16 persistence/UX hardening, not a blocker for M9.

## SR1 Questions

- **Can test content be removed without breaking core systems?** Mostly yes for systems, but not
  cleanly yet because boot still points at `map_village`. This is an M10 concern.
- **Are quests/items/dialogues/enemies/maps still data-driven?** Definitions are data-driven; scene
  placement and start-map selection still need authoring conventions and validation.
- **Is save/load still a single `GameState` snapshot boundary?** Yes. The boundary is healthy, with
  the caveat that runtime-spawned objects need an explicit persistence contract.
- **Are hardcoded controls, IDs, scene paths, or placeholder assumptions contained?** They are
  contained enough to proceed, but M9 must reduce hardcoded input and validate data/scene references.

## Required Follow-Up

- **M9-T1**: data validators for JSON shape, content IDs, cross-file references, scene paths,
  map/spawn references, unsupported dialogue actions, and duplicate `persistent_id`s.
- **M9-T2**: persistent headless regression suite for boot, data validation, map transition,
  first quest flow, save/load, and progression.
- **M9-T3**: input-map cleanup for inventory, journal, attack, save, and load actions.
- **M9-T4**: dynamic world-object persistence contract, especially dropped loot.
- **M9-T5**: runtime guardrails so manager APIs reject unknown content IDs instead of creating
  invalid state.
- **M10 follow-up**: split dev sandbox start/content from production world authoring conventions.

## Decision
Proceed to M9. Do not add broader production content before M9 hardening is complete.
