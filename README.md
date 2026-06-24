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
- `assets/imagen/source` stores the source atlas sheets generated with imagegen.
- `assets/generated` stores the concrete PNG assets sliced and normalized from those imagegen atlases.
- `assets/data/biomes.json` defines biome rules, densities, structures, enemies and loot.
- `assets/data/spawn-tables.json` defines weighted creature and loot tables.
- `assets/data/zones.json` is the manifest for static cells such as overworlds, cities, interiors and dungeons.
- `assets/data/maps.json` points each zone to an editable map file in `assets/data/maps/`.
- `assets/data/entrances.json` defines fixed transitions and spawn destinations between maps.
- `assets/data/interiors.json`, `assets/data/dungeons.json`, `assets/data/biome_rules.json` and `assets/data/placed_objects.json` keep the world data-driven and persistent.
- `src/core` contains loading, validation, input, rendering and simulation orchestration.
- `src/world` contains static zone loading, map construction and collision-aware world state.
- `scripts/validate_content.py` validates the data contract before runtime.

No protected names, locations, assets or lore from other games are used.

## Generate Image Assets

```powershell
python -B scripts/generate_imagen_assets.py
```

The script expands the manifest into individual PNG files and writes `assets/generated/asset-index.json`.
