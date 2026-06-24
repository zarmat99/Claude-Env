const DATA_URLS = {
  manifest: "assets/data/asset_manifest.json",
  biomes: "assets/data/biomes.json",
  spawnTables: "assets/data/spawn-tables.json",
  maps: "assets/data/maps.json",
  zones: "assets/data/zones.json",
  entrances: "assets/data/entrances.json",
  interiors: "assets/data/interiors.json",
  dungeons: "assets/data/dungeons.json",
  biomeRules: "assets/data/biome_rules.json",
  placedObjects: "assets/data/placed_objects.json"
};

export class AssetLoader {
  async loadAll() {
    const [manifest, biomes, spawnTables, maps, zones, entrances, interiors, dungeons, biomeRules, placedObjects] = await Promise.all([
      loadJson(DATA_URLS.manifest),
      loadJson(DATA_URLS.biomes),
      loadJson(DATA_URLS.spawnTables),
      loadJson(DATA_URLS.maps),
      loadJson(DATA_URLS.zones),
      loadJson(DATA_URLS.entrances),
      loadJson(DATA_URLS.interiors),
      loadJson(DATA_URLS.dungeons),
      loadJson(DATA_URLS.biomeRules),
      loadJson(DATA_URLS.placedObjects)
    ]);

    const mapFiles = await Promise.all((maps.maps || []).map(async entry => [entry.zoneId, await loadJson(entry.file)]));
    return buildContentIndex({
      manifest,
      biomes,
      spawnTables,
      maps,
      zones,
      entrances,
      interiors,
      dungeons,
      biomeRules,
      placedObjects,
      mapFiles: Object.fromEntries(mapFiles)
    });
  }
}

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Cannot load ${url}: ${response.status}`);
  }
  return response.json();
}

export function buildContentIndex(raw) {
  const { manifest, biomes, spawnTables, maps, zones, entrances, interiors, dungeons, biomeRules, placedObjects, mapFiles } = raw;
  const collisionProfiles = manifest.collisionProfiles || {};
  const renderLayers = Object.fromEntries((manifest.renderLayers || []).map(layer => [layer.id, layer]));
  const families = {};
  const assets = {};
  const assetsByKind = {};
  const assetsByFamily = {};

  for (const family of manifest.families || []) {
    families[family.id] = family;
    assetsByFamily[family.id] = [];
    const count = Number(family.count || 0);
    for (let i = 1; i <= count; i++) {
      const variant = String(i).padStart(2, "0");
      const asset = {
        ...family,
        id: `${family.id}_${variant}`,
        familyId: family.id,
        variant,
        variantIndex: i,
        imagePath: `assets/generated/${family.id}/${family.id}_${variant}.png`,
        collision: collisionProfiles[family.collisionProfile] || collisionProfiles.none,
        layer: renderLayers[family.renderLayer] || renderLayers.ground
      };
      assets[asset.id] = asset;
      assetsByFamily[family.id].push(asset);
      if (!assetsByKind[family.kind]) assetsByKind[family.kind] = [];
      assetsByKind[family.kind].push(asset);
    }
  }

  const biomeById = Object.fromEntries((biomes.biomes || []).map(biome => [biome.id, biome]));
  const zonesById = Object.fromEntries((zones?.zones || []).map(zone => [zone.zone_id, zone]));
  const entrancesById = Object.fromEntries((entrances?.entrances || []).map(entrance => [entrance.id, entrance]));
  const entrancesByZone = {};
  for (const entrance of entrances?.entrances || []) {
    if (!entrancesByZone[entrance.zoneId]) entrancesByZone[entrance.zoneId] = [];
    entrancesByZone[entrance.zoneId].push(entrance);
  }
  const mapsByZone = mapFiles || {};
  const placedObjectsByZone = placedObjects?.zones || {};

  return {
    raw,
    manifest,
    biomes: biomeById,
    biomeList: biomes.biomes || [],
    spawnTables: spawnTables.spawnTables || {},
    mapsDoc: maps || { maps: [] },
    zonesDoc: zones || { zones: [], startZone: null },
    entrancesDoc: entrances || { entrances: [] },
    interiorsDoc: interiors || { interiors: [] },
    dungeonsDoc: dungeons || { dungeons: [] },
    biomeRulesDoc: biomeRules || { rules: [] },
    placedObjectsDoc: placedObjects || { zones: {} },
    zones: zonesById,
    entrancesById,
    entrancesByZone,
    mapsByZone,
    placedObjectsByZone,
    collisionProfiles,
    renderLayers,
    families,
    assets,
    assetsByKind,
    assetsByFamily
  };
}

export function pickAsset(content, familyId, rng, fallbackKind = null) {
  let list = content.assetsByFamily[familyId];
  if ((!list || list.length === 0) && fallbackKind) list = content.assetsByKind[fallbackKind];
  if (!list || list.length === 0) return null;
  return list[Math.floor(rng.next() * list.length) % list.length];
}
