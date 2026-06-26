# Valdombra - Image Gen Asset Rules

Image Gen remains the primary real-asset source for Valdombra. The M10 failure was not "AI art";
it was using a generated atlas as if it were a production tileset. These rules are mandatory before
any generated asset can enter a map, asset set, or scene.

## Non-Negotiable Rule
Never generate a final tileset atlas, map screenshot, room layout, or mixed prop sheet and then
slice it into gameplay assets.

Generate **one atomic asset at a time**, approve it, process it, then pack it into project atlases
with tooling. A generated multi-asset sheet is allowed only as concept/reference and must not be
used directly in-game.

## Asset Classes

### Terrain Tiles
Terrain tiles are floors, grass, dirt, stone, mud, water, bridge planks, cave floor, and simple
repeating wall/fill materials.

Rules:
- Generate one tile material per request, not a collage.
- Prompt must ask for a **seamless, edge-to-edge, tileable square texture**.
- No border, frame, bevelled square plate, vignette, text, labels, props, doors, barrels, chests,
  trees, stairs, torches, walls, or shadows that imply a unique object.
- Edges must continue naturally when tiled in a 3x3 preview.
- Source generation target: 1024x1024 PNG.
- Processed terrain tile target: 128x128 source tile, displayed as 64x64 world tile unless the
  asset set explicitly changes scale.
- Terrain tiles belong in tile layers only.

Prompt template:
```text
Single seamless tileable top-down 2D game terrain texture, [material], dark medieval fantasy RPG,
orthographic top-down, continuous edge-to-edge pattern, no border, no frame, no props, no objects,
no text, no labels, no UI, no perspective camera, no vignette, square texture.
```

Failure conditions:
- visible square border or black gutter;
- object centered in the tile;
- strong lighting or shadow that breaks repetition;
- edges do not match in a 3x3 tiled preview;
- tile looks like a framed painting rather than a repeatable material.

### Transition Tiles
Transition tiles are edges between terrain types: dirt-to-grass, stone-to-water, wall-to-floor,
shorelines, cliff edges.

Rules:
- Do not improvise transitions from random generated tiles.
- Each transition family must be generated as a planned set with named pieces:
  `center`, `edge_n`, `edge_s`, `edge_e`, `edge_w`, `corner_ne`, `corner_nw`, `corner_se`,
  `corner_sw`, and optional inner corners.
- Each piece is still generated/processed individually or from a controlled batch whose cells are
  manually reviewed and cut.
- No transition family is accepted until a 3x3 or 5x5 in-engine sample looks coherent.

### Object Sprites
Object sprites are chests, doors, switches, barrels, crates, trees, rocks, signs, lamps, stairs,
entrances, interactables, pickups, enemies, NPCs, and decorative props.

Rules:
- Generate one object per request.
- Prompt must ask for **transparent background** and **single isolated object**.
- No floor tile, no room background, no border, no frame, no text, no labels, no extra props.
- Object must be fully visible with padding; nothing cropped.
- Store pivot and gameplay footprint in metadata.
- Object sprites belong in scenes or sprite/object layers, not terrain tile layers.
- Runtime placeholder geometry must be hidden/replaced when a real sprite is used.

Prompt template:
```text
Single isolated top-down 2D game sprite of [object], dark medieval fantasy RPG, transparent
background, centered, full object visible, consistent scale for a 64px world tile grid, no floor,
no room, no border, no frame, no text, no labels, no UI, no extra objects.
```

Failure conditions:
- background is not transparent;
- object is embedded in a terrain tile;
- object includes other objects not requested;
- perspective does not match top-down RPG view;
- object is cropped or has a frame;
- scale cannot be reconciled with the 64px world grid.

### Actor Sprites
Actors are player, NPCs, enemies, bosses, and creatures.

Rules:
- Generate idle/reference sprites first, not animation sheets.
- Animation sheets require a separate approved workflow.
- Actor sprite prompts must specify view angle, scale, silhouette, and transparent background.
- Do not use actor assets in maps until their collision footprint and y-sort/pivot are documented.

