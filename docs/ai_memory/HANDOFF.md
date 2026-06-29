# Valdombra — HANDOFF

> The first thing the next agent/dev should read. Keep it short and current.
> Update at the end of every work block.

---

## Project in one line
Valdombra: a from-scratch, **data-driven, component-based 2D top-down fantasy RPG** in
**Godot 4 + GDScript**, designed to scale.

## Current state
- **M15 (dungeons/encounters) is complete and verified** (`.\test.bat` green, exit 0): data-authored
  `map_trial_dungeon_01`, Cave transition/spawn, reusable `world_objects` definitions, keyed doors,
  switch-opened gates, boss encounter metadata, reward chest, boss/reward save-load persistence, and
  `M15DungeonEncounterRunner`.
- **M14 (combat/skills/magic) is complete and verified** (`.\test.bat` green, exit 0): typed
  damage rules (`DamageData`, `CombatSystem`), skill XP/state (`SkillManager`), player abilities
  (`PlayerAbilities` with `ability_1/2/3`), three enemy archetypes (`chaser`, `skirmisher`,
  `sentinel`), Cave placements, DataRegistry validation, and `M14CombatSkillsMagicRunner`.
- **Post-M14 crash fix complete**: `Hurtbox.receive_hit` accepts both `DamageData` and legacy raw
  numeric damage without a typed-cast crash; `M14CombatSkillsMagicRunner` covers this path.
- **Post-M14 enemy damage fix complete**: enemy contact attack range is now large enough to work
  with player/enemy body separation; `M14CombatSkillsMagicRunner` covers AI movement into damage.
- **M13 (items/equipment/economy/merchants) is complete and verified** (`.\test.bat` green, exit 0;
  committed/pushed): `EquipmentManager` (equip/unequip + derived combat stats),
  `InventoryManager.use_item` (consumables), `EconomyManager` (buy/sell + merchant stock/pricing), a
  reusable `InventoryComponent` (shared `ItemStacking`, used by `Chest`), and a data-authored village
  merchant (`merchants.json` + in-Village `npc_merchant_valdombra`). Covered by
  `M13EconomyEquipmentRunner`.
- **Post-M13 review fix complete**: `SaveManager` now preserves base `stats.max_health` when armor
  is equipped and restores the live player health component with equipment-derived effective max
  health. `M13EconomyEquipmentRunner` covers armor save/load (`base max 30`, leather armor effective
  max 40, current health 35).
- **Post-M13 inventory UX fix complete**: `InventoryUI` now has clickable `Equip`, `Use`, and
  equipped-slot unequip buttons. It remains a passive UI layer: equipment and consumables are still
  handled by `EquipmentManager` / `InventoryManager`. `M13EconomyEquipmentRunner` covers the UI
  button flow.
- M0-M15, M10R, SR1, SR2, and SR3 are complete. MV1 was started then explicitly interrupted by the
  user, who requested moving on to M14.
- **SR3 follow-ups are done** (shipped with the review cycle): SR3-F1 dialogue soft-lock guard
  (`DialogueManager.advance()` + Continue/Leave affordance + node-level `next`), SR3-F2
  multi-condition `advance_on` (array AND / `any_of` / `all_of`, with `talked_to` kept momentary),
  SR3-F3 `entry_rules` state-reactive opening node. All validated and covered by
  `tests/headless/SR3NarrativeHardeningRunner`.
- **Full playable slice**: 3 connected maps (Village / Forest / Cave) joined by walk-on transitions.
  Talk to the Blacksmith -> accept `quest_first_dungeon` -> travel to the cave (quest advances on
  entering) -> kill/dodge the slime, grab the ancient iron fragment -> return and talk -> quest
  completes, you get gold + an iron sword. Journal (J), inventory (I), combat (left mouse) all work.
- **M10 failed probe removed from active content**: the bad `map_probe_ruins` map, failed proxy
  atlas, and proxy asset/world-object data are no longer active. The reusable code (`AuthoredMap`,
  chest/door/switch objects, validation) remains for M10R.
