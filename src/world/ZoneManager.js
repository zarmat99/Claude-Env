import { StaticMapBuilder } from "./StaticMapBuilder.js";

export class ZoneManager {
  constructor(content) {
    this.content = content;
    this.builder = new StaticMapBuilder(content);
    this.currentZoneId = content.zonesDoc.startZone;
    this.currentSpawnPoint = content.zonesDoc.startSpawn || "player_start";
    this.memory = {
      collectedLootByZone: new Map()
    };
    this.currentWorld = null;
  }

  loadInitial() {
    return this.loadZone(this.currentZoneId, this.currentSpawnPoint);
  }

  loadZone(zoneId, spawnPoint = "player_start") {
    this.currentZoneId = zoneId;
    this.currentSpawnPoint = spawnPoint;
    this.currentWorld = this.builder.build(zoneId, spawnPoint, this.memory);
    return this.currentWorld;
  }

  transition(transitionId) {
    const transition = this.content.entrancesById[transitionId];
    if (!transition) throw new Error(`Unknown transition ${transitionId}`);
    const destination = transition.destination;
    return this.loadZone(destination.zoneId, destination.spawnPoint);
  }

  markLootCollected(zoneId, lootId) {
    if (!this.memory.collectedLootByZone.has(zoneId)) {
      this.memory.collectedLootByZone.set(zoneId, new Set());
    }
    this.memory.collectedLootByZone.get(zoneId).add(lootId);
  }

  reloadCurrent() {
    return this.loadZone(this.currentZoneId, this.currentSpawnPoint);
  }
}