## Required Workflow
1. Write an asset spec before generation:
   - asset ID;
   - asset class (`terrain_tile`, `transition_tile`, `object_sprite`, `actor_sprite`);
   - intended scene/map use;
   - target world footprint in tiles;
   - prompt;
   - rejection criteria.
2. Generate candidates with Image Gen.
3. Save original outputs under `assets/source/image_gen/<asset_id>/`.
4. Select one candidate or reject all.
5. Process the selected asset:
   - terrain: crop square, downsample to source tile size, verify 3x3 repeat;
   - sprites: remove/verify transparency, trim/crop with padding, set pivot/footprint metadata;
   - atlas packing: done by tooling from approved individual assets, never by Image Gen.
6. Save processed assets under:
   - `assets/tilesets/generated/` for terrain;
   - `assets/sprites/generated/` for object/actor sprites.
7. Add/update metadata in `data/assets/`.
8. Capture an in-Godot screenshot at normal camera scale.
9. Human approves or rejects the screenshot.
10. Only approved assets can be used by maps outside isolated experiments.

## World Scale Contract
All generated art must be judged against the same fundamental unit:

- 1 gameplay tile = 64x64 world pixels.
- Terrain sources are processed to 128x128 and rendered as one 64x64 tile.
- One-tile object sprites use a 64x64 world render envelope by default.
- Player/NPC visuals are larger than the old debug square: the current placeholder target is
  36x44 world pixels, with a smaller collision footprint.
- Humanoid collision footprint is 18x18 world pixels unless a final actor asset proves otherwise.
- Small enemies use a larger-than-debug footprint; the current slime placeholder is 36x30 visual,
  22x18 collision, and 18px hurt radius.
- Player interaction and attack ranges are scaled to the new actor size: 40px interaction radius
  and 44px attack radius.
- World-object placeholder interaction radius is around 48px for one-tile props.
- Pickup placeholders are intentionally small, but still scaled up from the old debug diamond:
  20px visual diameter and 12px pickup collision radius.
- Visual size, collision footprint, and gameplay footprint are separate concepts.
- Do not fix proportion problems by shrinking every object below the tile unit. First check the
  player/actor visual scale, then object metadata, then collision/footprint.
- Every visual gate must include a player-scale reference next to props and terrain.

## Mandatory Metadata
Every generated asset needs a small metadata entry or sidecar file with:

```json
{
  "id": "asset_tile_stone_floor_a",
  "source": "image_gen",
  "class": "terrain_tile",
  "prompt": "...",
  "original_file": "res://assets/source/image_gen/asset_tile_stone_floor_a/original.png",
  "processed_file": "res://assets/tilesets/generated/stone_floor_a.png",
  "source_size": { "x": 128, "y": 128 },
  "world_size": { "x": 64, "y": 64 },
  "collision": "none",
  "approved": false,
  "approval_screenshot": ""
}
```

Object sprites additionally need:

```json
{
  "pivot": "bottom_center",
  "footprint_tiles": { "x": 1, "y": 1 },
  "collision_shape": "rectangle"
}
```

## Visual Gate Checklist
Before accepting an asset or map:

- The asset looks coherent at the game's actual zoom.
- Terrain tiles repeat in a 3x3 preview with no obvious seams.
- Terrain has no black gutters, frames, text, or baked-in UI.
- Props are separate sprites, not painted inside terrain cells.
- Sprites have transparent backgrounds.
- Object scale fits the 64px world grid.
- Collision footprint matches the visible sprite.
- Placeholder polygons are hidden/replaced for approved art.
- A Godot screenshot exists and has been approved by the user.

## Prompt Anti-Patterns
Do not use prompts like:
- "8x8 tileset atlas";
- "complete dungeon tileset sheet";
- "top-down map with props";
- "sprite sheet with many objects";
- "game level layout";
- "dungeon room scene".

These prompts are useful for mood boards only, not for shippable assets.

## M10R Acceptance
M10R is complete only when Image Gen produces a small approved asset set through this workflow:

- at least 3 approved seamless terrain tiles;
- at least 2 approved object sprites with transparent background;
- one small Godot map screenshot using those assets coherently;
- no direct generated atlas slicing;
- metadata and validation updated to reflect the approved assets.