- Live autoloads: `EventBus`, `GameState`, `DataRegistry`, `FactionManager`, `ProgressionManager`,
  `SceneLoader`, `SaveManager`, `InventoryManager`, `EquipmentManager`, `CombatSystem`,
  `SkillManager`, `EconomyManager`, `QuestManager`, `DialogueManager`.
- Save/load works via F5/F9 slot 0 and `SaveManager.save_game/load_game(slot)`. It restores current
  map, player position/stats/gold/inventory/equipment, quests, factions, flags, kills, and
  `world_objects`. Pickups stay collected, enemies stay dead, dynamic drops respawn while active,
  and M10 chest/door/switch state persists.
- Progression works: quest rewards and enemy kills grant XP; level-up increases max health and
  damage, refills health, emits `player_level_up`, and appears in the HUD.
- M9 added `DataRegistry.validate_all()`, runtime unknown-ID guardrails, input actions for journal/
  inventory/attack/save/load, dynamic pickup persistence, and persistent headless regression files
  under `tests/headless/`.
- M10 added `asset_sets.json`, `world_objects.json`, persistent chest/door/switch objects,
  authored-map validation, and `tests/headless/M10WorldAuthoringRunner`. The runner now verifies
  the failed probe is not active and smoke-tests the useful world-object library.
- M10R now has governed Image Gen terrain/object candidates: five terrain tiles and six object
  sprites total in `generated_assets.json`, including multi-tile tree/cottage/stalagmite/boulder
  props. Village/Forest/Cave render generated terrain/prop candidates for in-game review. Generated
  props create footprint collisions from metadata; placeholder wall visuals are hidden. The set is
  approved as the base asset-pipeline rule set.
- SR2 map scalability review passed in `docs/reviews/SR2_MAP_SCALABILITY_REVIEW.md`; no blocking
  fixes are required before narrative systems.
- M11-T1 production dialogue actions are implemented: `set_flag`, `clear_flag`, `start_quest`,
  `advance_quest`, `give_item`, `take_item`, and `give_reward` are runtime-supported and validated.
- M11-T2 branching conventions are implemented: use stage bands plus outcome flags, branch choices
  can call `set_quest_stage`, and `flag_not_set` is available for consequence gates. The contract is
  documented in `docs/architecture/QUEST_DIALOGUE_AUTHORING.md`.
- The M11 branch fixture is also reachable in game through the `Branch Tester` NPC placed in the
  Village near the starting area. It is a debug probe, not story content. M11-T3 upgraded that
  probe to a multi-stage regression fixture with item grants/removals, two final outcomes, branch
  rewards, and persistent consequence flags.
- M11-T4 added `QuestDebugUI`, toggled by `quest_debug_toggle` / F10. It shows map, LV/XP/gold,
  active quest stage IDs/descriptions, completed quests, flags, and inventory for authoring checks.
- M12 adds `FactionManager` and live faction reputation. Dialogue can call `change_reputation` and
  `set_reputation`; conditions can use `faction_reputation_at_least` and
  `faction_reputation_below`; `EnemyAI` checks faction hostility before chasing/attacking. NPC data
  now validates `role`, `services`, and `quests_offered`.
- The M12 Reputation Tester is reachable in game through the `Reputation Tester` NPC placed in the
  Village near the Branch Tester. It is a debug probe for trusted/hostile reputation outcomes, not
  story content.
- F10 Quest Debug now also shows faction reputation, hostile, and friendly state.
- Latest verification passed: Godot import/class cache, `M15DungeonEncounterRunner`, full
  `.\test.bat`, and `git diff --check` are green.
- On `master`, M15 and all earlier milestones/fixes are committed and pushed.

## Last thing done
Completed M15 dungeons/encounters: trial dungeon fixture, keyed door, switch gate, boss encounter,
reward chest, and save/load regression coverage.

## Next thing to do
Start **SR4 - systems stress review**: stress the architecture with quantity before production
region work.
- ⚠️ **Economy UX gaps for M16**: the HUD has no gold readout, the merchant gives no "can't afford"
  feedback, and starting gold is 0 (gold comes from quests/selling). The merchant now always shows
  its wares (Session 029). A real shop UI is M16.

