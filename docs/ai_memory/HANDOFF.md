# Valdombra — HANDOFF

> The first thing the next agent/dev should read. Keep it short and current.
> Update at the end of every work block.

---

## Project in one line
Valdombra: a from-scratch, **data-driven, component-based 2D top-down fantasy RPG** in
**Godot 4 + GDScript**, designed to scale.

## Current state
- **M10R asset-pipeline remediation and SR2 map scalability review are complete. M11 is active.**
  M0-M10, M10R, SR1, and SR2 are complete.
- **Full playable slice**: 3 connected maps (Village / Forest / Cave) joined by walk-on transitions.
  Talk to the Blacksmith -> accept `quest_first_dungeon` -> travel to the cave (quest advances on
  entering) -> kill/dodge the slime, grab the ancient iron fragment -> return and talk -> quest
  completes, you get gold + an iron sword. Journal (J), inventory (I), combat (left mouse) all work.
- **M10 failed probe removed from active content**: the bad `map_probe_ruins` map, failed proxy
  atlas, and proxy asset/world-object data are no longer active. The reusable code (`AuthoredMap`,
  chest/door/switch objects, validation) remains for M10R.
- Live autoloads: `EventBus`, `GameState`, `DataRegistry`, `InventoryManager`, `QuestManager`,
  `DialogueManager`, `SceneLoader`, `SaveManager`, `ProgressionManager`.
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
- Verified with Godot headless import and `.\test.bat` (runs M9 + M10 + M10R asset preview).
- On `master`, pushed.

## Last thing done
Completed M10R and SR2. Generated assets are approved, the base Image Gen rules now include
separate visual size / footprint / collision / layering metadata, and SR2 cleared the project to
start M11.

## Next thing to do
Start **M11-T1 - Production dialogue actions**: implement and validate dialogue actions needed by
real questlines (`give_item`, `take_item`, and reward/flag flows).

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
.\test.bat                                                   # M9 + M10 regression suites
```
Controls: move = WASD/arrows · talk = E/Space · journal = J · inventory = I · attack = left mouse ·
save = F5 · load = F9. Code reads input actions, not raw keycodes. HUD shows HP, level, and XP.
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
