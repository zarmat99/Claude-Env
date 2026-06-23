// driver-server.mjs — keeps ONE live browser game session open and executes
// commands sent to it via a file mailbox, so the session can be driven
// step-by-step (observe → reason → act) instead of one batch script.
//
//   node verify/driver-server.mjs   (run in background)
//
// Mailbox: write .session/cmd.json {id, code}  → reads .session/out.json {id, ok, value}
// `code` is a JS body evaluated in the page with GameAPI in scope; may use await.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const ROOT = new URL('..', import.meta.url);
const PHASER = readFileSync(new URL('.session/phaser.min.js', ROOT));
const CMD = new URL('.session/cmd.json', ROOT);
const OUT = new URL('.session/out.json', ROOT);
const GAME_URL = 'http://127.0.0.1:8877/index.html';

const browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 960, height: 640 } });
const page = await ctx.newPage();
page.on('pageerror', e => console.log('pageerror:', e.message));
await page.route('**/phaser*.js', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: PHASER }));
await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => typeof window.GameAPI !== 'undefined', { timeout: 30000 });
await page.waitForFunction(() => { try { return GameAPI.state().scenes.length > 0; } catch { return false; } }, { timeout: 40000 });

writeFileSync(OUT, JSON.stringify({ id: 0, ok: true, value: 'ready' }));
console.log('driver-server ready');

let lastId = 0;
// Expose a real keypress helper to command code via window.__press
await page.exposeFunction('__pressKey', async (key) => { await page.keyboard.press(key); return true; });

while (true) {
    let cmd = null;
    try { if (existsSync(CMD)) cmd = JSON.parse(readFileSync(CMD, 'utf8')); } catch { /* mid-write */ }
    if (cmd && cmd.id > lastId) {
        lastId = cmd.id;
        if (cmd.code === '__quit__') { writeFileSync(OUT, JSON.stringify({ id: cmd.id, ok: true, value: 'bye' })); break; }
        try {
            const value = await page.evaluate(async (code) => {
                const fn = new Function('GameAPI', 'press', 'sleep', `return (async () => { ${code} })();`);
                const press = (k) => window.__pressKey(k);
                const sleep = (ms) => new Promise(r => setTimeout(r, ms));
                return await fn(window.GameAPI, press, sleep);
            }, cmd.code);
            writeFileSync(OUT, JSON.stringify({ id: cmd.id, ok: true, value }));
        } catch (e) {
            writeFileSync(OUT, JSON.stringify({ id: cmd.id, ok: false, error: String(e && e.message || e) }));
        }
    }
    await new Promise(r => setTimeout(r, 80));
}
await browser.close();
console.log('driver-server stopped');
