# SR4 Systems Stress Review

Date: 2026-06-29

## Verdict

Proceed to M16. The architecture remains scalable enough for the next milestone. SR4 found no
blocking rewrite before production-region work, provided the next milestones keep the current split:
core systems stay data-driven, the Village/Forest/Cave slice remains dev/regression content, and
large real content enters through governed authoring pipelines.

## Stress Method

SR4 uses `tests/headless/SR4SystemsStressRunner.gd` instead of permanently bloating production JSON.
The runner clones `DataRegistry` tables in memory, injects a synthetic content set, validates it,
exercises save/load in mid-flow, then restores the real project data and validates again.

The injected dataset reaches the planned review scale:
- 10+ maps, including several authored dungeon-like maps.
- 20 NPCs with roles, services, quest offers, home maps, and merchant links.
- 10 quests with staged objective/reward flow.
- 50 items with valid stackability/value metadata.
- 5 factions and 4 merchants.
- Authored dungeon objects, collision rectangles, encounter metadata, gates, rewards, and persistent IDs.

## Results

- Data validation: passed with the synthetic dataset and again after restoring real data.
- Save/load: passed in a mid-flow state containing current map, inventory, completed quest, faction
  reputation, kill counters, and door/switch/enemy/chest persistent world-object states.
- Quest flow: passed through event-driven `has_item` advancement and completion rewards.
- Authoring ergonomics: acceptable for controlled fixture scale. Data contracts catch bad refs and
  missing shape early enough to protect content work.
- Performance/headless runtime: acceptable for this phase; SR4 completes quickly in the regression suite.

## Findings

- No blocking system rewrite is required before M16.
- Large content should not be hand-expanded directly into the live JSON during reviews. The SR4
  in-memory stress pattern is now the preferred way to test scale without turning fixtures into
  accidental production content.
- Authoring larger real regions will still need better production tooling: summaries, lint output,
  and possibly generation/export helpers. This is useful before M18 but not blocking M16.
- Player-facing persistence remains the largest near-term gap: debug F5/F9 works, but normal
  save-slot UX, autosave rules, migration handling, and game-over/respawn belong in M16.

## Follow-Ups

- **SR4-F1 / M16**: build player-facing save/load UX, slot management, autosave/error feedback, and
  save migration/rejection policy.
- **SR4-F2 / M17-M18**: create at least one governed production-style region fixture before removing
  or demoting the dev sandbox.
- **SR4-F3 / before M18**: add authoring summaries or tooling for larger JSON datasets so designers
  can audit counts, broken refs, and content coverage without reading raw files.
