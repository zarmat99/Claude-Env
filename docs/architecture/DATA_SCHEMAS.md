# Valdombra — DATA SCHEMAS

All content is JSON under `res://data/`, loaded by `DataRegistry`. Each top-level file is an
object keyed by **content ID** (see `PROJECT_MEMORY.md` §10). These schemas are the contract;
extend additively (don't repurpose fields). Fields marked *(later)* are designed now, implemented
in their milestone.

---

## items/items.json
```json
{
  "item_iron_sword": {
    "id": "item_iron_sword",
    "name": "Iron Sword",
    "type": "weapon",               // weapon | armor | consumable | quest | material | misc
    "slot": "main_hand",            // weapon/armor only: main_hand|off_hand|head|chest|...
    "stackable": false,
    "max_stack": 1,
    "value": 25,                    // base economy value (gold)
    "weight": 3.0,
    "icon": "res://assets/sprites/placeholder_item.png",
    "stats": { "damage": 6 },       // type-specific modifiers (later: full stat block)
    "tags": ["metal", "blade"],
    "description": "A plain but reliable blade."
  },
  "item_health_potion": {
    "id": "item_health_potion", "name": "Health Potion", "type": "consumable",
    "stackable": true, "max_stack": 99, "value": 10, "weight": 0.2,
    "use_effect": { "type": "heal", "amount": 25 }, "description": "Restores some health."
  },
  "item_ancient_iron_fragment": {
    "id": "item_ancient_iron_fragment", "name": "Ancient Iron Fragment", "type": "quest",
    "stackable": false, "value": 0, "weight": 0.5, "description": "Sought by the blacksmith."
  }
}
```
**Equipment & use (M13)**: items of type `weapon`/`armor` declare a `slot` and may carry a `stats`
block. `EquipmentManager` brokers `GameState.player.equipment` (slot → item_id) and derives effective
player stats on demand as base + sum of equipped `stats` (combat/health currently consume `damage`
and `max_health`). `consumable` items with a `use_effect` are spent via `InventoryManager.use_item`
(`heal{amount}` is implemented). `value` drives `EconomyManager` buy/sell prices
(buy = value × 1.0, sell = value × 0.5, floored).

## quests/quests.json (staged + abstract conditions)
```json
{
  "quest_first_dungeon": {
    "id": "quest_first_dungeon",
    "title": "The Ancient Fragment",
    "giver": "npc_blacksmith_valdombra",
    "stages": [
      { "stage": 0,  "desc": "Speak with the blacksmith.",
        "advance_on": { "type": "talked_to", "target": "npc_blacksmith_valdombra" }, "next": 10 },
      { "stage": 10, "desc": "Enter the cave.",
        "advance_on": { "type": "entered_area", "target": "map_cave_01" }, "next": 20 },
      { "stage": 20, "desc": "Find the ancient iron fragment.",
        "advance_on": { "type": "has_item", "target": "item_ancient_iron_fragment", "count": 1 }, "next": 30 },
      { "stage": 30, "desc": "Return to the blacksmith.",
        "advance_on": { "type": "talked_to", "target": "npc_blacksmith_valdombra" }, "next": 40 },
      { "stage": 40, "desc": "Quest complete.", "completes": true,
        "rewards": { "xp": 50, "gold": 20, "items": [ { "id": "item_iron_sword", "count": 1 } ] } }
    ]
  }
}
```
**Condition types** (used by `advance_on` and dialogue/transition gates):
`has_item{target,count}` · `talked_to{target}` · `killed_enemy{target,count?}` ·
`entered_area{target}` · `quest_stage_is{quest,stage}` · `quest_not_started{quest}` ·
`quest_active{quest}` · `quest_completed{quest}` ·
`faction_reputation_at_least{faction,value}` · `faction_reputation_below{faction,value}` ·
`gold_at_least{value}` ·
`flag_set{flag}` · `flag_not_set{flag}`. Conditions are pure predicates evaluated against
`GameState`/manager state. Branching authoring conventions live in
`docs/architecture/QUEST_DIALOGUE_AUTHORING.md`.

**`advance_on` forms (SR3-F2)**: a stage's `advance_on` may be a single condition object (as above),
an **array** of conditions that must all hold (AND), or an `{ "any_of": [ ... ] }` /
`{ "all_of": [ ... ] }` object. `talked_to` inside a multi-condition set is satisfied only at the
moment of talking, so "carry X and report to NPC" advances when the player talks while already
holding X — it never auto-completes from an earlier conversation. Example:
`"advance_on": [ { "type": "has_item", "target": "item_herb", "count": 3 }, { "type": "talked_to", "target": "npc_healer" } ]`.

## dialogues/dialogues.json (conditional node graph)
```json
{
  "dialogue_blacksmith_intro": {
    "id": "dialogue_blacksmith_intro",
    "entry": "start",
    "nodes": {
      "start": {
        "speaker": "npc_blacksmith_valdombra",
        "text": "You've the look of someone who can handle a cave. Interested in work?",
        "choices": [
          { "text": "Tell me more.", "next": "offer",
            "conditions": [ { "type": "quest_not_started", "quest": "quest_first_dungeon" } ] },
          { "text": "Found it yet?", "next": "remind",
            "conditions": [ { "type": "quest_stage_is", "quest": "quest_first_dungeon", "stage": 20 } ] },
          { "text": "Goodbye.", "next": null }
        ]
      },
      "offer": {
        "speaker": "npc_blacksmith_valdombra",
        "text": "Bring me an ancient iron fragment from the cave.",
        "actions": [ { "type": "start_quest", "quest": "quest_first_dungeon" } ],
        "choices": [ { "text": "I'll do it.", "next": null } ]
      },
      "remind": { "speaker": "npc_blacksmith_valdombra", "text": "The fragment's still out there.",
        "choices": [ { "text": "Right.", "next": null } ] }
    }
  }
}
```
**Implemented action types (M11/M12 validator accepts these)**: `start_quest{quest}` ·
`advance_quest{quest}` · `set_quest_stage{quest,stage}` · `set_flag{flag}` ·
`clear_flag{flag}` · `give_item{id,count}` · `take_item{id,count}` ·
`give_reward{rewards}` · `change_reputation{faction,amount}` ·
`set_reputation{faction,value}` · `buy_item{id,count,merchant?}` · `sell_item{id,count,merchant?}`.
`give_reward.rewards` uses the same reward object shape as quest stages (`xp`, `gold`, `items`).
`buy_item`/`sell_item` trade through `EconomyManager` (gold-checked); an optional `merchant` id applies
that merchant's multipliers and restricts buying to its stock. Pair `buy_item` with a `gold_at_least`
choice condition so the option only shows when affordable. `next: null` ends dialogue.

**Node `next` + soft-lock guard (SR3-F1)**: a node may declare a node-level `"next": "node_id"` and
omit `choices`; the DialogueBox then shows a single **Continue** affordance that advances to `next`,
or ends the dialogue if `next` is absent. A node that has choices but where **every** choice is gated
out by conditions falls back to the same Continue/Leave affordance — so a reachable node can never
soft-lock the paused game. Authors should still give branching nodes an unconditional fallback choice
where the conversation is meant to continue.

**`entry_rules` — state-reactive greetings (SR3-F3)**: a dialogue may declare
`"entry_rules": [ { "conditions": [ ... ], "node": "node_id" }, ... ]`. On start, the first rule
whose conditions are all met selects the opening node; if none match, the static `entry` node is the
guaranteed fallback. This lets one NPC vary its greeting by quest/reputation/flags without authoring
separate dialogues. `entry` remains required.

## npcs/npcs.json
```json
{
  "npc_blacksmith_valdombra": {
    "id": "npc_blacksmith_valdombra", "name": "Blacksmith", "faction": "faction_valdombra_village",
    "dialogue": "dialogue_blacksmith_intro", "sprite": "res://assets/sprites/placeholder_npc.png",
    "home_map": "map_village", "role": "blacksmith", "services": ["forge"],
    "quests_offered": ["quest_first_dungeon"]
  }
}
```
`role` is validated against the project role list (`blacksmith`, `debug_tester`, `quest_giver`,
`villager`, `merchant`, `guard`). `services` is free-form metadata for later systems/UI. An NPC with
`role: "merchant"` (or any NPC with a `merchant` field) must reference a valid `merchants.json` entry.

## enemies/enemies.json
```json
{
  "enemy_cave_rat": {
    "id": "enemy_cave_rat", "name": "Cave Rat", "faction": "faction_monsters",
    "ai": { "type": "skirmisher", "aggro_range": 180, "attack_range": 54,
      "preferred_range": 78, "attack_cooldown": 0.7 },
    "damage_type": "physical",
    "stats": { "max_health": 8, "damage": 3, "move_speed": 86, "armor": 0,
      "resistances": { "fire": 0.25 } },
    "loot_table": [ { "id": "item_health_potion", "chance": 0.25, "count": 1 } ],
    "xp_reward": 8
  }
}
```
Enemy `ai.type` is validated as `chaser`, `skirmisher`, or `sentinel`. `damage_type` is validated as
`physical`, `fire`, `frost`, `arcane`, or `poison`. Optional `stats.armor` reduces incoming damage;
optional `stats.resistances` maps damage type to multiplier resistance (`0.5` halves pre-armor
damage, `-0.25` means 25% weakness).

## factions/factions.json
```json
{
  "faction_valdombra_village": { "id": "faction_valdombra_village", "name": "Valdombra Village",
    "default_reputation": 0, "hostile_to": [], "friendly_to": [] },
  "faction_monsters": { "id": "faction_monsters", "name": "Monsters",
    "default_reputation": -100, "hostile_to": ["faction_valdombra_village"], "friendly_to": [] }
}
```
`default_reputation` is validated from -100 to 100 and copied into `GameState.factions` for mutable
runtime/save state. Reputation <= -50 is hostile to the player; reputation >= 25 is friendly.
`hostile_to` / `friendly_to` express faction-to-faction relationships independent of player
reputation.

## merchants/merchants.json (M13)
```json
{
  "merchant_valdombra_general": {
    "id": "merchant_valdombra_general",
    "name": "Valdombra General Goods",
    "buy_multiplier": 1.0,
    "sell_multiplier": 0.5,
    "stock": ["item_health_potion", "item_leather_armor", "item_iron_sword"]
  }
}
```
Merchant IDs use `merchant_`. `stock` is a non-empty array of item refs the merchant sells;
`buy_multiplier`/`sell_multiplier` are optional (default 1.0 / 0.5) and scale `EconomyManager`
prices. An NPC links to a merchant via its `merchant` field; dialogue `buy_item`/`sell_item` actions
pass the same `merchant` id for stock-gated, merchant-priced trade.

## skills/skills.json (M14)
```json
{
  "skill_one_handed": { "id": "skill_one_handed", "name": "One-Handed", "category": "combat",
    "max_level": 100, "xp_to_level": 20, "xp_level_step": 10, "xp_per_use": 3,
    "description": "Proficiency with one-handed weapons." },
  "skill_firebolt": { "id": "skill_firebolt", "name": "Firebolt", "category": "magic",
    "max_level": 50, "xp_to_level": 18, "xp_level_step": 8, "xp_per_use": 5,
    "input_action": "ability_2", "cooldown": 1.0,
    "ability": { "type": "area_damage", "origin": "nearest_enemy", "damage": 8,
      "damage_type": "fire", "radius": 48, "range": 150, "scale_stat": "damage", "scale": 0.5 } }
}
```
Skill categories are validated as `combat`, `magic`, or `survival`. Ability types currently supported
by `PlayerAbilities` are `area_damage` and `self_heal`; ability input actions must exist in
`project.godot`. Runtime skill state is saved under `GameState.player.skills`.

## assets/asset_sets.json (M10)
```json
{
  "asset_generated_dev_tileset": {
    "id": "asset_generated_dev_tileset",
    "name": "Generated Dev Tileset",
    "atlas": "res://assets/tilesets/generated/dev_tileset.png",
    "source_tile_size": 128,
    "world_tile_size": 64,
    "columns": 8,
    "rows": 8,
    "tiles": {
      "tile_stone_floor": {
        "id": "tile_stone_floor",
        "name": "Stone Floor",
        "col": 3,
        "row": 0,
        "kind": "ground",
        "collision": "none"
      },
      "tile_stone_wall": {
        "id": "tile_stone_wall",
        "name": "Stone Wall",
        "col": 0,
        "row": 1,
        "kind": "wall",
        "collision": "solid"
      }
    }
  }
}
```
Validated by `DataRegistry`: atlas path exists and loads as `Texture2D`; dimensions match
`source_tile_size * columns/rows`; tile IDs use `tile_`; atlas coordinates are in bounds;
`collision` is `none | solid | water`.

## assets/generated_assets.json (M10R)
```json
{
  "asset_sprite_oak_tree_large_a": {
    "id": "asset_sprite_oak_tree_large_a",
    "source": "image_gen",
    "class": "object_sprite",
    "prompt": "...",
    "original_file": "res://assets/source/image_gen/asset_sprite_oak_tree_large_a/original_chromakey.png",
    "processed_file": "res://assets/sprites/generated/oak_tree_large_a.png",
    "source_size": { "x": 256, "y": 256 },
    "world_size": { "x": 160, "y": 160 },
    "pivot": "bottom_center",
    "footprint_tiles": { "x": 2, "y": 2 },
    "collision_shape": "rectangle",
    "collision_size": { "x": 36, "y": 44 },
    "collision_offset": { "x": 0, "y": -22 },
    "visual_z_index": 20,
    "approved": true,
    "approval_screenshot": "res://assets/previews/generated/m11_test_asset_contact_sheet.png"
  }
}
```
Validated by `DataRegistry`: generated asset IDs use `asset_`; `source` is `image_gen`;
`class` is `terrain_tile | transition_tile | object_sprite | actor_sprite`; original and
processed files exist; source/world sizes are positive; terrain collisions use
`none | solid | water`; object/actor sprites declare `pivot`, `footprint_tiles`, and
`collision_shape`. `collision_size`, `collision_offset`, and `visual_z_index` are optional
runtime metadata used when visual bounds and physical blocking differ.

## world/world_objects.json (M10)
```json
{
  "world_object_generated_chest": {
    "id": "world_object_generated_chest",
    "kind": "chest",
    "scene": "res://scenes/world/Chest.tscn",
    "asset_set": "asset_generated_dev_tileset",
    "asset_tile": "tile_closed_chest",
    "persistent": true
  }
}
```
`kind` is currently `chest | door | switch | pickup | enemy`. `scene` must exist. If `asset_tile`
is set, `asset_set` must point to a valid asset set and the tile must exist inside it. Persistent
world objects need a stable `persistent_id` when placed in a scene or authored map.
M15 uses these definitions as a reusable dungeon object library: `world_object_dungeon_chest`,
`world_object_dungeon_door`, `world_object_dungeon_switch`, `world_object_dungeon_pickup`, and
`world_object_dungeon_enemy`.

## maps/maps.json (index of map scenes + spawn points; authored maps in M10)
```json
{
  "map_village": { "id": "map_village", "scene": "res://scenes/maps/Village.tscn",
    "display_name": "Valdombra Village", "region": "region_dev_sandbox",
    "dev_role": "vertical_slice", "spawn_points": ["spawn_default", "spawn_from_forest"] },
  "map_generated_probe": {
    "id": "map_generated_probe",
    "scene": "res://scenes/maps/GeneratedProbe.tscn",
    "display_name": "Generated Asset Probe",
    "region": "region_dev_sandbox",
    "dev_role": "asset_probe",
    "asset_set": "asset_generated_dev_tileset",
    "spawn_points": ["spawn_probe_entry", "spawn_probe_exit"],
    "authoring": {
      "width": 2,
      "height": 2,
      "layers": {
        "ground": [["tile_stone_wall", "tile_stone_wall"], ["tile_stone_wall", "tile_stone_floor"]],
        "props": [["", ""], ["", "tile_floor_crack"]]
      },
      "collision_rects": [
        { "name": "north_wall", "position": { "x": 320, "y": -16 }, "size": { "x": 640, "y": 32 } }
      ],
      "spawns": [{ "id": "spawn_probe_entry", "position": { "x": 96, "y": 352 } }],
      "transitions": [{
        "name": "ToForest",
        "position": { "x": 608, "y": 352 },
        "size": { "x": 36, "y": 104 },
        "target_map": "map_forest",
        "target_spawn": "spawn_from_probe"
      }],
      "objects": [{
        "name": "ProbeChest",
        "world_object": "world_object_generated_chest",
        "persistent_id": "chest_probe_ruins_001",
        "position": { "x": 224, "y": 160 },
        "loot": [{ "id": "item_health_potion", "count": 2 }]
      }, {
        "name": "LockedDoor",
        "world_object": "world_object_dungeon_door",
        "persistent_id": "door_trial_locked_001",
        "position": { "x": 256, "y": 160 },
        "required_item_id": "item_trial_dungeon_key",
        "consume_required_item": true
      }],
      "encounters": [{
        "id": "encounter_trial_sentinel",
        "name": "Trial Sentinel",
        "kind": "boss",
        "enemy_persistent_ids": ["enemy_trial_sentinel_001"],
        "gate_persistent_ids": ["door_trial_reward_gate_001"],
        "reward_persistent_ids": ["chest_trial_reward_001"]
      }]
    }
  }
}
```
Scene-authored maps are validated by instantiating their scene and checking `SpawnPoint`,
`AreaTransition`, content references, and `persistent_id`s. M10 authored maps are validated directly
from `authoring`: dimensions, layer row/cell counts, tile IDs, spawns, transition targets, object
scene/data refs, loot/item/enemy refs, switch targets, and duplicate `persistent_id`s.
`AuthoredMap.gd` consumes the same `authoring` block at runtime. M15 adds authored
`collision_rects` for dungeon blockers, optional door `required_item_id` / `consume_required_item`,
and map-local `encounters` metadata. Encounter IDs use the `encounter_` prefix and can group
enemy, gate, and reward persistent IDs for validation and regression tests.

---

## Save file schema (`user://saves/slot_N.json`) — M7; M16 adds slots, autosave & migration
M16: saves live in numbered slots (`slot_N.json`) plus an `autosave.json`; `version` is now `2`, and
`SaveManager` migrates older saves on load and rejects newer-than-supported ones.
`SaveManager.get_save_info` / `list_saves` expose slot metadata (`saved_at`, `current_map`,
`map_display`, `level`, `gold`) for the pause/save-load UI. Player settings persist separately in
`user://settings.cfg` (`[audio] master_volume`).
```json
{
  "version": 2,
  "saved_at": "2026-06-25T12:00:00Z",
  "current_map": "map_cave_01",
  "player": {
    "position": { "x": 120.0, "y": 64.0 },
    "stats": { "level": 1, "xp": 0, "max_health": 30, "health": 30, "damage": 6 },
    "gold": 0,
    "inventory": [ { "id": "item_health_potion", "count": 2 } ],
    "equipment": { "main_hand": "item_iron_sword", "off_hand": null }
  },
  "quests": {
    "active":    { "quest_first_dungeon": { "stage": 20 } },
    "completed": []
  },
  "factions":  { "faction_valdombra_village": { "reputation": 0 } },
  "flags":     { "intro_seen": true },
  "kills":     { "enemy_slime": 1 },
  "world_objects": {
    "chest_forest_001":     { "state": "opened" },
    "enemy_cave_boss_001":  { "state": "dead" },
    "door_mine_locked_001": { "state": "open" },
    "switch_mine_001":      { "state": "on" },
    "drop_enemy_cave_slime_001_00": {
      "state": "active",
      "kind": "pickup",
      "item_id": "item_health_potion",
      "count": 1,
      "map_id": "map_cave_01",
      "position": { "x": 260.0, "y": 160.0 }
    }
  }
}
```
**Rules**: everything persistable is reachable from `GameState`. `world_objects` is keyed by
`persistent_id`; on map load, `PersistentWorldObject` nodes read their entry and apply it
(e.g. an opened chest stays opened, a dead enemy doesn't respawn). M9 dynamic pickups use
`kind: "pickup"` with `state: "active"` until collected; collected dynamic pickups preserve their
metadata but stop respawning once their `state` becomes `"collected"`. `version` enables migrations.
