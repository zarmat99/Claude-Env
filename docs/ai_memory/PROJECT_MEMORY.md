# RPG Skeleton - PROJECT MEMORY

## Purpose
This repository now contains a content-stripped, scalable 2D top-down RPG skeleton in Godot 4 + GDScript. The old prototype content was intentionally removed so future real maps, story, art, and game identity can be built cleanly on top of the systems.

## What Remains
- Data-driven loading and validation through `DataRegistry`.
- Runtime state boundary through `GameState`.
- Map loading through `SceneLoader`.
- Save/load, slots, autosave hooks, migration/rejection, and save metadata through `SaveManager`.
- Quest, dialogue, conditions, actions, factions, inventory, equipment, economy, combat, skills, settings, game-over, and UI shells.
- Generic scenes: `Player.tscn`, `EnemyBase.tscn`, `NPCBase.tscn`, `PickupItem.tscn`, `Chest.tscn`, `Door.tscn`, `Switch.tscn`, and UI scenes.
- One neutral boot map: `map_bootstrap` / `BootstrapMap.tscn`.
- Neutral fixture data only, using `fixture_*` IDs.
- One skeleton regression runner: `tests/headless/SkeletonRegressionRunner.tscn`.

## What Was Removed From Active Content
- Old map scenes and authored map content.
- Generated art assets, previews, source images, tilesets, and sprite outputs.
- Prototype NPC/enemy scenes.
- Old milestone test runners tied to prototype content.
- Historical review docs tied to the old content path.
- Active references to the old game name and old story/location IDs.

## Architecture Rules
1. Systems stay content-agnostic.
2. Content lives in JSON or scenes wired by JSON, not in managers.
3. Fixture data is for tests only and must stay neutral.
4. The bootstrap map exists only to keep the runtime testable.
5. Real content must be introduced deliberately through the new pipeline, with validation and visual review gates.
6. Do not reintroduce deleted prototype content except by reading git history for reference outside active files.

## Verification
`.	est.bat` passes. It runs Godot import/class-cache refresh plus `SkeletonRegressionRunner`, covering data validation, bootstrap map loading, inventory/equipment/economy, quest/dialogue/faction flow, combat/skills, save/load, and game-over resume.

## Next Step
Commit/push the clean skeleton if needed, then begin the new art/audio pipeline on this base.
