# RPG Skeleton - Quest & Dialogue Authoring

Quest and dialogue authoring remains data-driven.

## Quest Rules
- Use stable IDs.
- Stages are explicit and may advance through conditions.
- Branch outcomes should use clear stage bands and flags.
- Rewards must reference data items only.

## Dialogue Rules
- Dialogue nodes can run actions and expose conditional choices.
- Use `entry_rules` for state-reactive openings.
- Avoid hardcoding story behavior in scripts.
- Fixture dialogue uses neutral `fixture_*` IDs and is test-only.
