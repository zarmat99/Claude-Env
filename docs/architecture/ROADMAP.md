# Valdombra — ROADMAP

Build systems before content. Each milestone leaves the project runnable. "Exit criteria" =
how we know the milestone is done. Detailed tasks live in `ai_memory/TASKS.md`.

Status note: this file is the milestone sequence and design intent, not the live tracker.
Current progress and next action live in `docs/ai_memory/HANDOFF.md`, `TASKS.md`, and
`SESSION_LOG.md`.

---

## M0 — Foundations & memory
- **Goal**: repo analysis, AI-memory + architecture docs, folder structure, Godot skeleton,
  autoload stubs. No gameplay.
- **Output**: `docs/ai_memory/*`, `docs/architecture/*`, `project.godot`, folder tree, autoload
  stubs (`EventBus`, `GameState`, `DataRegistry`, `SceneLoader`, `SaveManager`, `IdUtils`),
  empty `Main.tscn`.
- **Exit criteria**: project opens in Godot 4 with autoloads registered and no errors; docs
  complete.

## M1 — Player & test map
- **Goal**: controllable top-down player, camera follow, one test map with base collisions,
  minimal HUD.
- **Exit criteria**: player walks around the test map, collides with walls, camera follows, HUD
  shows health.

## M2 — Interaction & NPC
- **Goal**: `InteractionComponent`, NPC base + Blacksmith, key-press interaction, `DialogueBox`,
  first **data-driven** dialogue (no conditions required yet, but via DialogueManager).
- **Exit criteria**: walk to the blacksmith, press interact, read a JSON-defined dialogue.

## M3 — Quest system
- **Goal**: `QuestManager` with staged quests + abstract conditions, blacksmith assigns
  `quest_first_dungeon`, `QuestJournalUI`, stage advancement via EventBus.
- **Exit criteria**: talking to the blacksmith starts the quest; journal shows stage 0; an event
  advances the stage.

## M4 — Inventory & items
- **Goal**: `ItemData` + `items.json`, `InventoryManager`/`InventoryComponent`, `PickupItem`,
  collectible item; quest detects a required item (`has_item`).
- **Exit criteria**: pick up an item, it appears in inventory, a quest stage advances on having it.

## M5 — Combat
- **Goal**: `HealthComponent`, `Hitbox`/`Hurtbox`, `DamageData`, a simple enemy (Slime/Cave Rat)
  with `EnemyAI`, damage + death, basic loot on death.
- **Exit criteria**: attack an enemy, it takes damage and dies, drops loot.

## M6 — Vertical slice
- **Goal**: Village / Forest / Cave maps with `AreaTransition` + `SpawnPoint`; the full
  "recover the ancient fragment" loop: blacksmith → cave → fragment (guarded by an enemy) →
  return → reward.
- **Exit criteria**: a player can complete the quest end-to-end across the three maps.

## M7 — Save/load (minimal)
- **Goal**: `SaveManager` serialize/restore: current map, player position, inventory, quest
  state, collected items / persistent world-object states by `persistent_id`.
- **Exit criteria**: save, quit, reload — player, map, inventory, quest progress, and an opened
  chest / dead enemy persist.

## M8 — Progression
- **Goal**: XP, level, base stats, XP rewards (quests/kills), simple stat growth on level-up.
- **Exit criteria**: killing enemies / completing quests grants XP; reaching a threshold levels
  up and increases a stat.

## Designed but NOT yet scheduled (do not build ahead)
Factions & reputation · economy & merchants · deeper equipment · crafting · magic/spells ·
skill tree · crime/bounty · NPC daily routines · procedural/semi-modular dungeons · audio ·
real art pass. Each will get its own milestone + ADR when picked up.
