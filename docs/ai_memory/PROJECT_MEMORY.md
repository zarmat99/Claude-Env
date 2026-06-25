# Valdombra — PROJECT MEMORY

> Master context file. Any AI agent or human developer **MUST read this and `HANDOFF.md`
> before making changes**, and **MUST update** `PROJECT_MEMORY.md`, `SESSION_LOG.md`,
> `TASKS.md`, `HANDOFF.md` at the end of every work block. The real memory lives in these
> files, **not** in chat history.

---

## 1. Vision
A 2D top-down fantasy RPG with a medieval / dark-fantasy atmosphere. It borrows only the
**systemic feeling** of large open RPGs — free exploration, role-bearing NPCs, branching
quests, dungeons, loot, character growth, and a world that remembers what the player did.

It is **not** a clone of any existing game. No protected names, assets, lore, characters, or
proprietary mechanics are used. Start small (a 3-map vertical slice) but build a technical
skeleton that scales to a large, content-rich RPG **without rewrites**.

## 2. Genre / Pillars
- 2D top-down, action-light RPG.
- Pillars: free exploration · meaningful NPCs · staged & (later) branching quests · dungeons ·
  loot · character progression · **persistent world state**.

## 3. Stack
- Engine: **Godot 4.x**, GDScript.
- Rendering: **2D, top-down**.
- Data: **data-driven via JSON** under `res://data/` (loaded by `DataRegistry`).
- Graphics: **simple placeholders only** in early phases (ColorRects / simple shapes / tiny
  generated textures). No heavy external assets yet.
- Persistence: JSON save file under `user://`.

## 4. Architectural rules (hard constraints)
1. **Data-driven**: quests, dialogues, items, NPCs, enemies, factions, loot, skills, maps are
   defined in `res://data/**.json` with stable IDs — never hardcoded in scripts.
2. **Separation of systems**: no god-objects. The player does **not** contain quest/dialogue/
   inventory/save/combat logic directly.
3. **Component-based actors**: reusable Node components (Health, Stats, Inventory, Interaction,
   Equipment, Faction, Loot) attached to Player / NPC / Enemy.
4. **EventBus**: global cross-system notifications go through a signal bus (loose coupling).
5. **GameState**: single source of truth for runtime state (current map, player, quests,
   inventory, gold, flags, persistent world state).
6. **SaveManager skeleton from the start** (full serialization can come later).
7. **Quests are staged** with abstract conditions.
8. **Dialogue supports conditions** (even if first dialogue is simple).
9. **World = connected maps** (separate scenes + transitions), not one giant open world.
10. **Modular UI** (HUD / DialogueBox / InventoryUI / QuestJournalUI as separate scenes).
11. **Scalability before content**: a few clean data-driven systems beat many hardcoded ones.

## 5. Current state
- **Milestone 5 — COMPLETE and verified in Godot 4.3.** (M0–M4 complete before it.)
- Combat: reusable `HealthComponent`/`StatsComponent`, `Hitbox`/`Hurtbox`, a melee attack
  (left mouse), and an enemy `Slime` that chases and deals touch damage. Killing it counts toward
  `killed_enemy` conditions and drops loot (`LootComponent`); player damage flows to the HUD via
  GameState.
- Verified: 2 hits kill the slime; kills counter + killed_enemy condition; touch damage to player;
  loot spawns; combat screenshot.
- Note: player death is a placeholder (respawn at full HP); real game-over later.
- Next: Milestone 6 (vertical slice: 3 maps + transitions + the fragment quest end-to-end).

## 6. Implemented systems
- **M1**: `PlayerController`, `Camera2D` follow, `Village` placeholder map, minimal `HUD`.
- **M2**: `DataRegistry`, `InteractionComponent` + `PlayerInteraction`, `NPC`, `DialogueManager` +
  `DialogueBox`.
- **M3**: `Conditions.gd` (shared predicate eval), `QuestManager` (staged, event-driven + rewards),
  `QuestJournalUI` (J). Dialogue filters choices by `conditions` + runs `start_quest`/`advance_quest`.
- **M4**: `InventoryManager` (player inventory broker, stacking), `PickupItem` (Area2D auto-collect
  + persistent_id), `InventoryUI` (I). Quest rewards go through InventoryManager.
- **M5**: `HealthComponent`, `StatsComponent`, `Hitbox`/`Hurtbox`, `LootComponent`, `EnemyAI`
  (Slime), `PlayerCombat` (melee + player health synced to GameState). EventBus actor_damaged/died;
  `GameState.kills` feeds `killed_enemy`.
