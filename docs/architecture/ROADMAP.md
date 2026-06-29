# RPG Skeleton - Roadmap

Build systems before content. Each milestone leaves the project runnable. Detailed task state lives
in `docs/ai_memory/TASKS.md`; this file is the strategic sequence and should not become a live
changelog.

Manual verification rule: every player-facing milestone needs both automated regression and a
visible in-game pass before it is considered complete.

---

## S0 - Clean Skeleton Baseline
- **Goal**: preserve the scalable RPG systems while removing prototype content.
- **Status**: complete and verified.
- **Kept**: data validation, state, map loading, save/load, quests, dialogue, factions, inventory,
  equipment, economy, combat, skills, settings, game-over, UI shells, base actors, persistent world
  objects, authored-map support, and one neutral bootstrap map.
- **Removed**: prototype maps, generated assets, old story/content data, old content-bound runners,
  and stale review docs.
- **Verification**: `SkeletonRegressionRunner` plus Godot import through `test.bat`.

## SR0 - Skeleton Integrity Review
- **Goal**: confirm the post-purge repo is truly content-agnostic before adding art or real content.
- **Questions**:
  - Are systems free of production-story, production-map, and production-asset assumptions?
  - Is test content clearly neutral and isolated behind `fixture_*` IDs?
  - Can the bootstrap map be removed or replaced later without manager rewrites?
  - Does the regression suite still cover the core RPG contracts?
- **Exit criteria**: any hidden content dependency is removed or documented as a blocker before M17.

## M17 - Art/Audio Pipeline
- **Goal**: define how real visual/audio assets enter the clean skeleton without disturbing systems.
- **Scope**: art direction rules, Image Gen prompt rules, source/processed asset folders, import
  presets, texture size rules, world scale, pivots, footprints, collision metadata, z-order/layering,
  animation conventions, audio event naming, audio bus usage, and approval screenshots.
- **Exit criteria**: one tiny playable visual/audio fixture can be added and removed without changing
  manager code; assets are referenced through metadata and pass an in-game visual review.

## MV2 - First Asset Pipeline Visual Gate
- **Goal**: verify the new art/audio pipeline in a visible game session before real content begins.
- **Scope**: open the game, inspect scale/proportions, collision, foreground layering, readability,
  UI overlap, and audio triggers.
- **Exit criteria**: user-visible approval or explicit blocker list. No real region work starts until
  this gate passes.

## M18 - Production Content Blueprint
- **Goal**: define the first real game slice before authoring it.
- **Scope**: region concept, map list, NPC cast shape, questline outline, dungeon/encounter needs,
  faction/economy touchpoints, required asset list, required audio list, and validation strategy.
- **Exit criteria**: the first real slice is planned as data and asset work, with no expected manager
  rewrites.

## SR5 - Content Scalability Review
- **Goal**: review the blueprint against the skeleton before building real maps/story.
- **Questions**:
  - Can the planned slice be authored mostly through data, scenes, and assets?
  - Are any systems missing before real content would force shortcuts?
  - Are asset, collision, save/load, quest, and dialogue contracts strong enough?
- **Exit criteria**: go/no-go for first real slice; required fixes are scheduled before M19.

## M19 - First Real Region & Story Slice
- **Goal**: build the first real playable content using the clean pipeline.
- **Scope**: real map cluster, first NPC cast, first questline, one encounter/dungeon beat, rewards,
  faction/economy hooks, target-quality art/audio pass for the slice.
- **Exit criteria**: the old bootstrap-only runtime can be demoted to testing infrastructure while
  the real slice boots and plays through cleanly.

## MV3 - Real Slice Playtest Gate
- **Goal**: verify the first real slice together in a visible game session.
- **Scope**: navigation, interaction, quest flow, combat, inventory/equipment, save/load, game-over,
  UI readability, audio, and visual consistency.
- **Exit criteria**: user approves moving from first slice to broader production, or blockers are
  fixed/promoted.

## SR6 - Production Readiness Review
- **Goal**: decide whether the project is ready for broader world/story expansion.
- **Questions**:
  - Is adding content now mostly authoring work?
  - Are validation and tests catching broken references/state?
  - Is the asset pipeline repeatable enough for many maps and props?
  - Is save compatibility stable enough to start caring about migration discipline?
- **Exit criteria**: clear go/no-go for content expansion.

## M20 - World & Story Expansion
- **Goal**: expand from first slice toward the intended game.
- **Scope**: additional regions, quests, NPCs, factions, dungeons, items, encounters, art/audio, and
  authoring tools as needed.
- **Exit criteria**: enough content exists for a feature-complete alpha route.

## M21 - Alpha Stabilization
- **Goal**: stabilize the feature-complete game.
- **Scope**: bug fixing, balance, performance, save compatibility, UX polish, packaging/export, and
  content QA.
- **Exit criteria**: alpha build is playable end-to-end with known issues tracked and no major
  architectural blockers.
