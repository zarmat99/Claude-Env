# Valdombra — TASKS

> Task tracker. Each task: `ID · description · milestone · files · dependencies · status`.
> Move tasks between sections as state changes. IDs are stable.

Legend: status ∈ { backlog, in_progress, done, blocked }.

---

## In Progress
- (none — awaiting user go-ahead for Milestone 1)

## Backlog

### Milestone 1 — Player & test map
- **M1-T0 · Define input map** (move_up/down/left/right, interact) in `project.godot` ·
  files: project.godot · depends: M0-T2 · backlog.
- **M1-T1 · PlayerController (top-down movement)** · scripts/player/PlayerController.gd,
  scenes/player/Player.tscn · depends: M1-T0 · backlog.
- **M1-T2 · Camera follow** · Player.tscn · depends: M1-T1 · backlog.
- **M1-T3 · Test map + base collisions** · scenes/maps/Village.tscn · depends: M0-T2 · backlog.
- **M1-T4 · Minimal HUD** · scenes/ui/HUD.tscn, scripts/ui/HUD.gd · depends: M0-T2 · backlog.

### Milestone 2 — Interaction & NPC
- **M2-T1 · InteractionComponent** · scripts/components/InteractionComponent.gd · backlog.
- **M2-T2 · NPCBase + Blacksmith** · scenes/npcs/*, scripts/npcs/NPC.gd · backlog.
- **M2-T3 · DialogueBox UI** · scenes/ui/DialogueBox.tscn, scripts/ui/DialogueBox.gd · backlog.
- **M2-T4 · DialogueManager + first data-driven dialogue** · scripts/dialogue/*,
  data/dialogues/dialogues.json · backlog.

### Milestone 3 — Quest system
- **M3-T1 · QuestData/QuestStage models + quests.json** · backlog.
- **M3-T2 · QuestManager (staged, event-driven)** · backlog.
- **M3-T3 · QuestJournalUI** · backlog.
- **M3-T4 · Blacksmith assigns quest_first_dungeon** · backlog.

### Milestone 4 — Inventory & items
- **M4-T1 · ItemData + items.json** · backlog.
- **M4-T2 · InventoryManager / InventoryComponent** · backlog.
- **M4-T3 · PickupItem + collectible** · backlog.
- **M4-T4 · Quest detects required item** · backlog.

### Milestone 5 — Combat
- **M5-T1 · HealthComponent / StatsComponent** · backlog.
- **M5-T2 · Hitbox/Hurtbox + DamageData** · backlog.
- **M5-T3 · EnemyBase + Slime/EnemyAI** · backlog.
- **M5-T4 · LootComponent (basic loot on death)** · backlog.

### Milestone 6 — Vertical slice
- **M6-T1 · Village/Forest/Cave maps + AreaTransition/SpawnPoint** · backlog.
- **M6-T2 · "Recover the ancient fragment" quest end-to-end** · backlog.

### Milestone 7 — Save/load
- **M7-T1 · SaveManager full serialize/deserialize** · backlog.
- **M7-T2 · PersistentWorldObject apply-on-load** · backlog.

### Milestone 8 — Progression
- **M8-T1 · XP/level/stat growth + rewards** · backlog.

## Done
- **M0-T1 · Repo analysis + AI memory & architecture docs** · M0 · files: `docs/ai_memory/*`,
  `docs/architecture/*` · **done** (2026-06-25).
- **M0-T2 · Scaffold Godot skeleton** · M0 · files: `project.godot`, `scripts/core/*`,
  `scenes/main/Main.{tscn,gd}`, `data/*.json`, folder tree + `.gitkeep`, `.gitignore` ·
  **done** (2026-06-25).
- **M0-T3 · Verify project opens & runs in Godot 4** · M0 · depends: M0-T2 · **done**
  (2026-06-25): downloaded Godot 4.3 Standard; headless import exit 0 (no errors); headless run
  prints the boot message. Godot at
  `%LOCALAPPDATA%\Programs\Godot\Godot_v4.3-stable_win64.exe`.

## Blocked
- (none)
