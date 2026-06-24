export class WorldState {
  constructor({ width, height, tileSize, tiles, objects, spawns, loot, metadata, content }) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.tiles = tiles;
    this.objects = objects;
    this.spawns = spawns;
    this.loot = loot;
    this.metadata = metadata;
    this.content = content;
    this.solidObjects = [...objects, ...loot].filter(object => object.collision?.solid);
  }

  index(tx, ty) {
    return ty * this.width + tx;
  }

  inBounds(tx, ty) {
    return tx >= 0 && ty >= 0 && tx < this.width && ty < this.height;
  }

  tileAt(tx, ty) {
    if (!this.inBounds(tx, ty)) return null;
    return this.tiles[this.index(tx, ty)];
  }

  isTileBlocked(tx, ty) {
    const tile = this.tileAt(tx, ty);
    if (!tile) return true;
    const asset = this.content.assets[tile.assetId];
    return Boolean(asset?.collision?.solid);
  }

  collidesRect(rect) {
    const minTx = Math.floor(rect.x / this.tileSize);
    const minTy = Math.floor(rect.y / this.tileSize);
    const maxTx = Math.floor((rect.x + rect.w - 1) / this.tileSize);
    const maxTy = Math.floor((rect.y + rect.h - 1) / this.tileSize);

    for (let ty = minTy; ty <= maxTy; ty++) {
      for (let tx = minTx; tx <= maxTx; tx++) {
        if (this.isTileBlocked(tx, ty)) return true;
      }
    }

    for (const object of this.solidObjects) {
      if (rectsOverlap(rect, object.worldCollisionBox)) return true;
    }
    return false;
  }

  nearestInteractive(x, y, radius) {
    let best = null;
    let bestD = radius * radius;
    for (const entry of [...this.objects, ...this.loot]) {
      const tags = entry.asset?.tags || [];
      if (!entry.interaction && !tags.includes("interactive") && !tags.includes("loot") && !tags.includes("harvest")) continue;
      const dx = entry.x - x;
      const dy = entry.y - y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        best = entry;
        bestD = d;
      }
    }
    return best;
  }
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
