import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildContentIndex } from "../src/core/AssetLoader.js";
import { validateContent } from "../src/core/ContentValidator.js";

const root = process.cwd();

const raw = {
  manifest: await readJson("assets/data/asset_manifest.json"),
  biomes: await readJson("assets/data/biomes.json"),
  spawnTables: await readJson("assets/data/spawn-tables.json"),
  maps: await readJson("assets/data/maps.json"),
  zones: await readJson("assets/data/zones.json"),
  entrances: await readJson("assets/data/entrances.json"),
  interiors: await readJson("assets/data/interiors.json"),
  dungeons: await readJson("assets/data/dungeons.json"),
  biomeRules: await readJson("assets/data/biome_rules.json"),
  placedObjects: await readJson("assets/data/placed_objects.json")
};

raw.mapFiles = Object.fromEntries(await Promise.all(raw.maps.maps.map(async entry => [entry.zoneId, await readJson(entry.file)])));

const content = buildContentIndex(raw);
const result = validateContent(content);

console.log(`Expanded assets: ${result.totalAssets}`);
console.log(`Families: ${Object.keys(content.families).length}`);
console.log(`Biomes: ${content.biomeList.length}`);
console.log(`Static zones: ${Object.keys(content.zones).length}`);
console.log(`Static maps: ${Object.keys(content.mapsByZone).length}`);

if (result.warnings.length) {
  console.warn("Warnings:");
  for (const warning of result.warnings) console.warn(`- ${warning}`);
}

if (!result.ok) {
  console.error("Errors:");
  for (const error of result.errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Content validation passed.");

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), "utf8"));
}
