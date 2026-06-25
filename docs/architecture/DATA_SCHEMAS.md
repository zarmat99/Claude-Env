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
`quest_completed{quest}` · `faction_reputation_at_least{faction,value}` *(later)* ·
`flag_set{flag}`. Conditions are pure predicates evaluated against `GameState`.

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
**Action types**: `start_quest{quest}` · `advance_quest{quest}` · `give_item{id,count}` ·
`take_item{id,count}` · `set_flag{flag}` · `give_reward{...}` *(later)*. `next: null` ends dialogue.

## npcs/npcs.json
```json
{
  "npc_blacksmith_valdombra": {
    "id": "npc_blacksmith_valdombra", "name": "Blacksmith", "faction": "faction_valdombra_village",
    "dialogue": "dialogue_blacksmith_intro", "sprite": "res://assets/sprites/placeholder_npc.png",
    "home_map": "map_village", "quests_offered": ["quest_first_dungeon"]
  }
}
```

## enemies/enemies.json
```json
{
  "enemy_cave_rat": {
    "id": "enemy_cave_rat", "name": "Cave Rat", "faction": "faction_monsters",
    "stats": { "max_health": 12, "damage": 2, "move_speed": 60 },
    "sprite": "res://assets/sprites/placeholder_enemy.png",
    "loot_table": [ { "id": "item_health_potion", "chance": 0.25, "count": 1 } ],
    "xp_reward": 8
  }
}
```

## factions/factions.json *(reputation later)*
```json
{
  "faction_valdombra_village": { "id": "faction_valdombra_village", "name": "Valdombra Village",
    "default_reputation": 0, "hostile_to": [], "friendly_to": [] },
  "faction_monsters": { "id": "faction_monsters", "name": "Monsters",
    "default_reputation": -100, "hostile_to": ["faction_valdombra_village"], "friendly_to": [] }
}
```

## skills/skills.json *(progression later)*
```json
{
  "skill_one_handed": { "id": "skill_one_handed", "name": "One-Handed", "category": "combat",
    "max_level": 100, "description": "Proficiency with one-handed weapons." }
}
```

## maps/maps.json (index of map scenes + spawn points)
```json
{
  "map_village": { "id": "map_village", "scene": "res://scenes/maps/Village.tscn",
    "display_name": "Valdombra Village", "spawn_points": ["spawn_default", "spawn_from_forest"] },
  "map_forest":  { "id": "map_forest", "scene": "res://scenes/maps/Forest.tscn",
    "display_name": "Whispering Forest", "spawn_points": ["spawn_from_village", "spawn_from_cave"] },
  "map_cave_01": { "id": "map_cave_01", "scene": "res://scenes/maps/Cave.tscn",
    "display_name": "Old Cave", "spawn_points": ["spawn_from_forest"] }
}
```
`AreaTransition` nodes reference `{ target_map_id, target_spawn_point_id, required_condition? }`.

---

## Save file schema (`user://saves/slot_N.json`) — implemented in M7
```json
{
  "version": 1,
  "saved_at": "2026-06-25T12:00:00Z",
  "current_map": "map_cave_01",
  "player": {
    "position": { "x": 120.0, "y": 64.0 },
    "stats": { "level": 1, "xp": 0, "max_health": 30, "health": 30 },
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
    "door_mine_locked_001": { "state": "unlocked" }
  }
}
```
**Rules**: everything persistable is reachable from `GameState`. `world_objects` is keyed by
`persistent_id`; on map load, `PersistentWorldObject` nodes read their entry and apply it
(e.g. an opened chest stays opened, a dead enemy doesn't respawn). `version` enables migrations.
