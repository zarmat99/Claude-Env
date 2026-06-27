# SR2 - Map Scalability Review

Date: 2026-06-27  
Scope: M10 world-authoring systems plus M10R governed Image Gen asset pipeline, before M11.

## Verdict
The project can proceed to M11. Map growth is structurally scalable enough for the next narrative
systems milestone: map lookup is data-driven, transitions/spawns are validated, persistent object
IDs are checked, and the failed direct-atlas art path has been replaced by governed atomic assets.

No blocker requires a rewrite before M11. The main constraint is discipline: real maps should grow
through `maps.json`, `AuthoredMap`, governed asset sets, and validated scene/data references, not by
copying the old placeholder-map shortcuts.

## Findings

### Medium - Current playable maps are still dev sandbox scenes
- **Evidence**: `map_village`, `map_forest`, and `map_cave_01` point to bespoke/placeholder scenes
  in `data/maps/maps.json`; their `region` remains `region_dev_sandbox` and their `dev_role` is
  `vertical_slice`.
- **Risk**: If real production maps are copied from these scenes, placeholder assumptions can leak
  into the real world: invisible boundary walls, hand-placed content, and test quest coupling.
- **Decision**: Not a blocker for M11. Keep Village/Forest/Cave as regression/dev slice. Future real
  regions should use data-authored maps or explicitly documented scene-authored exceptions.

### Medium - Authored-map path is validated but underused by active content
- **Evidence**: `AuthoredMap.gd` can build tile layers, collisions, spawns, transitions, and objects
  from map authoring data. `DataRegistry` validates authored layer dimensions, tile IDs, spawns,
  transitions, objects, loot, and duplicate persistent IDs. The active vertical slice still mostly
  uses scene-authored maps.
- **Risk**: The scalable path could drift if not exercised again before real production region work.
- **Required follow-up**: Before M17 production region work, add or restore a small approved
  data-authored map fixture that uses the governed asset pipeline.

### Low - Asset rules are now strong enough for map scaling
- **Evidence**: `IMAGE_GEN_ASSET_RULES.md` now forbids generated gameplay atlases/maps, requires
  atomic terrain/object generation, preserves originals, processes alpha/tiles locally, records
  metadata, separates `world_size` from `footprint_tiles`, and supports smaller collision shapes for
  overhead props such as trees.
- **Risk**: Future asset additions can still fail visually, but the failure mode is now contained:
  reject/replace a single asset candidate rather than corrupting an entire map or atlas.
- **Decision**: M10R asset workflow is accepted as the base rule set.

## SR2 Questions

- **Can five new maps be added without manager-code changes?** Yes, if they use the existing
  `maps.json` entry + scene/AuthoredMap route. `SceneLoader` is map-ID driven and does not require
  special cases per map.
- **Are transitions, spawn points, and persistent objects validated?** Yes. `DataRegistry` checks
  declared scene spawns against actual spawns, transition targets against target-map spawns, authored
  object references, persistent IDs, and switch targets.
- **Is placeholder/dev content isolated from production content?** Mostly yes. The dev slice is
  marked as `region_dev_sandbox` with `dev_role` values, and the failed M10 probe was removed.
  Remaining risk is cultural/authoring: do not use placeholder scenes as production templates.

## Required Follow-Up

- **M11**: Proceed with quest/dialogue production pipeline. Narrative systems can build on the
  current dev slice while real map production remains deferred.
- **Pre-M17**: Add a small approved data-authored map fixture using governed assets before building
  the first real production region.
- **Ongoing**: Keep generated assets behind the Image Gen asset rules and do not reintroduce direct
  generated atlas or map-image slicing.

## Decision
Proceed to M11. SR2 does not require additional blocking fixes.