## Important warnings
- ⚠️ **State source of truth in docs**: use `HANDOFF.md`, `TASKS.md`, and `SESSION_LOG.md` for live
  progress. Architecture docs are contracts/design notes and should not be treated as the live
  tracker.
- ⚠️ **Class cache**: after adding/renaming `class_name` scripts, run `--headless --editor --quit`
  once before a headless game run (regenerates `.godot/global_script_class_cache.cfg`).
- ⚠️ **Physics-flush**: don't change Area2D monitoring / add map Area2Ds from inside a physics
  callback (body_entered). Use `call_deferred` (AreaTransition does this when swapping maps).
- ⚠️ **Temp scenes**: after running + deleting a throwaway `_dev_shot.tscn`, also delete `.godot/`
  (re-import) so the editor doesn't error restoring that tab. Await several `physics_frame`s before
  asserting Area2D detection (pickups/transitions/hitboxes) in headless tests.
- ⚠️ **Collision layers**: 1 = world/bodies, 4 = interaction, 8 = player hurt, 16 = enemy hurt.
- ⚠️ **World layout**: `SceneLoader` keeps the player as a sibling of the current map under
  `WorldRoot` and moves it to last child (drawn on top). Maps are `PlaceholderMap` rooms (Forest/
  Cave) or the bespoke `Village.gd`. Keep SpawnPoints away from AreaTransition areas (avoid loops).
- ⚠️ Don't hardcode content (use `res://data/*.json`); don't build beyond the current milestone.
- ⚠️ Assign a stable `persistent_id` to every persistent world object (PROJECT_MEMORY §10).

## Godot & useful commands
Godot **4.3 stable** (Standard, win64) at `%LOCALAPPDATA%\Programs\Godot\`.
- **Play**: `play.bat` · **Editor**: `run.bat` → F5.
```powershell
$g = "$env:LOCALAPPDATA\Programs\Godot\Godot_v4.3-stable_win64_console.exe"
& $g --path "C:\Git\Claude-Env"                              # play (console shows print/errors)
& $g --path "C:\Git\Claude-Env" --headless --editor --quit   # import / regenerate class cache
& $g --path "C:\Git\Claude-Env" --headless --quit-after 40   # headless run, see boot output
.\test.bat                                                   # M9 + M10 + M10R + M11 + M12 + SR3 + M13 + M14 + M15 regression suites
```
Controls: move = WASD/arrows | talk = E/Space | journal = J | inventory = I | quest debug = F10 |
attack = left mouse | abilities = 1/2/3 | save = F5 | load = F9. Code reads input actions, not raw keycodes. HUD shows HP, level, and XP.
Maps connect via walk-on pads (the colored rectangles near map edges).

## Screenshot trick (visual checks; delete temp files + clear .godot after)
Throwaway `res://_dev_shot.tscn` (Node loads `Main`, optionally drives state — e.g.
`SceneLoader.change_map(...)`, `QuestManager.start_quest(...)` — then
`get_viewport().get_texture().get_image().save_png("user://shot.png")`, `get_tree().quit()`), run
with the console exe, read the PNG from `%APPDATA%\Godot\app_userdata\Valdombra\`. Then delete
`_dev_shot.*` AND `.godot/` (re-import).

## Key files to read (in order)
1. `docs/ai_memory/PROJECT_MEMORY.md` · 2. this file · 3. `docs/architecture/ARCHITECTURE.md` ·
4. `docs/architecture/DATA_SCHEMAS.md` · 5. `docs/architecture/SYSTEMS.md` ·
6. `docs/architecture/IMAGE_GEN_ASSET_RULES.md` · 7. `docs/ai_memory/DECISIONS.md` ·
`docs/ai_memory/TASKS.md`.

## Open problems / questions
- Known follow-ups: player death/game-over (placeholder), save UI/slots beyond debug keys, pre-M17
  approved data-authored map fixture using governed assets.
