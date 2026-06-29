# RPG Skeleton - Data Schemas

All data tables are JSON objects keyed by stable IDs. Active fixture IDs use neutral prefixes such as `item_fixture_*`, `quest_fixture_*`, `npc_fixture_*`, `enemy_fixture_*`, `faction_fixture_*`, and `merchant_fixture_*`.

## Required Tables
- `items/items.json`: item definitions with `type`, stack rules, value, optional `slot`, `stats`, and `use_effect`.
- `quests/quests.json`: staged quests with `giver`, `stages`, optional `advance_on`, `next`, `completes`, and `rewards`.
- `dialogues/dialogues.json`: graph nodes with `speaker`, `text`, optional `actions`, `choices`, `conditions`, `next`, and `entry_rules`.
- `npcs/npcs.json`: NPC metadata with faction, dialogue, home map, role, services, quest offers, and optional merchant ID.
- `enemies/enemies.json`: enemy metadata with faction, AI, damage type, stats, loot table, and XP reward.
- `factions/factions.json`: default reputation plus hostile/friendly relationships.
- `merchants/merchants.json`: stock and price multipliers.
- `skills/skills.json`: skill progression and optional ability definitions.
- `world/world_objects.json`: reusable persistent world-object definitions.
- `maps/maps.json`: map scene index, display name, region, dev role, and declared spawn points.
- `assets/*.json`: currently empty after purge; future assets must be governed before activation.

## Save Schema
`SaveManager` owns persistence. Save files store version, current map, player snapshot, quests, factions, flags, world objects, and kills. The current version is still `2`; newer saves are rejected, older saves are normalized/migrated.
