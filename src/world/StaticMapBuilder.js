import { WorldState } from "./WorldState.js";

export class StaticMapBuilder {
  constructor(content) {
    this.content = content;
  }

  build(zoneId, spawnPointId = "player_start", memory = null) {
    const zone = this.content.zones[zoneId];
    if (!zone) throw new Error(`Unknown zone ${zoneId}`);
    const map = this.content.mapsByZone[zoneId];
    if (!map) throw new Error(`No map data for zone ${zoneId}`);

    const width = map.width;
    const height = map.height;
    const tileSize = map.tileSize || 48;
    const tiles = new Array(width * height);
    const objects = [];
    const spawns = [];
    const loot = [];

    fillTiles(this.content, tiles, width, height, map.defaultTerrain, map.defaultTerrain);
    applyShapes(this.content, tiles, width, height, map.terrain || []);
    if (!map.carveFromTerrain) applyShapes(this.content, tiles, width, height, map.blockingTerrain || []);

    for (const group of map.modularObjects || []) {
      for (const tile of group.tiles || []) {
        placeObject(this.content, objects, loot, group.family, tile, {
          id: `${zoneId}_${group.family}_${tile[0]}_${tile[1]}`,
          variant: group.variant,
          solid: group.solid
        }, tileSize);
      }
    }

    for (const placed of this.content.placedObjectsByZone[zoneId] || []) {
      placeObject(this.content, objects, loot, placed.family, placed.tile, placed, tileSize);
    }

    for (const npc of map.npcs || []) {
      const asset = resolveAsset(this.content, npc.family, npc.variant);
      if (!asset) continue;
      spawns.push(makePlacedEntity(asset, npc.tile, tileSize, {
        id: npc.id,
        familyId: npc.family,
        kind: "spawn",
        role: npc.role || "npc",
        renderLayer: "actor"
      }));
    }

    for (const entrance of this.content.entrancesByZone[zoneId] || []) {
      const object = placeObject(this.content, objects, loot, entrance.assetFamily, entrance.tile, {
        id: entrance.id,
        variant: entrance.variant,
        solid: false,
        interaction: {
          type: "transition",
          transitionId: entrance.id,
          prompt: entrance.prompt,
          destination: entrance.destination,
          conditions: entrance.conditions || []
        }
      }, tileSize);
      if (object) {
        object.name = entrance.name;
        object.triggerSize = entrance.size || [1, 1];
      }
    }

    const collected = memory?.collectedLootByZone?.get(zoneId) || new Set();
    removeWhere(loot, item => collected.has(item.id));

    const spawn = map.spawnPoints?.[spawnPointId] || map.spawnPoints?.player_start || Object.values(map.spawnPoints || {})[0] || { tile: [1, 1] };
    const metadata = {
      zoneId,
      zoneName: zone.name,
      zoneType: zone.type,
      mapId: map.mapId,
      playerStart: { x: spawn.tile[0], y: spawn.tile[1], facing: spawn.facing || "south" },
      spawnPoints: map.spawnPoints || {},
      exits: this.content.entrancesByZone[zoneId] || [],
      notes: map.notes || ""
    };

    return new WorldState({ width, height, tileSize, tiles, objects, spawns, loot, metadata, content: this.content });
  }
}

function fillTiles(content, tiles, width, height, familyId, fallbackFamily) {
  const asset = resolveAsset(content, familyId, 1) || resolveAsset(content, fallbackFamily, 1);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles[y * width + x] = makeTile(asset, x, y, "static");
    }
  }
}

function applyShapes(content, tiles, width, height, shapes) {
  for (const shape of shapes) {
    const asset = resolveAsset(content, shape.family, shape.variant) || resolveAsset(content, shape.fallbackFamily, shape.variant);
    if (!asset) continue;
    if (shape.shape === "rect") {
      for (let y = shape.y; y < shape.y + shape.h; y++) {
        for (let x = shape.x; x < shape.x + shape.w; x++) setTile(tiles, width, height, x, y, asset, shape.family);
      }
    }
    if (shape.shape === "circle") {
      for (let y = shape.y - shape.r; y <= shape.y + shape.r; y++) {
        for (let x = shape.x - shape.r; x <= shape.x + shape.r; x++) {
          const dx = x - shape.x;
          const dy = y - shape.y;
          if (dx * dx + dy * dy <= shape.r * shape.r) setTile(tiles, width, height, x, y, asset, shape.family);
        }
      }
    }
    if (shape.shape === "line") drawLine(tiles, width, height, shape.from, shape.to, shape.width || 1, asset, shape.family);
  }
}

function drawLine(tiles, width, height, from, to, radius, asset, familyId) {
  const [x0, y0] = from;
  const [x1, y1] = to;
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const cx = Math.round(x0 + (x1 - x0) * t);
    const cy = Math.round(y0 + (y1 - y0) * t);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius + 1) setTile(tiles, width, height, cx + dx, cy + dy, asset, familyId);
      }
    }
  }
}

function setTile(tiles, width, height, x, y, asset, familyId) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  tiles[y * width + x] = makeTile(asset, x, y, familyId);
}

function makeTile(asset, x, y, biomeId) {
  return { x, y, biomeId, assetId: asset.id, familyId: asset.familyId };
}

function placeObject(content, objects, loot, familyId, tile, options, tileSize) {
  const asset = resolveAsset(content, familyId, options.variant);
  if (!asset) return null;
  const entity = makePlacedEntity(asset, tile, tileSize, {
    id: options.id,
    familyId,
    kind: options.loot ? "loot" : "object",
    interaction: normalizeInteraction(options.interaction),
    renderLayer: asset.renderLayer,
    solid: options.solid
  });
  if (options.loot) loot.push(entity);
  else objects.push(entity);
  return entity;
}

function makePlacedEntity(asset, tile, tileSize, options) {
  const x = tile[0] * tileSize + tileSize / 2;
  const y = (tile[1] + 1) * tileSize;
  const collision = options.solid === false ? { solid: false, box: null } : asset.collision;
  return {
    id: options.id,
    kind: options.kind,
    role: options.role,
    assetId: asset.id,
    familyId: options.familyId || asset.familyId,
    asset,
    tileX: tile[0],
    tileY: tile[1],
    x,
    y,
    renderLayer: options.renderLayer || asset.renderLayer,
    collision,
    worldCollisionBox: collisionBoxAt(collision, x, y),
    interaction: options.interaction || null,
    phase: ((tile[0] * 17 + tile[1] * 31) % 100) / 100 * Math.PI * 2
  };
}

function normalizeInteraction(value) {
  if (!value) return null;
  if (typeof value === "string") return { type: value, prompt: "Inspect" };
  return value;
}

function resolveAsset(content, familyId, variant = 1) {
  if (!familyId) return null;
  const assets = content.assetsByFamily[familyId];
  if (!assets || assets.length === 0) return null;
  const index = Math.max(0, Math.min(assets.length - 1, Number(variant || 1) - 1));
  return assets[index];
}

function collisionBoxAt(collision, x, y) {
  if (!collision?.solid || !collision.box) return null;
  const box = collision.box;
  return { x: x + box.x, y: y + box.y, w: box.w, h: box.h };
}

function removeWhere(list, predicate) {
  for (let i = list.length - 1; i >= 0; i--) {
    if (predicate(list[i])) list.splice(i, 1);
  }
}
