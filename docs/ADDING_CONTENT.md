# Adding Content

Grimward is data-first. New content should usually be added by editing JSON, not game code.

Current authored content is intentionally limited to one development test cell, `test_city_quarter`. Treat it as a playground for mechanics, not as final world content.

## Add an asset family

1. Open `assets/data/asset_manifest.json`.
2. Add a new object to `families`.
3. Give it a unique `id`, a `kind`, a `count`, a `renderLayer`, a `collisionProfile`, tags, palette and `baseVisualSize`.
4. Generate its art: write a prompt (see `docs/STYLE_GUIDE.md` + `docs/ASSET_PROMPTS.md`), generate the image in ChatGPT, save it as `assets/source/<id>.png`, then run `python scripts/process_asset.py <id>`.
5. Run `npm run validate`.

`process_asset.py` expands one source image into concrete variants named `id_01`, `id_02`, and so on under `assets/generated/<id>/`.

## Add a biome

1. Open `assets/data/biomes.json`.
2. Add a biome with `terrainTiles`, `props`, `spawnTable`, densities, structure rules, enemies, loot, overlap rules and seed.
3. Add its spawn table in `assets/data/spawn-tables.json`.
4. Add or update the static map/zone files listed below.
5. Run `npm run validate`.

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
