# Valdombra — HANDOFF

> The first thing the next agent/dev should read. Keep it short and current.
> Update at the end of every work block.

---

## Project in one line
Valdombra: a from-scratch, **data-driven, component-based 2D top-down fantasy RPG** in
**Godot 4 + GDScript**, designed to scale.

## Current state
- **Milestone 3 — COMPLETE and verified in Godot 4.3** (M0–M2 done before it).
- Playable loop: top-down player + camera + test map + HUD; talk to the **Blacksmith** (E/Space)
  → branching data-driven dialogue → accept **`quest_first_dungeon`** → journal (**J**) tracks it.
  Quest stages advance via events; completion grants gold + an item.
- Live autoloads: `EventBus`, `GameState`, `DataRegistry`, `QuestManager`, `DialogueManager`.
  Still stubs: `SceneLoader`, `SaveManager`.
- On `master`, pushed.

## Last thing done
Built Milestone 3: `Conditions.gd` (shared predicate eval), `QuestManager` (staged, event-driven),
`QuestJournalUI` (J), dialogue choice-gating + `start_quest`/`advance_quest` actions, quest-aware
blacksmith dialogue + `quest_first_dungeon`. Verified the full flow headless + journal screenshot.

## Next thing to do
Begin **Milestone 4 — Inventory & items** (on user go-ahead): `ItemData` + `items.json` →
`InventoryManager` (+ `InventoryComponent`) → `PickupItem` (a collectible in the map) →
`InventoryUI`. Then the quest's `has_item` stage (the ancient iron fragment) becomes reachable by
actually picking the item up. See `TASKS.md` (M4-T1..T4) and `DATA_SCHEMAS.md` (item format).

## Important warnings
- ⚠️ **Class cache gotcha**: after adding/renaming `class_name` scripts, run `--headless --editor
  --quit` (or open the editor) once to regenerate `.godot/global_script_class_cache.cfg` before a
  headless game run, or you get "Could not find type X". (Pure utils like `Conditions.gd` avoid
  this by using `preload` instead of `class_name`.)
- ⚠️ **Temp scenes**: if you run a throwaway scene (e.g. `_dev_shot.tscn`) and then delete it, the
  editor may error on next open trying to restore that tab. Fix: delete `.godot/` (regenerates) and
  re-import. (Hit twice; documented.)
- ⚠️ Don't build beyond the current milestone; don't hardcode content (use `res://data/*.json`);
  keep `SceneLoader`/`SaveManager` stubs minimal until M6/M7.
- ⚠️ `Village.gd` map + `Main.gd` map-loading are temporary M1 scaffolding (real map system at M6).
- ⚠️ Assign a stable `persistent_id` to every persistent world object (PROJECT_MEMORY §10).

## Godot & useful commands
Godot **4.3 stable** (Standard, win64) at `%LOCALAPPDATA%\Programs\Godot\`.
- **Play**: double-click `play.bat` · **Editor**: `run.bat` · then F5 in the editor.
```powershell
$g = "$env:LOCALAPPDATA\Programs\Godot\Godot_v4.3-stable_win64_console.exe"
& $g --path "C:\Git\Claude-Env"                              # play (console shows print/errors)
& $g --path "C:\Git\Claude-Env" --headless --editor --quit   # import / regenerate class cache
& $g --path "C:\Git\Claude-Env" --headless --quit-after 40   # headless run, see boot output
```
Controls: move = WASD/arrows · talk = E/Space (near the Blacksmith) · journal = J.

## Screenshot trick (visual checks; delete the temp files + clear .godot after)
Throwaway `res://_dev_shot.tscn` (Node script loads `Main`, optionally drives state, then
`get_viewport().get_texture().get_image().save_png("user://shot.png")`, then `get_tree().quit()`),
run with the console exe (windowed), read the PNG from `%APPDATA%\Godot\app_userdata\Valdombra\`.
Then delete `_dev_shot.*` AND `.godot/` (re-import) so the editor doesn't keep a dangling tab.

## Key files to read (in order)
1. `docs/ai_memory/PROJECT_MEMORY.md` · 2. this file · 3. `docs/architecture/ARCHITECTURE.md` ·
4. `docs/architecture/DATA_SCHEMAS.md` · 5. `docs/architecture/SYSTEMS.md` ·
6. `docs/ai_memory/DECISIONS.md` · `docs/ai_memory/TASKS.md`.

## Open problems / questions
- (none) — M3 done & verified. Data = JSON, title = "Valdombra", docs = English, Godot 4.3 set up.
