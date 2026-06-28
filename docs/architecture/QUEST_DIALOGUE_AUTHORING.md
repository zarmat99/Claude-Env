# Valdombra - Quest & Dialogue Authoring Conventions

This is the M11 contract for scalable narrative authoring. It keeps quests and dialogue mostly in
JSON while avoiding one-off scripts for story logic.

## Core Rule

Quest stages are objective state. Dialogue choices are decision points. Flags are persistent world
facts and consequences.

Use quest stages for "where is this quest now?" Use flags for "what did the player decide or cause?"
Use dialogue actions to connect the two.

## Stage Bands

Use sparse stage numbers so branches can grow without renumbering shipped saves:

- `0-99`: shared setup and mainline stages.
- `100-199`: first positive or mercy-style outcome branch.
- `200-299`: second profit, force, or selfish outcome branch.
- `300-399`: failure, refusal, or hostile outcome branch.
- `900-999`: cleanup, epilogue, or debug-only fixture endings.

These ranges are conventions, not hard engine limits. Once a quest ships in a save-compatible build,
never reuse or renumber existing stage IDs.

## Branching Pattern

Branching choices should:

1. Require the current quest stage with `quest_stage_is`.
2. Set one stable outcome flag.
3. Jump to a branch stage with `set_quest_stage`.
4. Put final rewards on the target completing quest stage whenever the reward belongs to quest
   completion.

Example:

```json
{
  "text": "Spare them.",
  "conditions": [
    { "type": "quest_stage_is", "quest": "quest_example", "stage": 20 },
    { "type": "flag_not_set", "flag": "quest_example_outcome_keep" }
  ],
  "actions": [
    { "type": "set_flag", "flag": "quest_example_outcome_spare" },
    { "type": "set_quest_stage", "quest": "quest_example", "stage": 100 }
  ],
  "next": null
}
```

## Flag Names

Use explicit, quest-scoped names:

- `quest_<slug>_outcome_<slug>` for mutually exclusive endings.
- `quest_<slug>_decision_<slug>` for important non-final choices.
- `world_<area>_<fact>` for world facts that outlive a single quest.

Do not use flags as temporary local variables inside a dialogue unless they represent something that
should survive save/load.

## Rewards And Items

Prefer quest-stage `rewards` for quest completion. Use dialogue `give_reward`, `give_item`, or
`take_item` for immediate side effects that are not the quest completion reward, such as payment
up front, handing over a key item, or removing a bribe.

If a dialogue choice consumes an item and completes a quest, order actions like this:

1. Set the outcome flag.
2. Take or give immediate items.
3. Set the quest stage.

## Conditions

Use positive conditions wherever possible:

- `quest_not_started` for quest offers.
- `quest_active` or `quest_stage_is` for in-progress dialogue.
- `quest_completed` plus outcome flags for post-quest reactions.
- `flag_set` and `flag_not_set` for consequence gates.

Avoid relying on dialogue node order to hide invalid choices. Every consequential choice should have
conditions that explain why it is available.

## Test Fixtures

Fixture content may live in `data/dialogues/dialogues.json` and `data/quests/quests.json` only when
it is named with an obvious fixture ID, for example `dialogue_m11_branch_fixture` or
`quest_m11_branch_fixture`. These fixtures should not be referenced by NPC data or maps unless the
task explicitly needs an in-game debug probe.

Use `tests/headless/M11DialogueActionsRunner.gd` for regression coverage and the in-game Quest
Debug overlay (`quest_debug_toggle`, F10 by default) for manual authoring checks. The overlay is a
read-only view of quest stages, completed quests, flags, inventory, and player reward state.
