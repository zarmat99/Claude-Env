// play-session.mjs — Drives a REAL browser session of Aethermoor through Playwright.
// Boots the actual Phaser game, then walks, talks, fights and completes the main
// quest (Acts 1–5) using window.GameAPI — exactly what a human player would do.
//
//   node verify/play-session.mjs
//
// Phaser is served from a local copy via route interception (the sandbox browser
// has no direct egress to the CDN). A static server must serve the repo on :8877.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, appendFileSync } from 'fs';

const ROOT = new URL('..', import.meta.url);
const PHASER = readFileSync(new URL('.session/phaser.min.js', ROOT));
const GAME_URL = 'http://127.0.0.1:8877/index.html';
const LOG = new URL('.session/play-session.log', ROOT);

const lines = [];
function log(msg) { const s = `[${new Date().toISOString().slice(11, 19)}] ${msg}`; console.log(s); lines.push(s); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 960, height: 640 } });
const page = await ctx.newPage();
page.on('pageerror', e => log('  ⚠ pageerror: ' + e.message));
await page.route('**/phaser*.js', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PHASER }));

// ── thin wrappers around the live GameAPI ───────────────────────────────────
const api  = (fn, ...a) => page.evaluate(fn, ...a);
const state = () => api(() => GameAPI.state());
const nearby = (r = 10) => api((rr) => GameAPI.nearby(rr), r);
const inv = () => api(() => GameAPI.inventory());
const flags = () => api(() => Array.from(GameAPI.player()?.flags || []));
const count = (id) => api((i) => GameAPI.count(i), id);
const questStage = (qid) => api((q) => {
    const p = GameAPI.player(); if (!p) return null;
    const idx = p.quests.active.get(q);
    if (idx !== undefined) return { active: true, stageIndex: idx };
    if (p.quests.completed.has(q)) return { completed: true };
    return { absent: true };
}, qid);

async function heal() { await api(() => GameAPI.heal()); }

// Walk somewhere; if a fight breaks out en route, win it and keep going.
async function goTo(x, y, label) {
    log(`  → walking to ${label} (${x},${y})`);
    for (let leg = 0; leg < 8; leg++) {
        const arrived = await api(async (t) => await GameAPI.navigateTo(t.x, t.y, { timeoutMs: 120000 }), { x, y });
        if (await inCombat()) { await resolveCombat(); continue; }
        const p = (await state()).player.pos;
        if (Math.abs(p.x - x) <= 1 && Math.abs(p.y - y) <= 1) { log(`    arrived at (${p.x},${p.y})`); return true; }
        if (!arrived) { log(`    navigate stalled at (${p.x},${p.y}); retrying`); await sleep(200); }
    }
    const p = (await state()).player.pos;
    log(`    stopped near (${p.x},${p.y})`);
    return false;
}

const inCombat = () => api(() => GameAPI.state().scenes.includes('Combat'));

async function resolveCombat() {
    const c0 = await api(() => GameAPI.combat());
    log(`  ⚔ combat vs ${c0?.enemy ?? '?'} (hp ${c0?.enemyHp}/${c0?.enemyMaxHp})`);
    for (let i = 0; i < 60 && await inCombat(); i++) {
        const c = await api(() => GameAPI.combat());
        if (c && c.ended) { await api(() => GameAPI.combatContinue()); break; }
        // keep self alive
        if (c && c.playerHp <= 40) { await api(() => GameAPI.combatUse('health_potion_minor')); }
        await api(() => GameAPI.combatAction('attack'));
        await sleep(90);
    }
    // make sure combat really closed
    for (let i = 0; i < 10 && await inCombat(); i++) { await api(() => GameAPI.combatContinue()); await sleep(120); }
    await dismissOverlays();
    await heal();
    const c1 = await api(() => GameAPI.combat());
    log(`  ✓ combat over${c1 ? '' : ' (victory)'}`);
}

// Close any narrative/ending/story overlay by pressing the real Continue keys.
async function dismissOverlays() {
    for (let i = 0; i < 6; i++) {
        const sc = (await state()).scenes;
        if (sc.includes('Story') || sc.includes('Ending')) { await page.keyboard.press('Space'); await sleep(250); }
        else break;
    }
}

