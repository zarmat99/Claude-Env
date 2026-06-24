# Grimward — project notes for Claude

Browser RPG (vanilla JS + Canvas2D, ES modules, no build step). Content is
data-driven: the world is described by JSON under `assets/data/` and rendered
from generated PNGs under `assets/generated/`.

## Run / validate

- Dev server: `npm run dev` (serves the repo at http://127.0.0.1:4173).
- Content validation: `npm run validate` — checks asset families, biomes,
  spawn tables, and **static zones/maps** (missing families, spawn points,
  dangling entrances, etc.). Run this after editing anything in `assets/data/`.

## Testing the graphics (headless screenshot)

Do NOT guess what a map looks like from the JSON — render it. Tiles and props
are dark, low-contrast PNGs, and the camera is zoomed in (~8.5 tiles wide on a
phone), so visual bugs (wrong terrain family, props on walls, black voids) only
show up in an actual frame.

Workflow:

1. Browsers are pre-provisioned in the Claude Code web environment under
   `/opt/pw-browsers` (Chromium). The `playwright` npm package is a
   devDependency; `npm install` is enough — do **not** run
   `npx playwright install` (the provisioned build version may not match).
2. Take a shot:

   ```bash
   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/screenshot.mjs out.png
   # wider composition view:
   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/screenshot.mjs out.png --desktop
   # avoid a port clash with a running dev server:
   PORT=4399 PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/screenshot.mjs out.png
   ```

   `scripts/screenshot.mjs` boots its own `serve.mjs`, auto-detects the Chromium
   binary, loads the game (phone viewport `412x915` by default, matching how the
   user plays; `--desktop` = `1280x800` to see more of the map at once), waits
   for assets to decode and a few frames to render, writes the PNG, and reports
   any failed requests / page errors.
3. Open the PNG and confirm the change. The default phone view is centered on
   the player spawn; to inspect other parts of a map, drive the player with
   `page.keyboard.down("ArrowUp"/"w")` etc. before screenshotting.

## Static maps (how the world is built)

- `assets/data/maps.json` — index of maps (`id`, `zoneId`, `file`).
- `assets/data/zones.json` — zones + `startZone`/`startSpawn`.
- `assets/data/maps/<map>.json` — a single map cell:
  - `defaultTerrain`, `terrain[]` (rect/circle/line shapes by `family`),
    `blockingTerrain[]` (solid terrain; walls).
  - `modularObjects[]` — props/structures placed by `family` + `tiles[]`
    (`solid` can override the family's collision).
  - `npcs[]`, `spawnPoints{}`.
- `assets/data/placed_objects.json` — extra per-zone objects (buildings, market
  props, loot). `loot: true` makes it collectible; `interaction: "inspect"`.
- `assets/data/entrances.json` — zone-to-zone transitions (currently none; the
  project ships a single self-contained test cell).

`src/world/StaticMapBuilder.js` assembles a `WorldState` from the above;
`src/core/Renderer.js` draws tiles → entities → weather → HUD/minimap.

### Terrain family gotchas (learned from real bugs)

- `dungeon_floor` art is a dark prison chain/shackle motif — **interior only**.
  Never use it as an outdoor plaza; pave open areas with `road_path_tile`.
- `terrain_black_loam` renders near-solid black; large patches read as holes.
- The minimap colors tiles by `biomeColor(biomeId)`. Static tiles carry their
  terrain `familyId` (or `"static"`) as `biomeId`, so any terrain family used on
  a map should have an entry in `biomeColor` or the minimap shows a flat block.

The single dev/test map is `test_courtyard.json` (zone `test_city_quarter`).
