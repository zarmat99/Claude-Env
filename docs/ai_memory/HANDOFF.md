# Valdombra — HANDOFF

> The first thing the next agent/dev should read. Keep it short and current.
> Update at the end of every work block.

---

## Project in one line
Valdombra: a from-scratch, **data-driven, component-based 2D top-down fantasy RPG** in
**Godot 4 + GDScript**, designed to scale.

## Current state
- **Milestone 0 — skeleton built; pending in-editor verification.**
- The Godot project exists: `project.godot` (5 autoloads), autoload **stubs**, a boot scene,
  empty `data/*.json`, full folder tree. Branch `master`.
- **No gameplay code yet** (only stubs). All `data/*.json` parse OK.

## Last thing done
Created the full documentation set, then (after user approval) scaffolded the Godot M0 skeleton:
`project.godot`, `scripts/core/*` autoload stubs + `IdUtils`, `scenes/main/Main.{tscn,gd}`,
empty `data/*.json`, folder tree, Godot `.gitignore`.

## Next thing to do
1. **M0-T3 (blocked here)**: open the project in **Godot 4** once. Confirm: no script/scene
   errors; 5 autoloads load; running shows the boot label "Valdombra - Milestone 0 skeleton" and
   prints "[Valdombra] Boot OK ..." to the console. **Record the godot binary path below.**
2. On the user's go-ahead, start **M1**: input map (M1-T0) → PlayerController + Player scene →
   camera follow → test map with collisions → minimal HUD. (See `TASKS.md`.)

## Important warnings
- ⚠️ `godot` is **not installed on this machine / not on PATH** — could not validate in-engine.
  GDScript & scenes were reviewed by hand; expect to fix minor editor nits on first open.
- ⚠️ Do **not** write gameplay code beyond the current milestone.
- ⚠️ Do **not** hardcode RPG content in scripts — everything goes in `res://data/*.json`.
- ⚠️ Keep autoload **stubs** minimal until their milestone.
- ⚠️ Assign a stable `persistent_id` to every persistent world object (PROJECT_MEMORY §10).
- ⚠️ Do not resurrect the wiped prototypes (Aethermoor / Grimward).

## Useful commands
```powershell
# After installing Godot 4, validate headlessly (adjust the path):
# & "C:\path\to\Godot_v4.x.exe" --path . --headless --quit
git status --short
git log --oneline -5
```
Godot binary path on this machine: **<unknown — fill in once installed>**

## Key files to read (in order)
1. `docs/ai_memory/PROJECT_MEMORY.md` — vision, rules, state, conventions, IDs.
2. `docs/ai_memory/HANDOFF.md` — this file.
3. `docs/architecture/ARCHITECTURE.md` — folders, layers, autoloads, scene/component model.
4. `docs/architecture/DATA_SCHEMAS.md` — JSON formats + save schema.
5. `docs/architecture/SYSTEMS.md` — per-system responsibilities + EventBus contract.
6. `docs/ai_memory/DECISIONS.md` — the "why". · `docs/ai_memory/TASKS.md` — what's next.

## Open problems / questions
- Godot binary path unknown (engine not installed here) → M0-T3 blocked.
- (Resolved) Data format = JSON (D3). Title = "Valdombra". Docs language = English.
