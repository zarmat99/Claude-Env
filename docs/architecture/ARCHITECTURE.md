# RPG Skeleton - Architecture

## Goal
A content-agnostic, data-driven, component-based 2D top-down RPG skeleton in Godot 4.

## Layers
- `data/`: neutral fixture data and future authored content definitions.
- `scripts/core/`: state, validation, save/load, scene loading, settings, game-over.
- `scripts/quest`, `scripts/dialogue`, `scripts/factions`: narrative and reputation systems.
- `scripts/inventory`, `scripts/equipment`, `scripts/economy`: item, equipment, and trade systems.
- `scripts/combat`, `scripts/progression`: combat, damage, skills, XP.
- `scripts/world`: transitions, persistent objects, authored-map support, chest/door/switch logic.
- `scenes/*`: generic base scenes and UI shells.
- `tests/headless`: skeleton regression only.

## Boot
`Main.tscn` creates the player and UI, binds `SceneLoader`, and loads `map_bootstrap` from `maps.json`.

## Hard Rules
- Systems must not know production story, map names, NPC names, or asset names.
- New content enters through data and generic scene contracts.
- Fixture content is minimal and neutral.
- The bootstrap map is the only active map until a new content pipeline intentionally adds more.
