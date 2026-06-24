# Live browser playthrough harness

Drives a **real** Aethermoor session (Phaser game running in a headless Chromium
browser) through `window.GameAPI` — walking, talking and fighting exactly as a
human player would, with no rendering bypassed.

## Setup

```bash
npm install                      # installs playwright (uses the system Chromium)
mkdir -p .session
# vendor Phaser locally (the sandbox browser has no direct CDN egress)
curl -L -o .session/phaser.min.js https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js
python3 -m http.server 8877 --bind 127.0.0.1 &   # serve the repo
```

## Two ways to play

**Batch run** — plays the whole main quest (Acts 1–5) end to end and writes a
transcript to `.session/play-session.log`:

```bash
node verify/play-session.mjs
```

**Step-by-step (reflective) driving** — keeps one live session open and runs
commands you send to it, so you can observe state, reason, then act:

```bash
node verify/driver-server.mjs &     # holds the live session open
# send one command at a time; `code` is a JS body with GameAPI/press/sleep in scope:
node verify/do.mjs "return GameAPI.state();"
node verify/do.mjs "await GameAPI.navigateTo(85,80); GameAPI.talkTo('cael'); return GameAPI.dialogue();"
node verify/do.mjs "__quit__"        # stop the session
```

## Notes
- `GameAPI` methods: `state()`, `nearby(r)`, `newGame(opts)`, `navigateTo(x,y)`,
  `await talkTo(id)` (walks to the NPC step-by-step, no teleport), `choose(i)`,
  `interact()`, `combatAction(k)`, `combatContinue()`, `heal()`, `teleport(x,y)`
  (debug only), `count(id)`, `give(id,n)`. Run `GameAPI.help()`.
- The driver also exposes `press(key)` for real key presses (e.g. dismissing the
  Story/Ending overlays with `Space`).