- **Autoloads live**: EventBus, GameState, DataRegistry, InventoryManager, QuestManager,
  DialogueManager. **Still stubs**: SceneLoader, SaveManager (fleshed out at M6 / M7).
- **Controls**: move WASD/arrows · interact E/Space · journal J · inventory I · attack left-mouse.

## 7. Planned systems (by milestone — see `architecture/ROADMAP.md`)
- M1 Player + test map + camera + HUD.
- M2 Interaction + NPC + DialogueBox + first data-driven dialogue.
- M3 Quest system (staged) + QuestJournalUI.
- M4 Inventory + items + pickups.
- M5 Combat (Health, Hitbox/Hurtbox) + enemy + loot.
- M6 Vertical slice (Village/Forest/Cave + transitions + fetch quest).
- M7 Save/load (minimal).
- M8 Progression (XP/level/stats).
- Later (designed, not built): factions, reputation, economy, merchants, equipment depth,
  crafting, magic, skill tree, crime, NPC routines, modular dungeons.

## 8. What NOT to do
- ❌ No giant `Player.gd` that does everything.
- ❌ No hardcoded RPG content (items/quests/dialogue/NPCs/enemies) inside scripts.
- ❌ No out-of-scope features ahead of the current milestone.
- ❌ No duplicated logic.
- ❌ No deleting existing files without explaining why first.
- ❌ No heavy dependencies / large external asset packs without asking the user.
- ❌ Do **not** resurrect the previously wiped prototypes ("Aethermoor" Phaser game, "Grimward"
  Canvas2D rebuild). They were intentionally removed (history kept in git by SHA).
- ⚠️ If a request conflicts with the scalable architecture, **STOP and flag it** instead of
  shipping a fragile shortcut.

## 9. Naming conventions
- **Scene/script files defining a class or node**: `PascalCase` (`Player.gd`, `HealthComponent.gd`,
  `Village.tscn`).
- **Data files**: `snake_case` (`items.json`, `quests.json`).
- **`class_name`**: `PascalCase`. **Methods / variables**: `snake_case`.
- **Signals**: `snake_case`, past-tense for facts (`actor_died`, `item_added`).
- **Constants / enums values**: `UPPER_SNAKE_CASE`. **Private members**: `_leading_underscore`.
- **Node names** in scenes: `PascalCase`.
- **Content IDs**: `lower_snake_case` with a type prefix (see §10).

## 10. ID rules (critical for save/load & data-driven design)
- **Content IDs** (defined in `data/`): `item_iron_sword`, `item_health_potion`,
  `item_ancient_iron_fragment`, `quest_first_dungeon`, `npc_blacksmith_valdombra`,
  `enemy_cave_rat`, `faction_valdombra_village`, `dialogue_blacksmith_intro`, `map_village`,
  `map_forest`, `map_cave_01`, `skill_one_handed`.
- **Persistent world-object IDs** (`persistent_id`): every world object whose state must survive
  save/reload (chests, unique loot, doors, bosses, switches) carries a stable, globally-unique
  `persistent_id`: `chest_forest_001`, `enemy_cave_boss_001`, `door_mine_locked_001`,
  `item_ancient_iron_world_001`.
- IDs are **stable forever** once shipped in a save; never reuse or renumber.

## 11. Current milestone state
**M5 — Combat: COMPLETE** (health, hit/hurt, enemy AI, death + loot, killed_enemy; verified in
Godot 4.3). M0–M4 complete before it. M6 not started.

## 12. Recommended next step
Begin **Milestone 6** (on the user's go-ahead): build Forest + Cave maps + `AreaTransition` /
`SpawnPoint`, move map loading into `SceneLoader` (data-driven via `maps.json`), place the fragment
pickup + a slime in the cave, and wire `quest_first_dungeon` end-to-end (cave → fragment → return).

## 13. Summary for a new agent (read this first)
Valdombra is a from-scratch, data-driven, component-based 2D top-down fantasy RPG in Godot 4 +
GDScript, designed to scale. The repo was a clean slate; we are in **Milestone 0** (foundations
+ documentation). Read `HANDOFF.md` for the exact current state and next action, `architecture/
ARCHITECTURE.md` for structure, `architecture/DATA_SCHEMAS.md` for JSON formats, and
`DECISIONS.md` for the "why". Do not hardcode content; do not build ahead of the roadmap.
