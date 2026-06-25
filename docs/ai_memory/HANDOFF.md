# Valdombra — HANDOFF

> The first thing the next agent/dev should read. Keep it short and current.
> Update at the end of every work block.

---

## Project in one line
Valdombra: a from-scratch, **data-driven, component-based 2D top-down fantasy RPG** in
**Godot 4 + GDScript**, designed to scale.

## Current state
- **Milestone 4 — COMPLETE and verified in Godot 4.3** (M0–M3 done before it).
- Playable loop: move (WASD/arrows) on a test map; talk to the **Blacksmith** (E/Space) → branching
  data-driven dialogue → accept **`quest_first_dungeon`** → **journal (J)** tracks it. Walk over
  **pickups** to collect items → **inventory (I)**. Quest stages advance via events; completion
  grants gold + an item.
- Live autoloads: `EventBus`, `GameState`, `DataRegistry`, `InventoryManager`, `QuestManager`,
  `DialogueManager`. Still stubs: `SceneLoader`, `SaveManager`.
- On `master`, pushed.

## Last thing done
Built Milestone 4: `items.json`, `InventoryManager` (player inventory broker + stacking),
`PickupItem` (Area2D auto-collect + persistent_id), `InventoryUI` (I); quest rewards now go through
InventoryManager. Verified headless (stacking, pickup, has_item→quest) + inventory screenshot.

## Next thing to do
Begin **Milestone 5 — Combat** (on user go-ahead): `HealthComponent` + `StatsComponent` →
`Hitbox`/`Hurtbox` + `DamageData` → an enemy (`EnemyBase`/`Slime` with `EnemyAI`) → damage + death
(emit `actor_died`, increment `GameState.kills` so `killed_enemy` quest conditions work) → basic
**loot** on death. This is the first non-player inventory, so introduce `InventoryComponent` /
`LootComponent`. See `TASKS.md` (M5-T1..T4), `DATA_SCHEMAS.md` (enemies), `SYSTEMS.md` (combat).

## Important warnings
- ⚠️ **Class cache**: after adding/renaming `class_name` scripts, run `--headless --editor --quit`
  once before a headless game run (regenerates `.godot/global_script_class_cache.cfg`), else
  "Could not find type X". Pure utils (e.g. `Conditions.gd`) use `preload` to avoid this.
- ⚠️ **Temp scenes**: after running + deleting a throwaway `_dev_shot.tscn`, also delete `.godot/`
  (re-import) so the editor doesn't error trying to restore that tab.
- ⚠️ **Physics timing in tests**: Area2D `body_entered` fires after a few physics frames — await
  several `get_tree().physics_frame` before asserting pickup/overlap results in headless tests.
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
Controls: move = WASD/arrows · talk = E/Space (Blacksmith) · journal = J · inventory = I.

## Screenshot trick (visual checks; delete the temp files + clear .godot after)
Throwaway `res://_dev_shot.tscn` (Node script loads `Main`, optionally drives state, then
`get_viewport().get_texture().get_image().save_png("user://shot.png")`, then `get_tree().quit()`),
run with the console exe (windowed), read the PNG from `%APPDATA%\Godot\app_userdata\Valdombra\`.
Then delete `_dev_shot.*` AND `.godot/` (re-import).

## Key files to read (in order)
1. `docs/ai_memory/PROJECT_MEMORY.md` · 2. this file · 3. `docs/architecture/ARCHITECTURE.md` ·
4. `docs/architecture/DATA_SCHEMAS.md` · 5. `docs/architecture/SYSTEMS.md` ·
6. `docs/ai_memory/DECISIONS.md` · `docs/ai_memory/TASKS.md`.

## Open problems / questions
- (none) — M4 done & verified. Data = JSON, title = "Valdombra", docs = English, Godot 4.3 set up.
