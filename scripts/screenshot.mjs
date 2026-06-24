// Headless screenshot harness for visual/graphics testing.
//
// Boots the dev server, loads the game in a Chromium page (phone viewport by
// default), waits for assets to load and a few frames to render, then writes a
// PNG. See CLAUDE.md ("Testing the graphics") for the full workflow.
//
// Usage:
//   node scripts/screenshot.mjs [outfile.png] [--desktop]
//
// Browsers are expected to be pre-provisioned (Claude Code web environment
// ships Chromium under /opt/pw-browsers). The script auto-detects the binary.

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const out = process.argv.find(a => a.endsWith(".png")) || "screenshot.png";
const desktop = process.argv.includes("--desktop");
const port = Number(process.env.PORT || 4173);

function findChromium() {
  // Prefer Playwright's own download if present, else scan the provisioned dir.
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (existsSync(base)) {
    const dirs = readdirSync(base).filter(d => d.startsWith("chromium-"));
    for (const d of dirs) {
      const bin = join(base, d, "chrome-linux", "chrome");
      if (existsSync(bin)) return bin;
    }
  }
  return undefined; // let Playwright resolve its managed browser
}

const server = spawn("node", ["scripts/serve.mjs"], {
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "inherit"]
});
await new Promise(resolve => {
  server.stdout.on("data", d => { if (String(d).includes("dev server")) resolve(); });
  setTimeout(resolve, 2000);
});

const executablePath = findChromium();
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const context = await browser.newContext(
  desktop
    ? { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }
    : { viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
);
const page = await context.newPage();
const problems = [];
page.on("pageerror", e => problems.push("pageerror: " + e.message));
page.on("response", r => { if (r.status() >= 400 && !r.url().endsWith("/favicon.ico")) problems.push(r.status() + " " + r.url()); });

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(3500); // let image assets decode and the loop render

await page.screenshot({ path: out });
console.log("screenshot:", out);
console.log("problems:", problems.length ? "\n  " + problems.join("\n  ") : "none");

await browser.close();
server.kill();
process.exit(0);
