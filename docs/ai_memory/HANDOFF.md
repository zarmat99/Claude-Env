# Valdombra — HANDOFF

> The first thing the next agent/dev should read. Keep it short and current.
> Update at the end of every work block.

---

## Project in one line
Valdombra: a from-scratch, **data-driven, component-based 2D top-down fantasy RPG** in
**Godot 4 + GDScript**, designed to scale.

## Current state
- **Milestone 5 — COMPLETE and verified in Godot 4.3** (M0–M4 done before it).
- Playable: move (WASD/arrows); talk to the **Blacksmith** (E/Space) → branching dialogue → accept
  **`quest_first_dungeon`** → **journal (J)**. Walk over **pickups** → **inventory (I)**.
  **Left-click** to melee the green **Slime**: it chases + touch-damages you (HUD HP drops), you kill
  it → it counts toward `killed_enemy` and drops loot.
- Live autoloads: `EventBus`, `GameState`, `DataRegistry`, `InventoryManager`, `QuestManager`,
  `DialogueManager`. Still stubs: `SceneLoader`, `SaveManager`.
- On `master`, pushed.

## Last thing done
Built Milestone 5 (combat): `HealthComponent`/`StatsComponent`, `Hitbox`/`Hurtbox`, `LootComponent`,
`EnemyAI` (Slime), `PlayerCombat` (melee + player health → GameState). Verified headless (kill, kills
counter, killed_enemy condition, touch damage, loot) + screenshot.

## Next thing to do
Begin **Milestone 6 — Vertical slice** (on user go-ahead):
- Build `Forest` + `Cave` maps (placeholder geometry like `Village.gd`), with `AreaTransition` +
  `SpawnPoint` nodes carrying `target_map_id` / `target_spawn_point_id`.
- Move map loading out of `Main.gd` into the data-driven `SceneLoader` (use `maps.json`); emit
  `EventBus.map_changed(map_id)` so `entered_area` quest stages fire.
- Put the **ancient iron fragment** pickup + a slime in the cave, and verify `quest_first_dungeon`
  end-to-end: blacksmith → cave (entered_area→10) → fragment (has_item→20) → return (talked_to→done).
- See `TASKS.md` (M6), `DATA_SCHEMAS.md` (maps/entrances), `SYSTEMS.md` (MapManager/SceneLoader).

## Important warnings
- ⚠️ **Class cache**: after adding/renaming `class_name` scripts, run `--headless --editor --quit`
  once before a headless game run (regenerates `.godot/global_script_class_cache.cfg`).
- ⚠️ **Temp scenes**: after running + deleting a throwaway `_dev_shot.tscn`, also delete `.godot/`
  (re-import) so the editor doesn't error restoring that tab.
- ⚠️ **Physics timing in tests**: Area2D detection (pickups, hitbox overlaps) needs a few
  `get_tree().physics_frame` awaits before asserting.
- ⚠️ **Collision layers**: 1 = world/bodies, 4 = interaction, 8 = player hurt, 16 = enemy hurt.
  Keep new combat/interaction areas on the right layer/mask.
- ⚠️ Don't build beyond the current milestone; don't hardcode content (use `res://data/*.json`);
  `SceneLoader`/`SaveManager` are still stubs (M6/M7).
- ⚠️ `Village.gd` map + `Main.gd` map-loading are temporary — M6 moves this into `SceneLoader`.
- ⚠️ Assign a stable `persistent_id` to every persistent world object (PROJECT_MEMORY §10).

## Godot & useful commands
Godot **4.3 stable** (Standard, win64) at `%LOCALAPPDATA%\Programs\Godot\`.
- **Play**: `play.bat` · **Editor**: `run.bat` → F5.
```powershell
$g = "$env:LOCALAPPDATA\Programs\Godot\Godot_v4.3-stable_win64_console.exe"
& $g --path "C:\Git\Claude-Env"                              # play (console shows print/errors)
& $g --path "C:\Git\Claude-Env" --headless --editor --quit   # import / regenerate class cache
& $g --path "C:\Git\Claude-Env" --headless --quit-after 40   # headless run, see boot output
```
Controls: move = WASD/arrows · talk = E/Space · journal = J · inventory = I · attack = left mouse.

## Screenshot trick (visual checks; delete temp files + clear .godot after)
Throwaway `res://_dev_shot.tscn` (Node loads `Main`, optionally drives state, then
`get_viewport().get_texture().get_image().save_png("user://shot.png")`, `get_tree().quit()`), run
with the console exe (windowed), read PNG from `%APPDATA%\Godot\app_userdata\Valdombra\`. Then delete
`_dev_shot.*` AND `.godot/` (re-import). For physics-dependent checks, await several physics frames.

## Key files to read (in order)
1. `docs/ai_memory/PROJECT_MEMORY.md` · 2. this file · 3. `docs/architecture/ARCHITECTURE.md` ·
4. `docs/architecture/DATA_SCHEMAS.md` · 5. `docs/architecture/SYSTEMS.md` ·
6. `docs/ai_memory/DECISIONS.md` · `docs/ai_memory/TASKS.md`.

## Open problems / questions
- (none) — M5 done & verified. Data = JSON, title = "Valdombra", docs = English, Godot 4.3 set up.
