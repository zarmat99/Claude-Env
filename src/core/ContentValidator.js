export const REQUIRED_COUNTS = [
  ["terrain.texture", 12],
  ["terrain.snow_ice", 12],
  ["terrain.rock_mountain", 12],
  ["terrain.grass_moss_mud", 12],
  ["terrain.road_path", 12],
  ["terrain.water", 12],
  ["terrain.transition", 12],
  ["terrain.decal", 8],
  ["vegetation.tree", 30],
  ["vegetation.bush", 20],
  ["vegetation.tall_grass", 20],
  ["vegetation.fallen_log", 15],
  ["vegetation.root", 15],
  ["vegetation.mushroom", 15],
  ["vegetation.rare_magical", 10],
  ["vegetation.dead_burnt", 10],
  ["nature.rock_small", 30],
  ["nature.rock_medium", 25],
  ["nature.rock_large", 20],
  ["nature.rock_huge", 10],
  ["nature.mountain_wall", 10],
  ["nature.ice_element", 10],
  ["nature.decorative", 10],
  ["building.house_modular", 20],
  ["building.hut", 10],
  ["building.special", 10],
  ["building.tower", 10],
  ["building.wall_gate", 15],
  ["building.bridge", 10],
  ["building.module", 15],
  ["building.village_decor", 20],
  ["dungeon.tile", 40],
  ["dungeon.wall", 20],
  ["dungeon.floor", 20],
  ["dungeon.column", 15],
  ["dungeon.door_gate", 15],
  ["dungeon.stairs_passage", 15],
  ["dungeon.trap", 20],
  ["dungeon.sacred_ruin", 20],
  ["dungeon.prop", 20],
  ["dungeon.entrance", 10],
  ["prop.common", 30],
  ["prop.storage", 20],
  ["prop.furniture", 20],
  ["prop.books_scrolls", 20],
  ["prop.smith_miner", 20],
  ["prop.kitchen_tavern", 20],
  ["prop.bones_debris", 20],
  ["prop.interactive", 20],
  ["prop.loot_container", 20],
  ["weapon.sword", 20],
  ["weapon.axe", 15],
  ["weapon.mace_hammer", 15],
  ["weapon.dagger", 15],
  ["weapon.bow", 15],
  ["weapon.crossbow", 10],
  ["weapon.staff", 15],
  ["weapon.rare_legendary", 20],
  ["armor.light", 15],
  ["armor.medium", 15],
  ["armor.heavy", 15],
  ["armor.mage_set", 10],
  ["armor.cloak", 10],
  ["armor.helm", 10],
  ["armor.gloves_boots", 10],
  ["armor.accessory", 20],
  ["creature.npc_human", 20],
  ["creature.bandit_warrior", 15],
  ["creature.mage_shaman", 10],
  ["creature.animal", 15],
  ["creature.hostile", 15],
  ["creature.undead", 10],
  ["creature.large", 10],
  ["creature.boss", 5],
  ["effect.magic", 20],
  ["effect.fire", 10],
  ["effect.ice", 10],
  ["effect.lightning", 10],
  ["effect.poison_shadow", 10],
  ["effect.smoke_dust", 10],
  ["effect.blood_impact", 10],
  ["effect.weather", 10],
  ["ui.inventory_icon", 100],
  ["ui.skill_icon", 30],
  ["ui.magic_icon", 20],
  ["ui.status_icon", 20],
  ["ui.element", 20],
  ["ui.health_mana_stamina_bar", 3],
  ["ui.inventory_window", 1],
  ["ui.dialogue_window", 1],
  ["ui.cursor", 4],
  ["ui.button", 8],
  ["ui.map_quest_menu_placeholder", 3]
];

export const REQUIRED_BIOMES = [
  "snow_forest",
  "rocky_mountain",
  "nordic_village",
  "ancient_ruins",
  "underground_dungeon",
  "ice_cave",
  "dark_swamp",
  "bandit_camp",
  "road",
  "boss_area"
];

const FORBIDDEN_TERMS = ["skyrim", "bethesda", "elder scrolls", "tamriel", "whiterun", "draugr"];

