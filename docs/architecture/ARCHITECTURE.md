# Valdombra — ARCHITECTURE

Scope: how the project is structured and how the pieces fit. See `SYSTEMS.md` for per-system
detail, `DATA_SCHEMAS.md` for data formats, `ROADMAP.md` for sequencing.

---

## 1. High-level shape
- **Engine**: Godot 4.x, GDScript, 2D top-down.
- **Three layers**:
  1. **Core / autoloads** — global singletons that hold state and route communication.
  2. **Systems** — gameplay managers (quest, dialogue, inventory, combat, world/maps, save).
  3. **Actors & UI** — scenes composed from reusable **components**, driven by the systems.
- **Data** lives in `res://data/*.json` and is loaded by `DataRegistry`. Code never hardcodes
  content.
- **Communication**: `EventBus` (signals) for notifications; autoload managers for queries.

## 2. Folder structure
```
res://
  scenes/
    main/        Main.tscn                 # boot scene: holds autoload-driven world + UI roots
    player/      Player.tscn
    actors/      ActorBase.tscn
    enemies/     EnemyBase.tscn  Slime.tscn
    npcs/        NPCBase.tscn    Blacksmith.tscn
    maps/        Village.tscn    Forest.tscn   Cave.tscn
    items/       PickupItem.tscn
    ui/          HUD.tscn DialogueBox.tscn InventoryUI.tscn QuestJournalUI.tscn
  scripts/
    core/        GameState.gd EventBus.gd DataRegistry.gd SceneLoader.gd SaveManager.gd IdUtils.gd
    components/  HealthComponent.gd StatsComponent.gd InventoryComponent.gd
                 InteractionComponent.gd FactionComponent.gd LootComponent.gd EquipmentComponent.gd
    player/      PlayerController.gd PlayerInteraction.gd
    actors/      Actor.gd
    enemies/     EnemyAI.gd
    npcs/        NPC.gd
    combat/      CombatSystem.gd Hitbox.gd Hurtbox.gd DamageData.gd
    quest/       QuestManager.gd QuestData.gd QuestStage.gd
    dialogue/    DialogueManager.gd DialogueData.gd
    inventory/   InventoryManager.gd ItemData.gd
    world/       MapManager.gd AreaTransition.gd SpawnPoint.gd PersistentWorldObject.gd
    ui/          HUD.gd DialogueBox.gd InventoryUI.gd QuestJournalUI.gd
  data/
    items/items.json  quests/quests.json  dialogues/dialogues.json  npcs/npcs.json
    enemies/enemies.json  factions/factions.json  skills/skills.json  maps/maps.json
  assets/
    sprites/  tilesets/  audio/  fonts/
  docs/
    ai_memory/      PROJECT_MEMORY.md SESSION_LOG.md DECISIONS.md TASKS.md HANDOFF.md
    architecture/   ARCHITECTURE.md DATA_SCHEMAS.md SYSTEMS.md ROADMAP.md
  project.godot
```

### Adaptations vs the originally-proposed layout (and why)
This follows the requested structure. Deliberate clarifications/changes:
1. **`IdUtils.gd` is a static utility class** (`class_name IdUtils`, static funcs), **not an
   autoload** — pure helpers don't need a singleton instance. (All other `core/` scripts in §3
   are autoloads.)
2. **`*Data.gd` classes are runtime model wrappers** (`RefCounted` with `class_name`), parsed
   **from** the JSON — they are not the data itself. JSON in `data/` is the source of truth.
3. **Manager singletons** (`QuestManager`, `DialogueManager`, `InventoryManager`, `MapManager`)
   are **autoloads** (global game systems). Other `scripts/*` are attached to scenes/components.
4. **`assets/` stays empty / placeholders only** in early milestones (no heavy art). Placeholder
   visuals are generated in-scene (ColorRect / simple shapes) to avoid asset dependencies.
5. **`.godot/` is git-ignored** (editor cache) when the skeleton is created.
Any further change to this structure must be explained in `DECISIONS.md` and reflected here.

## 3. Autoloads (singletons) — registered in `project.godot`
Load order matters (later ones may use earlier ones):
1. **EventBus** — global signal hub. No dependencies. (declare-only signals.)
2. **DataRegistry** — loads & validates all `data/*.json` at boot; exposes typed lookups by ID.
3. **GameState** — runtime source of truth (current map, player snapshot, quests, inventory,
   gold, flags, persistent-object state). Depends on DataRegistry for defaults.
4. **SceneLoader** — async map/scene swapping + spawn-point placement. Uses GameState, EventBus.
5. **QuestManager / DialogueManager / InventoryManager** — gameplay managers; read DataRegistry,
   mutate GameState, emit via EventBus. (Added per milestone; stubs from M0.)
6. **SaveManager** — serializes/deserializes GameState ↔ `user://`. Loaded last.

`IdUtils` is **not** an autoload (static helper).

## 4. Component model
- Components are `Node`-derived scripts under `scripts/components/`, attached to an actor scene.
- A component owns one concern, exposes a small typed API + signals, and never reaches across the
  tree for global concerns (it emits to EventBus or calls a manager).
- `Actor.gd` (base for Player/NPC/Enemy) provides only shared plumbing: a registry of its
  components and convenience getters (e.g. `get_health()`); it contains **no** quest/dialogue/
  inventory/combat logic.
- Example compositions:
  - **Player**: `PlayerController` + Health + Stats + Inventory + Interaction + Equipment.
  - **NPC**: `NPC` + Interaction + Faction (+ optional Inventory); dialogue via DialogueManager.
  - **Enemy**: `EnemyAI` + Health + Stats + Hurtbox/Hitbox + Loot + Faction.

## 5. Scene composition & boot flow
- `Main.tscn` is the boot scene: it hosts a `WorldRoot` (current map is added here by
  `SceneLoader`) and a `UIRoot` (HUD + windows). Autoloads exist above the tree.
- Boot: autoloads initialize → DataRegistry loads JSON → GameState builds initial/new-game state
  → SceneLoader loads the start map into `WorldRoot` and places the player at a `SpawnPoint`.
- Maps are separate scenes (`Village/Forest/Cave`) connected by `AreaTransition` nodes that carry
  `target_map_id` + `target_spawn_point_id` (+ optional condition).

## 6. Data flow (example: pick up an item)
`PickupItem` (has `item_id`, `persistent_id`) → on player overlap calls `InventoryManager.add(item_id)`
→ InventoryManager mutates GameState.inventory → emits `EventBus.item_added(item_id, qty)`
→ HUD & QuestManager react (QuestManager may advance a stage whose condition is `has_item`)
→ `PersistentWorldObject` marks its `persistent_id` consumed in GameState (so it won't respawn).

## 7. Testing posture
- Each milestone leaves the project in a runnable state.
- Prefer verifying by opening/running in Godot 4. Record the godot binary path in `HANDOFF.md`.
- Headless smoke check (once available): `godot --path . --headless --quit`.
