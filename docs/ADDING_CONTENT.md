# Adding Content

Grimward is data-first. New content should usually be added by editing JSON, not game code.

## Add an asset family

1. Open `assets/data/asset_manifest.json`.
2. Add a new object to `families`.
3. Give it a unique `id`, a `kind`, a `count`, a `renderLayer`, a `collisionProfile`, tags, palette and `baseVisualSize`.
4. Run `python -B scripts/validate_content.py`.

The loader expands one family into concrete assets named `family_id_01`, `family_id_02`, and so on.

## Add a biome

1. Open `assets/data/biomes.json`.
2. Add a biome with `terrainTiles`, `props`, `spawnTable`, densities, structure rules, enemies, loot, overlap rules and seed.
3. Add its spawn table in `assets/data/spawn-tables.json`.
4. Add or update the static map/zone files listed below.
5. Run `python -B scripts/validate_content.py`.

## Add a static zone

1. Add a zone entry in `assets/data/zones.json`.
2. Add its map entry in `assets/data/maps.json`.
3. Create the map file under `assets/data/maps/`.
4. Add fixed transitions in `assets/data/entrances.json`.
5. Put persistent objects in `assets/data/placed_objects.json`.

The game loads these files as static cells. Generation is only a development aid for producing a saved JSON draft; runtime does not create a new world on startup.

## Collision and scale

Visual size and collision are separate. A tree can be 142 px tall while its collision box only covers the trunk. Profiles live in `collisionProfiles`; assets reference them by ID.

## Runtime debug

Use `F1` for collision boxes, `F2` for spawn markers, `F3` for biome tint and `R` to reload the current static zone while running locally.