export function validateContent(content) {
  const errors = [];
  const warnings = [];
  const counts = {};

  for (const family of Object.values(content.families || {})) {
    counts[family.kind] = (counts[family.kind] || 0) + Number(family.count || 0);
    if (!content.collisionProfiles[family.collisionProfile]) {
      errors.push(`Family ${family.id} references missing collision profile ${family.collisionProfile}`);
    }
    if (!content.renderLayers[family.renderLayer]) {
      errors.push(`Family ${family.id} references missing render layer ${family.renderLayer}`);
    }
    if (!family.baseVisualSize || !family.baseVisualSize.w || !family.baseVisualSize.h) {
      errors.push(`Family ${family.id} is missing baseVisualSize`);
    }
    if (family.category === "creature") {
      const states = family.animationStates || [];
      for (const state of ["idle", "move", "attack", "death"]) {
        if (!states.includes(state)) errors.push(`Creature family ${family.id} misses animation state ${state}`);
      }
    }
  }

  for (const [kind, minimum] of REQUIRED_COUNTS) {
    const actual = counts[kind] || 0;
    if (actual < minimum) errors.push(`Kind ${kind} has ${actual}, requires ${minimum}`);
  }

  for (const biomeId of REQUIRED_BIOMES) {
    if (!content.biomes[biomeId]) errors.push(`Missing required biome ${biomeId}`);
  }

  for (const biome of content.biomeList || []) {
    for (const field of ["terrainTiles", "props", "spawnTable", "vegetationDensity", "rockDensity", "structureRules", "enemies", "loot", "overlapRules", "seed"]) {
      if (biome[field] === undefined) errors.push(`Biome ${biome.id} misses ${field}`);
    }
    for (const familyId of [...(biome.terrainTiles || []), ...(biome.props || []), ...(biome.enemies || []), ...(biome.loot || [])]) {
      if (!content.families[familyId] && familyId !== "ore_cache") {
        errors.push(`Biome ${biome.id} references missing family ${familyId}`);
      }
    }
    if (!content.spawnTables[biome.spawnTable]) errors.push(`Biome ${biome.id} references missing spawn table ${biome.spawnTable}`);
  }

  for (const [tableId, table] of Object.entries(content.spawnTables || {})) {
    for (const entry of [...(table.creatures || []), ...(table.loot || [])]) {
      if (!content.families[entry.family]) errors.push(`Spawn table ${tableId} references missing family ${entry.family}`);
    }
  }

  validateStaticZones(content, errors);

  const forbiddenHits = findForbiddenTerms(content.raw || content);
  for (const term of forbiddenHits) errors.push(`Forbidden protected-reference term found: ${term}`);

  const totalAssets = Object.keys(content.assets || {}).length;
  if (totalAssets < 800) warnings.push(`Expanded catalog has ${totalAssets} assets; expected a large RPG-scale set.`);

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    counts,
    totalAssets
  };
}

function validateStaticZones(content, errors) {
  const zones = content.zones || {};
  const mapsByZone = content.mapsByZone || {};
  if (!content.zonesDoc?.startZone) errors.push("zones.json misses startZone");
  if (content.zonesDoc?.startZone && !zones[content.zonesDoc.startZone]) {
    errors.push(`startZone references missing zone ${content.zonesDoc.startZone}`);
  }

  for (const zone of Object.values(zones)) {
    if (!mapsByZone[zone.zone_id]) errors.push(`Zone ${zone.zone_id} has no loaded map data`);
    if (!["test", "overworld", "city", "village", "interior", "dungeon", "cave", "ruin"].includes(zone.type)) {
      errors.push(`Zone ${zone.zone_id} has unsupported type ${zone.type}`);
    }
  }

  for (const [zoneId, map] of Object.entries(mapsByZone)) {
    if (!zones[zoneId]) errors.push(`Map exists for missing zone ${zoneId}`);
    if (!map.spawnPoints || Object.keys(map.spawnPoints).length === 0) errors.push(`Map ${map.mapId || zoneId} has no spawnPoints`);
    for (const shape of [...(map.terrain || []), ...(map.blockingTerrain || [])]) {
      const familyId = shape.family;
      const fallback = shape.fallbackFamily;
      if (!content.families[familyId] && !content.families[fallback]) {
        errors.push(`Map ${map.mapId || zoneId} references missing terrain family ${familyId}`);
      }
    }
    for (const group of map.modularObjects || []) {
      if (!content.families[group.family]) errors.push(`Map ${map.mapId || zoneId} references missing object family ${group.family}`);
    }
    for (const npc of map.npcs || []) {
      if (!content.families[npc.family]) errors.push(`Map ${map.mapId || zoneId} references missing NPC family ${npc.family}`);
    }
  }

  for (const entrance of Object.values(content.entrancesById || {})) {
    if (!zones[entrance.zoneId]) errors.push(`Entrance ${entrance.id} references missing source zone ${entrance.zoneId}`);
    if (!zones[entrance.destination?.zoneId]) errors.push(`Entrance ${entrance.id} references missing destination zone ${entrance.destination?.zoneId}`);
    if (!content.families[entrance.assetFamily]) errors.push(`Entrance ${entrance.id} references missing asset family ${entrance.assetFamily}`);
    const destMap = mapsByZone[entrance.destination?.zoneId];
    if (destMap && !destMap.spawnPoints?.[entrance.destination.spawnPoint]) {
      errors.push(`Entrance ${entrance.id} destination spawn ${entrance.destination.spawnPoint} is missing in ${entrance.destination.zoneId}`);
    }
  }

  for (const [zoneId, entries] of Object.entries(content.placedObjectsByZone || {})) {
    if (!zones[zoneId]) errors.push(`placed_objects references missing zone ${zoneId}`);
    for (const entry of entries) {
      if (!content.families[entry.family]) errors.push(`Placed object ${entry.id} references missing family ${entry.family}`);
    }
  }
}

function findForbiddenTerms(value) {
  const text = JSON.stringify(value).toLowerCase();
  return FORBIDDEN_TERMS.filter(term => text.includes(term));
}
