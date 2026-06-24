export function hashSeed(seed) {
  const text = String(seed ?? "grimward");
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class SeededRandom {
  constructor(seed) {
    this.state = hashSeed(seed) || 0x8f3a91b5;
  }

  next() {
    let t = this.state += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  chance(probability) {
    return this.next() < probability;
  }

  pick(list) {
    if (!list || list.length === 0) return null;
    return list[Math.floor(this.next() * list.length) % list.length];
  }

  fork(salt) {
    return new SeededRandom(`${this.state}:${salt}`);
  }
}

export function noise2(x, y, seed = 0) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041);
  n = (n ^ (n >>> 13)) >>> 0;
  n = Math.imul(n, 1274126177) >>> 0;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}
