# RPG Skeleton - HANDOFF

> Read this first. This repo is now a content-stripped, scalable 2D RPG skeleton.

## Current State
- The old prototype content has been removed from the active workspace: production-like maps, generated assets, prototype NPC scenes, prototype enemy scenes, historical milestone runners, and review reports are gone from the current tree.
- The project boots into one neutral technical map: `map_bootstrap` via `scenes/maps/BootstrapMap.tscn`.
- Active data is fixture-only and uses neutral IDs (`item_fixture_*`, `quest_fixture_*`, `npc_fixture_*`, `enemy_fixture_*`, `faction_fixture_*`, `merchant_fixture_*`). These are not game content; they are contracts for the systems.
- The scalable skeleton remains: DataRegistry, GameState, SceneLoader, SaveManager, QuestManager, DialogueManager, InventoryManager, EquipmentManager, EconomyManager, CombatSystem, SkillManager, FactionManager, SettingsManager, GameOverManager, UI shells, world-object components, and player/enemy/NPC base scenes.
- `test.bat` now runs Godot import plus `tests/headless/SkeletonRegressionRunner.tscn`.
- Latest verification: `.	est.bat` passes, and the log is clean.

## Next Thing To Do
Commit/push the purge if this work block has not been committed yet. Then start the new art/audio pipeline on top of this clean skeleton.

## Rules From This Point
- Do not restore the old prototype maps, names, assets, quests, NPCs, or milestone fixtures into active content.
- New real content must be created through the data-driven contracts, not hardcoded in systems.
- Keep fixture data neutral and minimal. If a test needs content, use `fixture_*` IDs or an in-memory fixture.
- Image generation remains allowed for future real assets, but the active `assets/` directory is currently removed. Any new art must pass the governed asset workflow before becoming active.
- The bootstrap map is technical infrastructure, not game content.

## Useful Commands
```powershell
.\test.bat
.\play.bat
.\run.bat
```

Controls still use input actions: move, interact, inventory, journal, quest debug, attack, abilities, save/load, pause.
