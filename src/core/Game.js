import { Input } from "./Input.js";
import { Renderer } from "./Renderer.js";

export class Game {
  constructor(canvas, content, zoneManager, world, validation) {
    this.canvas = canvas;
    this.content = content;
    this.world = world;
    this.zoneManager = zoneManager;
    this.validation = validation;
    this.input = new Input(window);
    this.renderer = new Renderer(canvas, content);
    this.running = false;
    this.lastTime = 0;
    this.time = 0;
    this.debug = { collisions: false, spawns: false, biomes: false };
    this.toast = `Entered ${world.metadata.zoneName}.`;
    this.toastTimer = 3.5;
    this.weather = createWeather();

    const start = world.metadata.playerStart;
    this.player = {
      x: start.x * world.tileSize + world.tileSize / 2,
      y: (start.y + 1) * world.tileSize,
      speed: 190,
      hp: 1,
      mana: 1,
      stamina: 1,
      moving: false,
      inventory: []
    };
    this.camera = { x: 0, y: 0 };

    window.addEventListener("resize", () => this.renderer.resize());
  }

  start() {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(time => this.frame(time));
  }

  frame(now) {
    if (!this.running) return;
    const delta = Math.min(0.05, (now - this.lastTime) / 1000 || 0);
    this.lastTime = now;
    this.time += delta;
    this.update(delta);
    this.renderer.render(this);
    this.input.endFrame();
    requestAnimationFrame(time => this.frame(time));
  }

  update(delta) {
    this.handleDebugKeys();
    this.handleInteraction();

    const axis = this.input.axis();
    const running = this.input.down("shift") && this.player.stamina > 0.08;
    const speed = this.player.speed * (running ? 1.45 : 1);
    this.player.moving = Math.abs(axis.x) + Math.abs(axis.y) > 0.01;
    if (this.player.moving) {
      if (running) this.player.stamina = Math.max(0, this.player.stamina - delta * 0.26);
      this.movePlayer(axis.x * speed * delta, 0);
      this.movePlayer(0, axis.y * speed * delta);
    } else {
      this.player.stamina = Math.min(1, this.player.stamina + delta * 0.18);
    }

    this.player.mana = 0.78 + Math.sin(this.time * 0.35) * 0.06;
    this.updateCamera();
    if (this.toastTimer > 0) this.toastTimer -= delta;
  }

  handleDebugKeys() {
    if (this.input.consume("f1")) this.debug.collisions = !this.debug.collisions;
    if (this.input.consume("f2")) this.debug.spawns = !this.debug.spawns;
    if (this.input.consume("f3")) this.debug.biomes = !this.debug.biomes;
    if (this.input.consume("r")) {
      this.world = this.zoneManager.reloadCurrent();
      this.placePlayerAtZoneStart();
      this.showToast(`Reloaded static zone: ${this.world.metadata.zoneName}.`);
    }
  }

  handleInteraction() {
    if (!this.input.consume("e")) return;
    const target = this.world.nearestInteractive(this.player.x, this.player.y, 78);
    if (!target) {
      this.showToast("Nothing within reach.");
      return;
    }
    const name = target.name || target.asset.displayName || target.familyId;
    if (target.interaction?.type === "transition") {
      this.changeZone(target.interaction.transitionId);
      return;
    }
    if (target.kind === "loot") {
      this.player.inventory.push(target.assetId);
      this.zoneManager.markLootCollected(this.world.metadata.zoneId, target.id);
      this.world.loot = this.world.loot.filter(item => item !== target);
      this.world.solidObjects = [...this.world.objects, ...this.world.loot].filter(object => object.collision?.solid);
      this.showToast(`Collected ${name}.`);
    } else {
      this.showToast(`${name}.`);
    }
  }

  movePlayer(dx, dy) {
    if (dx === 0 && dy === 0) return;
    const next = { ...this.player, x: this.player.x + dx, y: this.player.y + dy };
    const box = this.playerCollisionBox(next);
    if (!this.world.collidesRect(box)) {
      this.player.x = next.x;
      this.player.y = next.y;
    }
  }

  updateCamera() {
    const worldPxW = this.world.width * this.world.tileSize;
    const worldPxH = this.world.height * this.world.tileSize;
    this.camera.x = clamp(this.player.x - this.renderer.width / 2, 0, Math.max(0, worldPxW - this.renderer.width));
    this.camera.y = clamp(this.player.y - this.renderer.height / 2, 0, Math.max(0, worldPxH - this.renderer.height));
  }

  changeZone(transitionId) {
    this.world = this.zoneManager.transition(transitionId);
    this.placePlayerAtZoneStart();
    this.camera.x = 0;
    this.camera.y = 0;
    this.showToast(`Entered ${this.world.metadata.zoneName}.`);
  }

  placePlayerAtZoneStart() {
    const start = this.world.metadata.playerStart;
    this.player.x = start.x * this.world.tileSize + this.world.tileSize / 2;
    this.player.y = (start.y + 1) * this.world.tileSize;
  }

  playerCollisionBox(player = this.player) {
    return {
      x: player.x - 13,
      y: player.y - 32,
      w: 26,
      h: 29
    };
  }

  playerRenderable() {
    return {
      kind: "player",
      x: this.player.x,
      y: this.player.y,
      renderLayer: "actor",
      moving: this.player.moving
    };
  }

  showToast(text) {
    this.toast = text;
    this.toastTimer = 3.2;
  }
}

function createWeather() {
  const particles = [];
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 14 + Math.random() * 34,
      size: 1 + Math.random() * 2
    });
  }
  return { particles };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
