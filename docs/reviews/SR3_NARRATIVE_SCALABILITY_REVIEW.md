# SR3 - Narrative Scalability Review

Date: 2026-06-28  
Scope: M11 quest/dialogue production pipeline + M12 NPC/faction/reputation, before M13
items/equipment/economy. Reviews whether the narrative systems can support real story production
(role-bearing NPCs, branching questlines, factions) without core rewrites.

## Verdict
The project can proceed to M13. The narrative architecture is structurally scalable: quests,
dialogues, NPCs, and factions are pure data with stable IDs, boot-time validation is strong and
fails loudly on broken references, branching is documented as an authoring contract, and the F10
Quest Debug overlay plus headless runners give real authoring/regression coverage.

No finding requires a rewrite. The real risks are **authoring safety and expressiveness**, not
architecture shape. One issue (dialogue soft-lock on a choice-less node) is a genuine footgun that
should be hardened before real branching dialogue is authored at volume; two expressiveness gaps
(single-condition quest objectives, static node text) should be closed before the first real story
act (M18). All are small, localized changes — none touch the system boundaries.

Consistent with SR1/SR2, this review does not change engine code. Findings are promoted to tracked
follow-up tasks.

## Strengths (evidence)
- **Definitions are fully data-driven and ref-validated at boot.** `DataRegistry.validate_all()`
  checks condition types and their referenced quests/items/enemies/maps/factions
  (`scripts/core/DataRegistry.gd:668-699`), dialogue action types and their refs
  (`:700-742`), quest stage `next`/`advance_on`/`rewards` and duplicate stages (`:354-381`),
  dialogue `entry`/node/choice `next` targets and speaker refs (`:383-420`), NPC
  faction/dialogue/home_map/role/services/quests_offered (`:318-336`), and faction relationship
  refs and reputation range (`:185-200`). Cross-table duplicate content IDs (`:146-167`) and
  duplicate `persistent_id`s (`:566-569`, `:657-659`) are also caught. This directly answers
  "are validations catching broken references/state?" — yes.
- **System separation holds.** `NPC.gd` carries no quest/inventory logic; it only emits
  `npc_talked` and opens its dialogue (`scripts/npcs/NPC.gd:23-27`). `Conditions.gd` is a shared
  pure predicate used by both quest advancement and dialogue gating (`scripts/core/Conditions.gd`).
  Dialogue actions route through the managers (`DialogueManager._run_actions`,
  `scripts/dialogue/DialogueManager.gd:73-97`).
- **Branching is a documented contract**, not ad-hoc: stage bands + outcome flags in
  `docs/architecture/QUEST_DIALOGUE_AUTHORING.md`, with `set_quest_stage` / `flag_not_set` support.
- **Authoring/regression tooling exists.** F10 `QuestDebugUI` shows live map/level/quests/stages/
  flags/factions/inventory (`scripts/ui/QuestDebugUI.gd`); `tests/headless/M11DialogueActionsRunner`
  and `M12FactionReputationRunner` cover dialogue actions, both branch outcomes, and reputation
  gates/persistence.

## Findings

### Medium-High - Dialogue can soft-lock on a node with zero visible choices
- **Evidence**: A dialogue node advances only through a choice. `DialogueManager.start()` pauses the
  tree (`scripts/dialogue/DialogueManager.gd:27`) and `choose()` only accepts an index within
  `_visible_choices` (`:31-34`). `DialogueBox._on_line_changed()` renders one button per choice and
  nothing else — no close/continue affordance (`scripts/ui/DialogueBox.gd:15-27`). If a reachable
  node has an empty `choices` array, or every choice is filtered out by its `conditions`
  (`DialogueManager._filter_choices`, `:52-59`), the box shows text with no buttons while the game
  stays paused. Validation only checks that `choices` is an array; it does not require a guaranteed
  unconditional exit (`DataRegistry._validate_dialogues`, `scripts/core/DataRegistry.gd:405-420`).
- **Risk**: Today's fixtures all provide exits, so this is latent. At real authoring volume
  (reactive NPCs with many condition-gated choices) it is easy to leave a state with no valid
  choice and hard-lock the player. This is the highest-priority narrative-safety gap.
- **Recommendation**: Make it impossible to soft-lock. Either (a) auto-end/auto-continue when a
  node yields zero visible choices, (b) always render a default "Leave" affordance in `DialogueBox`
  when choices are empty, and/or (c) add validation that every node provides at least one
  unconditional fallback choice. Recommended **before real branching dialogue authoring** (cheap
  hardening; ideally soon). Tracked as **SR3-F1**.

### Medium - Quest stage advancement supports only a single `advance_on` condition
- **Evidence**: `QuestManager._try_advance()` reads one condition per stage
  (`var cond = sd.get("advance_on", null)` then `Conditions.met(cond)`,
  `scripts/quest/QuestManager.gd:91-97`); validation also treats `advance_on` as a single dict
  (`scripts/core/DataRegistry.gd:374-375`). By contrast, dialogue choices accept a `conditions`
  **array** evaluated with `Conditions.all_met()` (`scripts/core/Conditions.gd:39-43`).
