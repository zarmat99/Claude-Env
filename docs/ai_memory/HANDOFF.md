# Valdombra — HANDOFF

> The first thing the next agent/dev should read. Keep it short and current.
> Update at the end of every work block.

---

## Project in one line
Valdombra: a from-scratch, **data-driven, component-based 2D top-down fantasy RPG** in
**Godot 4 + GDScript**, designed to scale.

## Current state
- **Milestone 0 — COMPLETE and verified in Godot 4.3.** Headless import exits 0 with no
  script/scene errors; running the project prints "[Valdombra] Boot OK - Milestone 0 skeleton.".
- Skeleton: `project.godot` (5 autoloads), autoload **stubs** + `IdUtils`, boot scene, empty
  `data/*.json`, full folder tree. On `master` (skeleton commit `302c53d`, pushed).
- **No gameplay code yet** (only stubs).

## Last thing done
Downloaded Godot 4.3 (Standard) and validated the project headlessly — import + run both clean.

## Next thing to do
Begin **Milestone 1** (on user go-ahead): M1-T0 input map (move_up/down/left/right, interact) →
M1-T1 PlayerController + Player scene → M1-T2 camera follow → M1-T3 test map + collisions →
M1-T4 minimal HUD. See `TASKS.md`.

## Important warnings
- ⚠️ Do not write gameplay code beyond the current milestone.
- ⚠️ Do not hardcode RPG content in scripts — everything goes in `res://data/*.json`.
- ⚠️ Keep autoload stubs minimal until their milestone.
- ⚠️ Assign a stable `persistent_id` to every persistent world object (PROJECT_MEMORY §10).
- ⚠️ Do not resurrect the wiped prototypes (Aethermoor / Grimward).

## Godot & useful commands
Godot **4.3 stable** (Standard / GDScript, win64) is installed at:
- Editor:  `%LOCALAPPDATA%\Programs\Godot\Godot_v4.3-stable_win64.exe`
- Console (CLI/headless, captures stdout): `%LOCALAPPDATA%\Programs\Godot\Godot_v4.3-stable_win64_console.exe`
```powershell
$g = "$env:LOCALAPPDATA\Programs\Godot\Godot_v4.3-stable_win64_console.exe"
& $g --path "C:\Git\Claude-Env" -e                          # open in the editor
& $g --path "C:\Git\Claude-Env" --headless --editor --quit  # validate (import) headlessly
& $g --path "C:\Git\Claude-Env" --headless --quit-after 30  # run headless, see boot output
git status --short; git log --oneline -5
```

## Key files to read (in order)
1. `docs/ai_memory/PROJECT_MEMORY.md` — vision, rules, state, conventions, IDs.
2. `docs/ai_memory/HANDOFF.md` — this file.
3. `docs/architecture/ARCHITECTURE.md` — folders, layers, autoloads, scene/component model.
4. `docs/architecture/DATA_SCHEMAS.md` — JSON formats + save schema.
5. `docs/architecture/SYSTEMS.md` — per-system responsibilities + EventBus contract.
6. `docs/ai_memory/DECISIONS.md` — the "why". · `docs/ai_memory/TASKS.md` — what's next.

## Open problems / questions
- (none) — M0 done & verified. Data = JSON (D3), title = "Valdombra", docs = English,
  Godot 4.3 installed.
