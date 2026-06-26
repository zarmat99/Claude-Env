# M10 Asset Pipeline Failure Review

Date: 2026-06-25

## Verdict
The M10 world-authoring code path is useful, but the visual asset probe failed. The generated Imagen
atlas must not be treated as a serious tileset or production proxy.

## What Failed
- The generated image is a collage arranged in cells, not a true tilemap atlas.
- Terrain cells are not tileable; adjacent floor/water/wall cells show hard framed borders.
- Props and architectural pieces are embedded inside tile cells at inconsistent scales.
- Runtime placeholder object shapes still render on top of the generated art, making chest/door/
  switch placement look worse and harder to assess.
- The existing tests validate data and runtime mechanics, but they do not judge visual quality.

## Root Cause
The pipeline assumed that "generate an 8x8 atlas" would produce tile-ready assets. That assumption
is wrong. A usable tile pipeline needs explicit source constraints and review:

- terrain tiles must be seamless or intentionally edge-matched;
- props must be separate sprites/scenes with pivots, scale, collision, and layering rules;
- walls/doors/chests/switches need consistent orientation and footprint;
- generated art cannot be accepted without post-processing and a visual gate;
- technical validation is not the same as art-pipeline validation.

## Required Remediation Before SR2
1. Keep Image Gen as the primary real-asset source, per user decision on 2026-06-26.
2. Follow `docs/architecture/IMAGE_GEN_ASSET_RULES.md`.
3. Keep the failed `assets/tilesets/proxy_dark_fantasy_atlas.png` removed from active content
   (completed 2026-06-26; retained only in git history).
4. Generate atomic assets one by one: terrain tiles, transition tiles, object sprites, actor
   sprites.
5. Separate terrain tile layers from object sprites/scenes.
6. Define import presets, scale, pivots, collision, and y-sort/layering rules.
7. Capture a Godot screenshot and require human approval before marking M10R complete.

## Acceptance Criteria
- One small test map looks coherent in-game at normal camera scale.
- No visible atlas-cell gutters or framed collage artifacts.
- Terrain repeats without obvious seams at tile boundaries.
- Props do not occupy terrain cells as oversized paintings.
- Placeholder object geometry is hidden or replaced by proper sprites.
- The map remains validated by `DataRegistry` and covered by regression tests.
