// shim.mjs — Minimal browser-environment shim so the game's pure systems can
// run under Node. Must be imported FIRST (before any system module) so the
// globals exist when EventBus.js / SaveSystem.js are evaluated.
//
// The game touches the browser in exactly two places:
//   1. EventBus.js  -> new Phaser.Events.EventEmitter()
//   2. SaveSystem.js -> localStorage + btoa/atob (btoa/atob are native in Node 22)
import { EventEmitter } from 'node:events';

EventEmitter.defaultMaxListeners = 200;

// Phaser.Events.EventEmitter is API-compatible with Node's EventEmitter for the
// subset the systems use: on / once / off / emit (with varargs). Phaser allows a
// 3rd "context" arg on on/off which Node ignores harmlessly.
class PhaserEmitter extends EventEmitter {
    on(event, fn, _context) { return super.on(event, fn); }
    once(event, fn, _context) { return super.once(event, fn); }
    off(event, fn, _context) { return super.off(event, fn); }
}

globalThis.Phaser = {
    Events: { EventEmitter: PhaserEmitter }
};

// In-memory localStorage
const _store = new Map();
globalThis.localStorage = {
    getItem:    (k) => (_store.has(k) ? _store.get(k) : null),
    setItem:    (k, v) => { _store.set(k, String(v)); },
    removeItem: (k) => { _store.delete(k); },
    clear:      () => { _store.clear(); }
};

// btoa/atob exist natively in Node 18+, but guard just in case.
if (typeof globalThis.btoa !== 'function') {
    globalThis.btoa = (s) => Buffer.from(s, 'binary').toString('base64');
}
if (typeof globalThis.atob !== 'function') {
    globalThis.atob = (b) => Buffer.from(b, 'base64').toString('binary');
}
