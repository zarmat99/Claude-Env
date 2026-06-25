# Valdombra — HANDOFF

> The first thing the next agent/dev should read. Keep it short and current.
> Update at the end of every work block.

---

## Project in one line
Valdombra: a from-scratch, **data-driven, component-based 2D top-down fantasy RPG** in
**Godot 4 + GDScript**, designed to scale.

## Current state
- **Milestone 1 — COMPLETE and verified in Godot 4.3** (M0 complete before it).
- Playable basics: controllable top-down player, camera follow, a placeholder test map
  (`Village`) with wall/obstacle collisions, a minimal health HUD, and the `[input]` map.
- `Main` assembles map + player + HUD at boot (temporary; moves to `SceneLoader` at M6).
- Autoloads are still M0 stubs except where used. On `master`, pushed.

## Last thing done
Built Milestone 1 (input map, `PlayerController`, `Village` test map + colliders, `Camera2D`
follow, minimal `HUD`, `Main` wiring) and verified it (headless run clean + a screenshot).

## Next thing to do
Begin **Milestone 2** (on user go-ahead): `InteractionComponent` (+ `PlayerInteraction`) → NPC
base + a Blacksmith NPC → `DialogueBox` UI → `DialogueManager` running a first data-driven
dialogue from `data/dialogues/dialogues.json`. See `TASKS.md` (M2-T1..T4) and `DATA_SCHEMAS.md`
for the dialogue format.

## Important warnings
- ⚠️ Do not write gameplay code beyond the current milestone.
- ⚠️ Do not hardcode RPG content in scripts — content goes in `res://data/*.json`.
- ⚠️ Keep autoload stubs minimal until their milestone.
- ⚠️ Assign a stable `persistent_id` to every persistent world object (PROJECT_MEMORY §10).
- ⚠️ `Village.gd` map + `Main.gd` map-loading are temporary M1 scaffolding; the real, data-driven
  map system (TileMap + maps.json + SceneLoader) arrives at M6 — don't entrench shortcuts.

## Godot & useful commands
Godot **4.3 stable** (Standard, win64) installed at:
- Editor:  `%LOCALAPPDATA%\Programs\Godot\Godot_v4.3-stable_win64.exe`  (or double-click `run.bat`)
- Console (CLI/headless): `%LOCALAPPDATA%\Programs\Godot\Godot_v4.3-stable_win64_console.exe`
```powershell
$g = "$env:LOCALAPPDATA\Programs\Godot\Godot_v4.3-stable_win64_console.exe"
& $g --path "C:\Git\Claude-Env" -e                          # open in the editor
& $g --path "C:\Git\Claude-Env" --headless --quit-after 40  # run headless, see boot output
git status --short; git log --oneline -5
```
To play: `run.bat` (or open the editor) then press **F5**. Move = WASD/arrows.

## Key files to read (in order)
1. `docs/ai_memory/PROJECT_MEMORY.md` — vision, rules, state, conventions, IDs.
2. `docs/ai_memory/HANDOFF.md` — this file.
3. `docs/architecture/ARCHITECTURE.md` — folders, layers, autoloads, scene/component model.
4. `docs/architecture/DATA_SCHEMAS.md` — JSON formats + save schema.
5. `docs/architecture/SYSTEMS.md` — per-system responsibilities + EventBus contract.
6. `docs/ai_memory/DECISIONS.md` — the "why". · `docs/ai_memory/TASKS.md` — what's next.

## Open problems / questions
- (none) — M1 done & verified. Data = JSON, title = "Valdombra", docs = English, Godot 4.3 set up.
