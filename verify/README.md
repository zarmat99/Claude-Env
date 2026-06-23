# Aethermoor — Testing & Automation

Two complementary tools let the game be played and verified programmatically.

## 1. Headless verification harness (`verify/playthrough.mjs`)

Runs the **real game systems** (combat, inventory, skills, quests, dialogue,
factions, crafting, save/load) under Node via a tiny browser shim
(`verify/shim.mjs` provides `Phaser.Events.EventEmitter` + `localStorage`).
It plays through the core mechanics and asserts they behave correctly — no
browser required.

```bash
node verify/playthrough.mjs
```

Exit code `0` = all checks passed, `1` = failures. The run prints a per-check
PASS/FAIL list, a combat win-rate sample, and a findings summary.

Current status: **72 passed, 0 failed, 3 warnings** (warnings are balance
notes, not bugs — see below).

## 2. In-game automation API (`window.GameAPI`)

Exposed automatically when the game boots (`js/api/GameAPI.js`, installed from
`main.js`). Drives the **live** Phaser game, so anything it does matches what a
human player sees. Usable from the browser console or a Playwright
`page.evaluate(...)` driver.

```js
GameAPI.help();                 // list all methods
GameAPI.state();                // snapshot: scene, player, nearby NPCs/enemies, quests
await GameAPI.walkTo(103, 101); // steer the real movement system to a tile
GameAPI.talkTo('cael');         // open an NPC conversation
GameAPI.choose(0);              // pick a dialogue option
await GameAPI.autoFight();      // resolve a combat encounter
GameAPI.inventory();            // list items
GameAPI.equip('iron_sword');
GameAPI.save();
```

## Bugs found & fixed during verification

| Severity | Bug | Fix |
|----------|-----|-----|
| Critical | All NPC dialogue silently failed — `DialogueSystem` read `mod.DIALOGUES` but `dialogues.js` exports `DIALOGUE_TREES` | read `DIALOGUE_TREES` |
| Critical | Quest stage advance recursed infinitely (`advanceStage` emits `quest_stage_complete`; a listener re-called `advanceStage`) → stack overflow | removed the self-triggering listener |
| High | Main-quest objectives never progressed — engine listened for `talk`/`reach` but quest data uses `talk_to`/`visit_location`/`collect_item` | broadened objective-type matching |
| Medium | Combat kills never dropped gold — `generateLoot` read `enemy.goldRange` but enemies define `gold` | read `enemy.gold` |
| Medium | Unknown quest action types (`advance_stage`, `remove_items`) spammed warnings | added handlers (advance_stage = no-op, engine auto-advances) |
| Low | Crafting ingredient counts showed wrong (looked up `slot.id` instead of `slot.itemId`) | use `getItemCount`/`getItem` |

## Open findings (balance decisions, not fixed)

- **HP formula inconsistency**: character creation sets `maxHealth = race.health`,
  but `computeDerived()` (run on first equip/load) uses
  `race.health + END*10 + level*5`, so HP jumps after the first equip.
- **Sylveni & Vorrkai (STR 3) cannot equip the `iron_sword`** every character
  starts with (it requires STR 4). They must spend a bonus point on STR or get a
  different starting weapon.
