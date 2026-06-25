# Valdombra — HANDOFF

> The first thing the next agent/dev should read. Keep it short and current.
> Update at the end of every work block.

---

## Project in one line
Valdombra: a from-scratch, **data-driven, component-based 2D top-down fantasy RPG** in
**Godot 4 + GDScript**, designed to scale.

## Current state
- **Milestone 2 — COMPLETE and verified in Godot 4.3** (M0, M1 done before it).
- Playable: top-down player + camera + test map (`Village`) with collisions + health HUD; walk to
  the **Blacksmith** NPC, press E/Space, and go through a **data-driven branching dialogue**
  (game pauses during dialogue; choices run actions like `set_flag`).
- Live autoloads: `EventBus`, `GameState`, `DataRegistry` (loads all `data/*.json`),
  `DialogueManager`. `SceneLoader` + `SaveManager` are still stubs.
- On `master`, pushed.

## Last thing done
Built Milestone 2: `InteractionComponent` + `PlayerInteraction`, data-driven `NPC` (+ `NPCBase`/
`Blacksmith` scenes), `DialogueManager` + `DialogueBox`, real `DataRegistry` JSON loading, and the
blacksmith intro dialogue. Verified (editor import clean, headless behavioral checks, screenshot).

## Next thing to do
Begin **Milestone 3 — Quest system** (on user go-ahead): `QuestData`/`QuestStage` + `quests.json`
→ `QuestManager` (staged, event-driven; also start evaluating dialogue choice `conditions`, which
are currently parsed but ignored) → `QuestJournalUI` → the Blacksmith assigns `quest_first_dungeon`
via a dialogue `start_quest` action. See `TASKS.md` (M3-T1..T4) and `DATA_SCHEMAS.md` (quest format).

## Important warnings
- ⚠️ **Class cache gotcha**: after adding/renaming `class_name` scripts, the first headless run can
  fail with "Could not find type X in the current scope" because Godot's global class cache is
  stale. **Fix**: run `--headless --editor --quit` (or open the editor) to regenerate
  `.godot/global_script_class_cache.cfg` before headless game runs. (Already learned in M2.)
- ⚠️ Do not write gameplay code beyond the current milestone; do not hardcode RPG content (use
  `res://data/*.json`); keep stub autoloads minimal until their milestone.
- ⚠️ `Village.gd` map + `Main.gd` map-loading are temporary M1 scaffolding; the data-driven map
  system (TileMap + maps.json + SceneLoader) arrives at M6.
- ⚠️ Assign a stable `persistent_id` to every persistent world object (PROJECT_MEMORY §10).

## Godot & useful commands
Godot **4.3 stable** (Standard, win64) at `%LOCALAPPDATA%\Programs\Godot\` (`run.bat` opens it).
```powershell
$g = "$env:LOCALAPPDATA\Programs\Godot\Godot_v4.3-stable_win64_console.exe"
& $g --path "C:\Git\Claude-Env" --headless --editor --quit   # import / regenerate class cache
& $g --path "C:\Git\Claude-Env" --headless --quit-after 40   # run headless, see boot output
& $g --path "C:\Git\Claude-Env" -e                           # open editor
```
To play: `run.bat` → **F5**. Move = WASD/arrows; talk = **E/Space** near the Blacksmith.

## Screenshot trick (used for visual checks; remove the temp files after)
Create a throwaway `res://_dev_shot.tscn` (a Node whose script loads `Main`, optionally drives
state, then `get_viewport().get_texture().get_image().save_png("user://shot.png")` and quits), run
it with the console exe (windowed), then read the PNG from
`%APPDATA%\Godot\app_userdata\Valdombra\`. Delete `_dev_shot.*` before committing.

## Key files to read (in order)
1. `docs/ai_memory/PROJECT_MEMORY.md` · 2. this file · 3. `docs/architecture/ARCHITECTURE.md` ·
4. `docs/architecture/DATA_SCHEMAS.md` · 5. `docs/architecture/SYSTEMS.md` ·
6. `docs/ai_memory/DECISIONS.md` · `docs/ai_memory/TASKS.md`.

## Open problems / questions
- (none) — M2 done & verified. Data = JSON, title = "Valdombra", docs = English, Godot 4.3 set up.