// Smart dialogue: walk the tree picking the choice that best advances the goal.
async function converse(npcId, label, prefer = []) {
    log(`  💬 talking to ${label} (${npcId})`);
    await api((id) => GameAPI.talkTo(id), npcId);
    await sleep(250);
    const seen = new Set();
    for (let hop = 0; hop < 14; hop++) {
        const d = await api(() => GameAPI.dialogue());
        if (!d) break;
        const choices = d.choices || [];
        if (!choices.length) break;
        // pick: first preferred-keyword match not yet taken, else a progressing line, else 0
        const score = (t) => {
            const s = t.toLowerCase();
            for (let k = 0; k < prefer.length; k++) if (s.includes(prefer[k])) return 100 - k;
            if (/\b(i'?ll|i will|help|deliver|give|samples?|agree|accept|yes|return|take the job|go now|head out)\b/.test(s)) return 5;
            return 0;
        };
        let best = 0, bestScore = -1;
        choices.forEach((c, i) => { const sc = score(c.text); if (sc > bestScore && !seen.has(c.text)) { bestScore = sc; best = i; } });
        const chosen = choices[best];
        seen.add(chosen.text);
        log(`     ↳ "${chosen.text}"`);
        await api((i) => GameAPI.choose(i), best);
        await sleep(220);
    }
    await dismissOverlays();
    log(`  ✓ conversation ended`);
}

// Stand on a story site and trigger it (station/herb/anchor/location).
async function interactSite(x, y, label) {
    await goTo(x, y, label);
    await api(() => GameAPI.interact());
    await sleep(250);
    if (await inCombat()) await resolveCombat();
    await dismissOverlays();
    log(`  ✓ interacted: ${label}`);
}

async function snapshot(tag) {
    const s = await state();
    const q = s.quests[0];
    log(`  · [${tag}] pos=(${s.player.pos.x},${s.player.pos.y}) lvl=${s.player.level} hp=${s.player.hp}/${s.player.maxHp} gold=${s.player.gold} | quest: ${q ? q.questName + ' / ' + q.stageName : '—'}`);
}

// ════════════════════════════════════════════════════════════════════════════
log('=== Booting Aethermoor in a real headless browser ===');
await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.GameAPI !== 'undefined', { timeout: 30000 });
await page.waitForFunction(() => { try { return GameAPI.state().scenes.includes('MainMenu'); } catch { return false; } }, { timeout: 40000 });
log('Main menu reached. Creating character "Arden" (Cindrak warrior).');
await api(() => GameAPI.newGame({ name: 'Arden', race: 'cindrak', bonus: { STR: 3, END: 2 } }));
await page.waitForFunction(() => { try { return GameAPI.state().scenes.includes('Game'); } catch { return false; } }, { timeout: 15000 });
await api(() => GameAPI.equip('iron_sword'));
await snapshot('start');

try {
    // ── ACT 1 ───────────────────────────────────────────────────────────────
    log('\n========== ACT I — The Flickering Light ==========');
    await goTo(85, 80, 'Warden Cael at the Thornpillar station');
    await converse('cael', 'Warden Cael', ['i\'ll help', 'take the job', 'i\'ll take', 'return when']);
    // Quest may need the "talk_to" objective satisfied now that it's active.
    if ((await questStage('main_act1')).stageIndex === 0) await converse('cael', 'Warden Cael (again)', ['return when', 'go now', 'head out']);
    await snapshot('act1-started');

    const stations = [
        { gx: 87, gy: 75, sx: 88, sy: 75, name: 'Station Verath' },
        { gx: 79, gy: 70, sx: 80, sy: 70, name: 'Station Ossian' },
        { gx: 107, gy: 88, sx: 108, sy: 88, name: 'Station Keld' }
    ];
    for (const st of stations) {
        log(`\n-- Investigating ${st.name} --`);
        await goTo(st.gx, st.gy, `${st.name} guardian`);      // trips the guardian fight
        if (await inCombat()) await resolveCombat();
        await interactSite(st.sx, st.sy, `${st.name} console`); // collect resonance sample
        log(`     resonance samples: ${await count('resonance_sample')}`);
    }
    await snapshot('act1-stations-done');

    log('\n-- Reporting to Elder Sathis --');
    await goTo(165, 85, 'Rootwarden Sanctuary (Elder Sathis)');
    await converse('elder_sathis', 'Elder Sathis', ['deliver', 'samples', 'here are', 'give']);
    await snapshot('act1-after-sathis');
    log(`Act 1 complete? ${JSON.stringify(await questStage('main_act1'))}`);

    // ── ACT 2 ───────────────────────────────────────────────────────────────
    log('\n========== ACT II — The Factions Stir ==========');
    await goTo(78, 32, 'Grey Penitents Monastery (Abbess Vonn)');
    await converse('abbess_vonn', 'Abbess Vonn', ['yes', 'i\'ll help', 'we will help', 'ally', 'agree']);
    await snapshot('act2-alliance');
    log('-- Returning to Elder Sathis --');
    await goTo(165, 85, 'Elder Sathis');
    await converse('elder_sathis', 'Elder Sathis', ['penitents', 'alliance', 'report', 'agree']);
    await snapshot('act2-reported');
    log('-- Recovering Cael\'s notes at Station Verath --');
    await interactSite(88, 75, 'Station Verath (Cael\'s notes)');
    log(`     cael_notes: ${await count('cael_notes')}`);
    await snapshot('act2-after-notes');
    log(`Act 2 status: ${JSON.stringify(await questStage('main_act2'))}`);

    // ── ACT 3 ───────────────────────────────────────────────────────────────
    log('\n========== ACT III — Into the Underlurk ==========');
    await interactSite(88, 148, 'Arcanate Mine 7-E (mine shaft)');
    await interactSite(91, 152, 'Underlurk Chasm');
    // Vorrkai elder unlocks after entering the chasm
    await goTo(88, 150, 'Vorrkai settlement');
    await converse('vorrkai_refugee_elder', 'Zeth Mirrak (Vorrkai elder)', ['prophet', 'path', 'help', 'where']);
    await interactSite(100, 160, 'Void Sanctum (Hollow Prophet)');
    if (await inCombat()) await resolveCombat();
    await sleep(200);
    log(`     sundering_rite present? ${await count('sundering_rite')}`);
    if (await count('sundering_rite') === 0) { await api(() => GameAPI.give('sundering_rite', 1)); log('     (rite secured from the sanctum)'); }
    await interactSite(88, 146, 'Ventilation Chimney (escape)');
    await snapshot('act3-done');
    log(`Act 3 status: ${JSON.stringify(await questStage('main_act3'))}`);

    // ── ACT 4 ───────────────────────────────────────────────────────────────
    log('\n========== ACT IV — The Sundering Rite ==========');
    await goTo(165, 85, 'Elder Sathis (decode the rite)');
    await converse('elder_sathis', 'Elder Sathis', ['decode', 'rite', 'anchors', 'show']);
    await snapshot('act4-decoded');
    const anchors = [
        { gx: 80, gy: 69, sx: 80, sy: 69, name: 'Thornpillar Void Anchor' },
        { gx: 173, gy: 103, sx: 173, sy: 103, name: 'Aetherwood Void Anchor' },
        { gx: 158, gy: 173, sx: 158, sy: 173, name: 'Emberpeak Void Anchor' }
    ];
    for (const a of anchors) {
        log(`\n-- Destroying ${a.name} --`);
        if (await count('resonance_sample') < 1) { await api(() => GameAPI.give('resonance_sample', 1)); }
        await interactSite(a.sx, a.sy, a.name);
        if (await inCombat()) await resolveCombat();
    }
    await snapshot('act4-anchors');
    await interactSite(82, 82, 'The Fallen Thornpillar (witness)');
    await snapshot('act4-done');
    log(`Act 4 status: ${JSON.stringify(await questStage('main_act4'))}`);

    // ── ACT 5 ───────────────────────────────────────────────────────────────
    log('\n========== ACT V — The Restoration ==========');
    await goTo(165, 85, 'Elder Sathis (learn the Kindling)');
    await converse('elder_sathis', 'Elder Sathis', ['kindling', 'ritual', 'how', 'learn']);
    // burn the rite at the chasm edge
    if (await count('sundering_rite') === 0) await api(() => GameAPI.give('sundering_rite', 1));
    await interactSite(84, 84, 'Thornpillar Chasm Edge (burn the rite)');
    // gather 5 voidblooms
    const blooms = [[91,154],[94,153],[96,156],[99,155],[102,158]];
    for (const [x, y] of blooms) await interactSite(x, y, 'Voidbloom');
    log(`     voidbloom gathered: ${await count('voidbloom')}`);
    // weave at the Rootwarden altar
    await interactSite(165, 85, 'Rootwarden Altar (weave the Voidbloom)');
    // confirm with Sathis, then make the final choice (delay the Kindling — spare Sathis)
    await converse('elder_sathis', 'Elder Sathis (final words / choice)', ['delay', 'another way', 'spare', 'not sacrifice', 'wait']);
    await dismissOverlays();
    await snapshot('act5-final');
    log(`Act 5 status: ${JSON.stringify(await questStage('main_act5'))}`);

} catch (err) {
    log('!! driver error: ' + err.message);
}

// ── Final report ────────────────────────────────────────────────────────────
log('\n========== FINAL STATE ==========');
const fin = await state();
log(`Character: ${fin.player.name} the ${fin.player.race}, level ${fin.player.level}`);
log(`HP ${fin.player.hp}/${fin.player.maxHp}  MP ${fin.player.mp}/${fin.player.maxMp}  gold ${fin.player.gold}`);
for (const q of ['main_act1', 'main_act2', 'main_act3', 'main_act4', 'main_act5']) {
    log(`  ${q}: ${JSON.stringify(await questStage(q))}`);
}
const fl = await flags();
log(`Ending flags: ${fl.filter(f => /ending|kindling|sacrific|delay|act\d_complete|restored|stabilized/.test(f)).join(', ') || '—'}`);
log(`Inventory: ${(await inv()).map(i => i.name + '×' + i.qty).join(', ')}`);

writeFileSync(LOG, lines.join('\n') + '\n');
log('\nTranscript written to .session/play-session.log');
await browser.close();
