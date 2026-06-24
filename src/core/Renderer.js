export class Renderer {
  constructor(canvas, content) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.content = content;
    this.dpr = 1;
    this.width = 1;
    this.height = 1;
    this.images = new Map();
    this.resize();
  }

  resize() {
    this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    this.width = Math.floor(window.innerWidth);
    this.height = Math.floor(window.innerHeight);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  render(game, alpha = 1) {
    const { ctx } = this;
    const world = game.world;
    const camera = game.camera;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = "#05080b";
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawTiles(world, camera, game.debug.biomes);
    this.drawEntities(game, camera);
    this.drawWeather(game.time, game.weather);
    this.drawHud(game);
    if (game.debug.collisions || game.debug.spawns || game.debug.biomes) this.drawDebug(game);
  }

  drawTiles(world, camera, showBiomes) {
    const ts = world.tileSize;
    const startX = Math.max(0, Math.floor(camera.x / ts) - 1);
    const startY = Math.max(0, Math.floor(camera.y / ts) - 1);
    const endX = Math.min(world.width - 1, Math.ceil((camera.x + this.width) / ts) + 1);
    const endY = Math.min(world.height - 1, Math.ceil((camera.y + this.height) / ts) + 1);

    for (let ty = startY; ty <= endY; ty++) {
      for (let tx = startX; tx <= endX; tx++) {
        const tile = world.tileAt(tx, ty);
        const asset = world.content.assets[tile.assetId];
        this.drawTile(asset, tx * ts - camera.x, ty * ts - camera.y, ts, tx, ty);
        if (showBiomes) {
          this.ctx.fillStyle = biomeTint(tile.biomeId);
          this.ctx.fillRect(tx * ts - camera.x, ty * ts - camera.y, ts, ts);
        }
      }
    }
  }

  drawEntities(game, camera) {
    const all = [...game.world.objects, ...game.world.loot, ...game.world.spawns, game.playerRenderable()];
    const visible = all.filter(entry => isVisible(entry, camera, this.width, this.height));
    visible.sort((a, b) => {
      const layerA = layerOrder(this.content, a.renderLayer || a.asset?.renderLayer || "actor");
      const layerB = layerOrder(this.content, b.renderLayer || b.asset?.renderLayer || "actor");
      if (layerA !== layerB) return layerA - layerB;
      return (a.y || 0) - (b.y || 0);
    });

    for (const entry of visible) {
      if (entry.kind === "player") this.drawPlayer(entry, camera, game.time);
      else this.drawAsset(entry.asset, entry.x - camera.x, entry.y - camera.y, game.time, entry);
    }
  }

  drawTile(asset, x, y, size, tx, ty) {
    const ctx = this.ctx;
    const image = this.getImage(asset);
    if (image?.complete && image.naturalWidth > 0) {
      ctx.drawImage(image, Math.floor(x), Math.floor(y), size, size);
      return;
    }
    const p = asset.palette || ["#333", "#555", "#111"];
    ctx.fillStyle = p[0];
    ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    const hash = ((tx * 73856093) ^ (ty * 19349663) ^ asset.variantIndex) >>> 0;
    ctx.fillStyle = p[1] || p[0];
    for (let i = 0; i < 5; i++) {
      const px = x + ((hash >> (i * 3)) % size);
      const py = y + ((hash >> (i * 5)) % size);
      ctx.globalAlpha = 0.28;
      ctx.fillRect(Math.floor(px), Math.floor(py), 3 + (hash % 5), 2);
    }
    ctx.globalAlpha = 1;
    if (asset.kind === "terrain.water") {
      ctx.strokeStyle = p[1];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 14 + (hash % 6));
      ctx.lineTo(x + size - 5, y + 13 + ((hash >> 4) % 6));
      ctx.stroke();
    }
    if (asset.kind === "terrain.rock_mountain") {
      ctx.fillStyle = p[2];
      ctx.beginPath();
      ctx.moveTo(x + 5, y + size - 4);
      ctx.lineTo(x + size * 0.42, y + 8);
      ctx.lineTo(x + size - 6, y + size - 4);
      ctx.fill();
      ctx.fillStyle = p[1];
      ctx.fillRect(x + size * 0.38, y + 10, 9, 5);
    }
  }

  drawAsset(asset, x, y, time, entry) {
    const ctx = this.ctx;
    const w = asset.baseVisualSize.w;
    const h = asset.baseVisualSize.h;
    const p = asset.palette || ["#777", "#aaa", "#222"];
    const left = Math.floor(x - w / 2);
    const top = Math.floor(y - h);

    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(0, -5, Math.max(12, w * 0.32), Math.max(5, h * 0.08), 0, 0, Math.PI * 2);
    ctx.fill();

    const image = this.getImage(asset);
    if (image?.complete && image.naturalWidth > 0) {
      ctx.drawImage(image, -w / 2, -h, w, h);
      ctx.restore();
      return;
    }

    if (asset.category === "vegetation") this.drawVegetation(asset, p, w, h, time);
    else if (asset.category === "rock") this.drawRock(asset, p, w, h);
    else if (asset.category === "building") this.drawBuilding(asset, p, w, h);
    else if (asset.category === "dungeon") this.drawDungeon(asset, p, w, h);
    else if (asset.category === "creature") this.drawCreature(asset, p, w, h, time, entry);
    else if (asset.category === "effect") this.drawEffect(asset, p, w, h, time);
    else this.drawProp(asset, p, w, h);
    ctx.restore();
  }

  getImage(asset) {
    if (!asset?.imagePath) return null;
    if (this.images.has(asset.id)) return this.images.get(asset.id);
    const image = new Image();
    image.decoding = "async";
    image.src = asset.imagePath;
    this.images.set(asset.id, image);
    return image;
  }

  drawVegetation(asset, p, w, h, time) {
    const ctx = this.ctx;
    if (asset.kind === "vegetation.tree") {
      ctx.fillStyle = p[2];
      ctx.fillRect(-5, -36, 10, 34);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 ? p[1] : p[0];
        ctx.beginPath();
        ctx.moveTo(0, -h + i * 24);
        ctx.lineTo(-w / 2 + i * 5, -h + 54 + i * 14);
        ctx.lineTo(w / 2 - i * 5, -h + 54 + i * 14);
        ctx.closePath();
        ctx.fill();
      }
    } else if (asset.kind === "vegetation.tall_grass") {
      ctx.strokeStyle = p[1];
      ctx.lineWidth = 2;
      for (let i = -20; i <= 20; i += 5) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + Math.sin(time * 2 + i) * 4, -h * (0.45 + (i % 3) * 0.08));
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = p[0];
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.35, w * 0.42, h * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = p[1];
      ctx.fillRect(-w * 0.22, -h * 0.48, w * 0.44, h * 0.12);
    }
  }

  drawRock(asset, p, w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = p[0];
    ctx.beginPath();
    ctx.moveTo(-w * 0.45, -h * 0.12);
    ctx.lineTo(-w * 0.25, -h * 0.55);
    ctx.lineTo(w * 0.15, -h * 0.7);
    ctx.lineTo(w * 0.45, -h * 0.25);
    ctx.lineTo(w * 0.35, 0);
    ctx.lineTo(-w * 0.35, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = p[1];
    ctx.fillRect(-w * 0.14, -h * 0.52, w * 0.26, h * 0.12);
    ctx.fillStyle = p[2];
    ctx.fillRect(w * 0.1, -h * 0.28, w * 0.22, h * 0.16);
  }

  drawBuilding(asset, p, w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = p[2];
    ctx.fillRect(-w * 0.42, -h * 0.54, w * 0.84, h * 0.46);
    ctx.fillStyle = p[0];
    ctx.beginPath();
    ctx.moveTo(-w * 0.5, -h * 0.5);
    ctx.lineTo(0, -h * 0.96);
    ctx.lineTo(w * 0.5, -h * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = p[1];
    ctx.fillRect(-w * 0.12, -h * 0.34, w * 0.24, h * 0.28);
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fillRect(-w * 0.34, -h * 0.4, w * 0.16, h * 0.1);
    ctx.fillRect(w * 0.18, -h * 0.4, w * 0.16, h * 0.1);
  }

  drawDungeon(asset, p, w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = p[0];
    ctx.fillRect(-w * 0.36, -h * 0.74, w * 0.72, h * 0.72);
    ctx.fillStyle = p[1];
    ctx.fillRect(-w * 0.25, -h * 0.66, w * 0.5, h * 0.12);
    ctx.fillStyle = p[2];
    ctx.fillRect(-w * 0.18, -h * 0.48, w * 0.36, h * 0.46);
  }

  drawCreature(asset, p, w, h, time, entry) {
    const ctx = this.ctx;
    const bob = Math.sin(time * 4 + (entry?.phase || 0)) * 2;
    ctx.translate(0, bob);
    ctx.fillStyle = p[0];
    ctx.fillRect(-w * 0.22, -h * 0.58, w * 0.44, h * 0.42);
    ctx.fillStyle = p[2];
    ctx.fillRect(-w * 0.16, -h * 0.78, w * 0.32, h * 0.22);
    ctx.fillStyle = p[1];
    ctx.fillRect(-w * 0.28, -h * 0.5, w * 0.12, h * 0.24);
    ctx.fillRect(w * 0.16, -h * 0.5, w * 0.12, h * 0.24);
    if (asset.kind === "creature.boss") {
      ctx.strokeStyle = p[1];
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -h * 0.54, w * 0.44, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  drawEffect(asset, p, w, h, time) {
    const ctx = this.ctx;
    const pulse = 0.6 + Math.sin(time * 3 + asset.variantIndex) * 0.2;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = p[0];
    ctx.beginPath();
    ctx.arc(0, -h * 0.45, w * pulse * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = p[1];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -h * 0.45, w * 0.38, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawProp(asset, p, w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = p[0];
    ctx.fillRect(-w * 0.35, -h * 0.62, w * 0.7, h * 0.58);
    ctx.fillStyle = p[1];
    ctx.fillRect(-w * 0.28, -h * 0.56, w * 0.56, h * 0.1);
    ctx.fillStyle = p[2];
    ctx.fillRect(-w * 0.08, -h * 0.6, w * 0.16, h * 0.56);
  }

  drawPlayer(player, camera, time) {
    const ctx = this.ctx;
    const x = player.x - camera.x;
    const y = player.y - camera.y;
    const bob = Math.sin(time * 8) * (player.moving ? 2 : 0);
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y + bob));
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.beginPath();
    ctx.ellipse(0, -5, 17, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#26333b";
    ctx.fillRect(-13, -44, 26, 35);
    ctx.fillStyle = "#b59b7d";
    ctx.fillRect(-9, -58, 18, 16);
    ctx.fillStyle = "#7d5a3d";
    ctx.fillRect(-15, -36, 7, 20);
    ctx.fillRect(8, -36, 7, 20);
    ctx.fillStyle = "#cfd9d8";
    ctx.fillRect(12, -45, 4, 42);
    ctx.fillStyle = "#6fd0c4";
    ctx.fillRect(-2, -32, 4, 16);
    ctx.restore();
  }

  drawWeather(time, weather) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = "#dcebed";
    for (let i = 0; i < weather.particles.length; i++) {
      const p = weather.particles[i];
      const x = (p.x + Math.sin(time + i) * 18) % this.width;
      const y = (p.y + time * p.speed) % this.height;
      ctx.fillRect(x, y, p.size, p.size);
    }
    ctx.restore();
  }

  drawHud(game) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(6,10,14,0.78)";
    ctx.fillRect(16, 16, 250, 92);
    ctx.strokeStyle = "rgba(185,220,255,0.2)";
    ctx.strokeRect(16.5, 16.5, 250, 92);
    ctx.fillStyle = "#edf5f7";
    ctx.font = "700 18px Segoe UI, Arial";
    ctx.fillText(game.world.metadata.zoneName || "Grimward", 32, 43);
    this.bar(32, 55, 190, 10, game.player.hp, "#b6424d");
    this.bar(32, 71, 160, 8, game.player.mana, "#4a8dc5");
    this.bar(32, 85, 170, 8, game.player.stamina, "#a4b45f");

    ctx.fillStyle = "rgba(6,10,14,0.72)";
    ctx.fillRect(this.width - 164, 16, 148, 148);
    ctx.strokeStyle = "rgba(185,220,255,0.2)";
    ctx.strokeRect(this.width - 163.5, 16.5, 148, 148);
    this.drawMiniMap(game, this.width - 154, 26, 128, 128);

    if (game.toastTimer > 0) {
      ctx.fillStyle = "rgba(6,10,14,0.8)";
      ctx.fillRect(24, this.height - 68, Math.min(520, this.width - 48), 44);
      ctx.fillStyle = "#d5e3e2";
      ctx.font = "14px Segoe UI, Arial";
      ctx.fillText(game.toast, 42, this.height - 40);
    }
    ctx.restore();
  }

  bar(x, y, w, h, value, color) {
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w * Math.max(0, Math.min(1, value)), h);
  }

  drawMiniMap(game, x, y, w, h) {
    const ctx = this.ctx;
    const world = game.world;
    const sx = w / world.width;
    const sy = h / world.height;
    for (let ty = 0; ty < world.height; ty += 3) {
      for (let tx = 0; tx < world.width; tx += 3) {
        const tile = world.tileAt(tx, ty);
        ctx.fillStyle = biomeColor(tile.biomeId);
        ctx.fillRect(x + tx * sx, y + ty * sy, Math.ceil(3 * sx), Math.ceil(3 * sy));
      }
    }
    ctx.fillStyle = "#f2f7e6";
    ctx.fillRect(x + game.player.x / world.tileSize * sx - 2, y + game.player.y / world.tileSize * sy - 2, 4, 4);
  }

  drawDebug(game) {
    const ctx = this.ctx;
    const camera = game.camera;
    if (game.debug.collisions) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,75,90,0.85)";
      ctx.lineWidth = 1;
      for (const object of [...game.world.objects, ...game.world.loot]) {
        const box = object.worldCollisionBox;
        if (!box) continue;
        ctx.strokeRect(box.x - camera.x, box.y - camera.y, box.w, box.h);
      }
      const p = game.playerCollisionBox();
      ctx.strokeStyle = "rgba(120,240,255,0.9)";
      ctx.strokeRect(p.x - camera.x, p.y - camera.y, p.w, p.h);
      ctx.restore();
    }
    if (game.debug.spawns) {
      ctx.save();
      for (const spawn of game.world.spawns) {
        ctx.strokeStyle = spawn.familyId === "creature_boss" ? "#ffcc66" : "#c884ff";
        ctx.beginPath();
        ctx.arc(spawn.x - camera.x, spawn.y - camera.y - 24, 12, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

function layerOrder(content, id) {
  return content.renderLayers[id]?.order ?? 40;
}

function isVisible(entry, camera, width, height) {
  const margin = Math.max(entry.asset?.baseVisualSize?.w || 80, entry.asset?.baseVisualSize?.h || 80, 96);
  return entry.x > camera.x - margin && entry.x < camera.x + width + margin && entry.y > camera.y - margin && entry.y < camera.y + height + margin;
}

function biomeColor(id) {
  const colors = {
    snow_forest: "#9fb9bd",
    rocky_mountain: "#6d7478",
    nordic_village: "#78664f",
    ancient_ruins: "#646a68",
    underground_dungeon: "#2d3034",
    ice_cave: "#8dc8d5",
    dark_swamp: "#2e4735",
    bandit_camp: "#674839",
    road: "#8f785c",
    boss_area: "#54436f"
  };
  return colors[id] || "#384641";
}

function biomeTint(id) {
  const color = biomeColor(id);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},0.22)`;
}
