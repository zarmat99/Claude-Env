# RPG Skeleton - TASKS

Legend: backlog, in_progress, done, blocked.

## In Progress
- (none)

## Backlog
- **PIPELINE-T1 - New art/audio pipeline** - backlog: define asset import, Image Gen generation rules, metadata, visual gate, audio hooks, and replacement workflow on the clean skeleton.
- **PIPELINE-T2 - First post-purge visual fixture** - backlog: create a small serious asset test only after the skeleton purge is committed.
- **UX-F1 - Input remapping UI** - backlog: deferred system follow-up.

## Done
- **PURGE-T1 - Strip prototype content to scalable skeleton** - done (2026-06-29): removed old maps, generated assets, game-specific data, old content-bound tests, stale review docs, and old project references. Kept systems, neutral fixtures, `map_bootstrap`, and `SkeletonRegressionRunner`. `.	est.bat` passes.
- **SKELETON-BASE - Scalable systems skeleton** - done: data registry, state, save/load, map loading, quests/dialogue, inventory/equipment/economy, combat/skills, factions, settings, game-over, UI shells, world objects, base actors.
