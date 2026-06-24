# Grimward

A clean restart of the project as a standalone, data-driven 2D dark-nordic fantasy RPG prototype.

## Run

```powershell
npm run validate
npm run dev
```

If Node/npm is not available, use the Python fallbacks:

```powershell
python scripts/validate_content.py
python scripts/serve.py
```

Open the URL printed by the dev server. The default is `http://127.0.0.1:4173`.

## Architecture

- `assets/data/asset_manifest.json` defines modular asset families, collision profiles, render layers and visual metadata.
- `assets/source` stores the raw per-family images generated with ChatGPT (one PNG per family).
- `assets/generated` stores the concrete game-ready PNG variants produced from each source image by `scripts/process_asset.py`.
- `assets/data/biomes.json` defines biome rules, densities, structures, enemies and loot.
- `assets/data/spawn-tables.json` defines weighted creature and loot tables.
- `assets/data/zones.json` is the manifest for static cells such as overworlds, cities, interiors and dungeons.
- `assets/data/maps.json` points each zone to an editable map file in `assets/data/maps/`.
- `assets/data/entrances.json` defines fixed transitions and spawn destinations between maps.
- `assets/data/interiors.json`, `assets/data/dungeons.json`, `assets/data/biome_rules.json` and `assets/data/placed_objects.json` keep the world data-driven and persistent.
- `src/core` contains loading, validation, input, rendering and simulation orchestration.
- `src/world` contains static zone loading, map construction and collision-aware world state.
- `scripts/validate-content.mjs` (run via `npm run validate`) validates the data contract before runtime.

## Current Content

The project currently ships with one development-only map: `test_city_quarter`. It is a small test cell for movement, collisions, props, NPC markers and loot. No final overworld, city, house interior or dungeon has been authored yet.

No protected names, locations, assets or lore from other games are used.

## Generate Image Assets

Art is generated one family at a time with ChatGPT, then normalized into
game-ready variants. See `docs/STYLE_GUIDE.md` for the visual contract and
`docs/ASSET_PROMPTS.md` for ready-to-use prompts.

```bash
# 1. Generate the image in ChatGPT using the prompt for the family
# 2. Save it as assets/source/<family_id>.png
# 3. Process it into game-ready variants:
python scripts/process_asset.py <family_id>
```

The script keys out the magenta background, crops, resizes to the family's
`baseVisualSize` and writes `assets/generated/<family_id>/<family_id>_NN.png`.
