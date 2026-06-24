import { AssetLoader } from "./core/AssetLoader.js";
import { validateContent } from "./core/ContentValidator.js";
import { Game } from "./core/Game.js";
import { ZoneManager } from "./world/ZoneManager.js";

const status = document.querySelector("#boot-status");
const canvas = document.querySelector("#game");

boot().catch(error => {
  console.error(error);
  status.textContent = error.stack || error.message;
});

async function boot() {
  setStatus("Loading data manifests...");
  const loader = new AssetLoader();
  const content = await loader.loadAll();

  setStatus("Validating content contract...");
  const validation = validateContent(content);
  if (!validation.ok) {
    throw new Error(`Content validation failed: ${validation.errors.slice(0, 3).join("; ")}`);
  }

  setStatus("Loading static start zone...");
  const params = new URLSearchParams(window.location.search);
  const zoneManager = new ZoneManager(content);
  const startZone = params.get("zone") || content.zonesDoc.startZone;
  const startSpawn = params.get("spawn") || content.zonesDoc.startSpawn;
  const world = zoneManager.loadZone(startZone, startSpawn);

  setStatus("Starting runtime...");
  const game = new Game(canvas, content, zoneManager, world, validation);
  window.Grimward = { content, validation, zoneManager, game };
  status.classList.add("is-hidden");
  game.start();
}

function setStatus(text) {
  status.textContent = text;
}
