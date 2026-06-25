# Valdombra — HANDOFF

> The first thing the next agent/dev should read. Keep it short and current.
> Update at the end of every work block.

---

## Project in one line
Valdombra: a from-scratch, **data-driven, component-based 2D top-down fantasy RPG** in
**Godot 4 + GDScript**, designed to scale.

## Current state
- **Milestone 9 — COMPLETE and verified in Godot 4.3.** M0-M8 and SR1 complete before it.
- **Full playable slice**: 3 connected maps (Village / Forest / Cave) joined by walk-on transitions.
  Talk to the Blacksmith → accept `quest_first_dungeon` → travel to the cave (quest advances on
  entering) → kill/dodge the slime, grab the ancient iron fragment → return and talk → quest
  completes, you get gold + an iron sword. Journal (J), inventory (I), combat (left mouse) all work.
- Live autoloads: `EventBus`, `GameState`, `DataRegistry`, `InventoryManager`, `QuestManager`,
  `DialogueManager`, `SceneLoader`, `SaveManager`, `ProgressionManager`.
- Save/load works via F5/F9 slot 0 and `SaveManager.save_game/load_game(slot)`. It restores current
  map, player position/stats/gold/inventory/equipment, quests, factions, flags, kills, and
  `world_objects`. Pickups stay collected, enemies with `persistent_id` stay dead, and M9 adds the
  contract for active dynamic pickup drops to respawn from `world_objects`.
- Progression works: quest rewards and enemy kills grant XP; level-up increases max health and
  damage, refills health, emits `player_level_up`, and appears in the HUD.
- M9 added `DataRegistry.validate_all()`, runtime unknown-ID guardrails, input actions for journal/
  inventory/attack/save/load, dynamic pickup persistence, and persistent headless regression files
  under `tests/headless/`.
- Verified with Godot headless import and `.\test.bat`.
- On `master`, pushed.

## Last thing done
Completed **Milestone 9 — Data & tooling hardening**:
data/schema/reference validation, persistent headless regression runner, input-map cleanup,
dynamic pickup persistence contract, and runtime guardrails for unknown content IDs.

## Next thing to do
Begin **Milestone 10 — World authoring pipeline**: map index/conventions, persistent world-object
library, expanded world validation, dev sandbox vs production start separation, and a lightweight
tileset/asset-proxy scalability probe. Use proxy/mock assets to test map constraints now; keep real
art direction and production assets for M17/M18.

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
.\test.bat                                                   # M9 regression suite
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
6. `docs/ai_memory/DECISIONS.md` · `docs/ai_memory/TASKS.md`.

## Open problems / questions
- Known follow-ups: player death/game-over (placeholder), save UI/slots beyond debug keys, M10 dev
  sandbox vs production start separation.