- **Risk**: A stage cannot require multiple simultaneous objectives ("have 3 herbs AND talked to the
  healer") or alternative completions ("kill OR bribe the guard") in one stage. Authors must split
  into sequential stages (AND-only) or push logic into dialogue. Manageable for a first act, but an
  expressiveness gap for richer questlines.
- **Recommendation**: Allow `advance_on` to be an array evaluated with `all_met` (AND), and consider
  an explicit `any_of` for OR. Low-risk, additive (a single-dict value can stay supported). Promote
  to **before M18** (first real story act). Tracked as **SR3-F2**.

### Medium - Dialogue node text and entry are static; no state-reactive lines
- **Evidence**: `DialogueManager.start()` always begins at the fixed `entry` node
  (`scripts/dialogue/DialogueManager.gd:25-26`) and `_show_node()` emits the node's literal `text`
  (`:43-50`). Only **choices** are condition-filtered; nodes themselves have no `conditions` and
  there is no node-selection-by-state. `NPC.gd` opens exactly one dialogue id per NPC
  (`scripts/npcs/NPC.gd:25-27`).
- **Risk**: A role-bearing NPC cannot vary its greeting/body text by quest state, reputation, or
  flags except by routing through a hub node whose *choices* are gated, or by authoring multiple
  dialogues. Workable but verbose across 10+ NPCs with several states each, and it pushes narration
  into choice labels.
- **Recommendation**: Add lightweight state reactivity — e.g. per-node `conditions` with a
  first-match/fallback resolver, or NPC dialogue selection by condition. Promote to **before M18**.
  Tracked as **SR3-F3**.

### Low - Conditions are AND-only with exact stage match; no OR/range/economy primitives
- **Evidence**: `Conditions.all_met()` only ANDs an array (`scripts/core/Conditions.gd:39-43`);
  `quest_stage_is` is exact equality (`:17-18`); there is no stage-range, no `gold_at_least`, and no
  generic negation beyond `flag_not_set` / `faction_reputation_below`.
- **Risk**: Reactions spanning a stage band (e.g. "any failure outcome 300-399") need one condition
  per stage or an outcome flag. The authoring contract already prescribes outcome flags, which
  covers most cases today.
- **Recommendation**: Add range / `any_of` / economy primitives when the first act needs them. Low
  priority; flags mitigate. Note only (no separate task yet).

### Low - No distinct "failed" quest state; failure is a completed stage
- **Evidence**: `GameState.quests` has only `active` / `completed`; `_complete()` moves any
  completing stage — including a 300-band failure stage — into `completed`
  (`scripts/quest/QuestManager.gd:114-118`), so the `quest_completed` condition is true for failures
  too (`scripts/core/Conditions.gd:24-25`).
- **Risk**: Post-quest logic cannot distinguish success from failure via `quest_completed` alone; it
  must read outcome flags. The authoring contract already mandates outcome flags, so this is
  contained, but it is a latent trap for authors who check only completion.
- **Recommendation**: Keep the outcome-flag convention; optionally record a `quest_outcome` map
  later. Low priority; note only.

### Low - Reputation is a global per-faction scalar with engine-constant thresholds
- **Evidence**: `FactionManager` hard-codes `HOSTILE_REPUTATION = -50` and
  `FRIENDLY_REPUTATION = 25` (`scripts/factions/FactionManager.gd:7-8`); reputation is a single
  player-vs-faction value (`:22-27`) with no per-NPC disposition or faction-to-faction reputation
  propagation.
- **Risk**: Fine for two factions and the first act. A larger world may want data-defined thresholds
  and relationship-driven reputation spread.
- **Recommendation**: Revisit at SR4 / production-region scale. Not needed now; note only.

## SR3 Questions

- **Can ten NPCs, five branching quests, and two factions be added without core rewrites?**
  Yes. NPCs, quests, dialogues, and factions are pure JSON with validated cross-references; no
  manager code changes are needed to add content (`NPC.gd` and `SceneLoader` are id-driven, factions
  initialize from data). The friction is authoring ergonomics (Findings F2/F3) and one safety gap
  (F1), not architecture. Current content is small and mostly fixtures (2 factions, 3 NPCs of which
  1 is real, 4 quests + 5 dialogues of which 1 quest/1 dialogue are real), but the systems' capacity
  is the point and it holds.
- **Are conditions/actions expressive enough for the first real story act?**
  Mostly. The action set is complete for production (flags, quest start/advance/stage, give/take
  item, rewards, reputation) and conditions cover items, kills, areas, talk, quest state, flags, and
  reputation. The gaps are single-condition quest objectives (F2), static node text (F3), and the
  lack of OR/range primitives (Low). For a *first* act these are workable via outcome flags and
  sequential stages; F2 and F3 should be closed before a *large* questline.
- **Are quest/debug tools adequate for authoring and regression checks?**
  Yes. Boot validation is strong, the F10 overlay exposes live quest/flag/faction/inventory state,
  and headless runners cover dialogue actions, both branch outcomes, and reputation. A future
  enhancement (a write-mode debug command to jump stages / set flags / set reputation for faster
  manual testing) would help but is not required.

## Required Follow-Up
- **SR3-F1 (before real branching dialogue; recommended soon)**: eliminate the dialogue soft-lock —
  auto-exit and/or a guaranteed "Leave" affordance when a node has zero visible choices, plus
  validation for an unconditional fallback.
- **SR3-F2 (before M18)**: allow multi-condition quest stage objectives (`advance_on` as an AND
  array; optional `any_of`).
- **SR3-F3 (before M18)**: add state-reactive dialogue (per-node conditions / state-selected entry
  or NPC dialogue selection).
- **Low / note-only**: OR/range/economy condition primitives, distinct quest failure state, and
  data-defined reputation thresholds — revisit when the first real region needs them (SR4).

## Decision
Proceed to M13 (items/equipment/economy/merchants). SR3 requires no blocking rewrite. Schedule
SR3-F1 as near-term narrative hardening and SR3-F2/F3 before M18 so the first real story act is
authored on safe, expressive narrative systems.
