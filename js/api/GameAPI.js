// GameAPI.js — Automation/inspection API for Aethermoor.
// Exposed as window.GameAPI when the game boots (see main.js). Lets a human
// (browser console) or an automated driver (Playwright page.evaluate) inspect
// game state and drive the player: move, talk, fight, craft, save, etc.
//
// Everything is read/written against the LIVE Phaser game — no rendering is
// bypassed, so what the API does is exactly what a player would see.
import EventBus from '../systems/EventBus.js';
import { NPCS } from '../data/npcs.js';
import { getItem } from '../data/items.js';
import { addItem, equipItem, useItem, getItemCount } from '../systems/InventorySystem.js';
import { isDialogueActive, getCurrentDisplay } from '../systems/DialogueSystem.js';
import { getActiveObjectives } from '../systems/QuestSystem.js';
import { save as saveGame, load as loadGame } from '../systems/SaveSystem.js';

const TILE = 16;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export function installGameAPI(game) {
    const S  = (key) => game.scene.getScene(key);
    const ON = (key) => game.scene.isActive(key);
    const P  = () => game.registry.get('player');
    const GS = () => S('Game');

    const api = {
        // ── Inspection ──────────────────────────────────────────────────────
        player() { return P(); },

        state() {
            const p = P();
            const gs = GS();
            const activeScenes = game.scene.getScenes(true).map(s => s.scene.key);
            const out = {
                scenes: activeScenes,
                player: p ? {
                    name: p.name, race: p.race, level: p.level,
                    pos: { x: p.worldX, y: p.worldY },
                    hp: Math.ceil(p.derived.health), maxHp: p.derived.maxHealth,
                    mp: Math.ceil(p.derived.mana),   maxMp: p.derived.maxMana,
                    st: Math.ceil(p.derived.stamina),
                    gold: p.gold,
                    weapon: p.equipment?.weapon ? p.equipment.weapon.name : 'unarmed'
                } : null,
                quests: p ? getActiveObjectives(p) : [],
                dialogue: this.dialogue(),
                combat: this.combat(),
                nearby: this.nearby()
            };
            return out;
        },

        nearby(radiusTiles = 8) {
            const gs = GS(); const p = P();
            if (!gs || !gs.playerEntity || !p) return { npcs: [], enemies: [] };
            const px = gs.playerEntity.sprite.x, py = gs.playerEntity.sprite.y;
            const d = (o) => Math.round(Math.hypot(o.sprite.x - px, o.sprite.y - py) / TILE);
            const npcs = (gs.npcs || [])
                .map(n => ({ id: n.data.id, name: n.data.name, dist: d(n) }))
                .filter(n => n.dist <= radiusTiles).sort((a, b) => a.dist - b.dist);
            const enemies = (gs.enemies || []).filter(e => e.alive)
                .map(e => ({ id: e.enemyId, dist: d(e), aggro: e.aggro }))
                .filter(e => e.dist <= radiusTiles).sort((a, b) => a.dist - b.dist);
            return { npcs, enemies };
        },

        dialogue() {
            if (!isDialogueActive()) return null;
            const disp = getCurrentDisplay(P());
            if (!disp) return null;
            return {
                speaker: disp.speaker, text: disp.text,
                choices: (disp.choices || []).map((c, i) => ({ index: i, text: c.text }))
            };
        },

        combat() {
            const cs = S('Combat');
            if (!ON('Combat') || !cs || !cs.combatState) return null;
            const st = cs.combatState;
            return {
                enemy: st.enemy.name,
                enemyHp: Math.max(0, Math.ceil(st.enemy.health)), enemyMaxHp: st.enemy.maxHealth,
                playerHp: Math.ceil(st.player.derived.health),
                round: st.round, active: st.active
            };
        },

        inventory() {
            const p = P(); if (!p) return [];
            return p.inventory.map(s => {
                const def = getItem(s.itemId);
                return { itemId: s.itemId, name: def ? def.name : s.itemId, qty: s.quantity, type: def ? def.type : '?' };
            });
        },

        // ── Movement ────────────────────────────────────────────────────────
        // Set a held-direction override consumed by GameScene.update.
        setMove({ up = false, down = false, left = false, right = false, run = false } = {}) {
            const gs = GS(); if (gs) gs.apiMoveState = { up, down, left, right, run };
            return true;
        },
        stop() { const gs = GS(); if (gs) gs.apiMoveState = null; return true; },

        // Instantly reposition the player (debug/teleport).
        teleport(tileX, tileY) {
            const gs = GS(); const p = P();
            if (!gs || !gs.playerEntity || !p) return false;
            gs.playerEntity.sprite.setPosition(tileX * TILE + TILE / 2, tileY * TILE + TILE / 2);
            p.worldX = tileX; p.worldY = tileY;
            return true;
        },

        // Walk to a tile by steering the real movement system. Resolves on arrival.
        async walkTo(tileX, tileY, { timeoutMs = 8000 } = {}) {
            const gs = GS(); if (!gs || !gs.playerEntity) return false;
            const targetX = tileX * TILE + TILE / 2, targetY = tileY * TILE + TILE / 2;
            const start = Date.now();
            while (Date.now() - start < timeoutMs) {
                const sx = gs.playerEntity.sprite.x, sy = gs.playerEntity.sprite.y;
                const dx = targetX - sx, dy = targetY - sy;
                if (Math.hypot(dx, dy) < TILE * 0.6) { this.stop(); return true; }
                this.setMove({
                    left:  dx < -2, right: dx > 2,
                    up:    dy < -2, down:  dy > 2
                });
                await sleep(60);
            }
            this.stop();
            return false;
        },

        // ── Actions ─────────────────────────────────────────────────────────
        interact() { const gs = GS(); if (gs) gs.interact(); return true; },
        openInventory() { const gs = GS(); if (gs) gs.openInventory(); return true; },
        openMap() { const gs = GS(); if (gs) gs.openMap(); return true; },
        openJournal() { const gs = GS(); if (gs) gs.openJournal(); return true; },
        closePanels() {
            for (const k of ['Inventory', 'WorldMap', 'Crafting']) if (ON(k)) game.scene.stop(k);
            return true;
        },

        // Open a conversation with an NPC by id (must exist in the loaded scene).
        talkTo(npcId) {
            const gs = GS(); if (!gs) return false;
            const npc = (gs.npcs || []).find(n => n.data.id === npcId);
            const data = npc ? npc.data : NPCS[npcId];
            if (!data) return false;
            if (npc) this.teleport(Math.round(npc.sprite.x / TILE), Math.round(npc.sprite.y / TILE));
            gs.scene.launch('Dialogue', { npcId: data.id, dialogueTree: data.dialogueRoot });
            gs.scene.pause('Game');
            return true;
        },

        // Pick a dialogue choice by index.
        choose(index) {
            const d = S('Dialogue');
            if (ON('Dialogue') && d) { d.selectChoice(index); return true; }
            return false;
        },

        // ── Combat ──────────────────────────────────────────────────────────
        combatAction(key) { const cs = S('Combat'); if (ON('Combat') && cs) { cs.handleAction(key); return true; } return false; },

        async autoFight({ maxRounds = 40, delayMs = 120 } = {}) {
            let rounds = 0;
            while (ON('Combat') && rounds < maxRounds) {
                this.combatAction('attack');
                rounds++;
                await sleep(delayMs);
            }
            return { ended: !ON('Combat'), rounds, result: this.combat() };
        },

        // ── Inventory actions ───────────────────────────────────────────────
        equip(itemId) { const ok = equipItem(P(), itemId, GS()); EventBus.emit('hud_update'); return ok; },
        use(itemId)   { const ok = useItem(P(), itemId, GS());   EventBus.emit('hud_update'); return ok; },
        give(itemId, qty = 1) { return addItem(P(), itemId, qty); },
        count(itemId) { return getItemCount(P(), itemId); },

        // ── Meta / debug ────────────────────────────────────────────────────
        save() { return saveGame(P(), game.registry.get('worldData')); },
        load() { return loadGame(); },
        setTime(hour) { const p = P(); if (p) p.worldTime = hour * 60; return true; },
        heal() { const p = P(); if (p) { p.derived.health = p.derived.maxHealth; p.derived.mana = p.derived.maxMana; p.derived.stamina = p.derived.maxStamina; EventBus.emit('hud_update'); } return true; },
        seed() { return game.registry.get('worldSeed'); },

        help() {
            const groups = {
                inspect: ['state()', 'player()', 'nearby(r)', 'dialogue()', 'combat()', 'inventory()'],
                move:    ['setMove({up,down,left,right,run})', 'stop()', 'teleport(x,y)', 'await walkTo(x,y)'],
                act:     ['interact()', 'talkTo(id)', 'choose(i)', 'openInventory()', 'openMap()', 'openJournal()', 'closePanels()'],
                combat:  ['combatAction(key)', 'await autoFight()'],
                items:   ['equip(id)', 'use(id)', 'give(id,qty)', 'count(id)'],
                meta:    ['save()', 'load()', 'setTime(h)', 'heal()', 'seed()']
            };
            console.table ? console.table(groups) : console.log(groups);
            return groups;
        }
    };

    if (typeof window !== 'undefined') {
        window.GameAPI = api;
        console.log('%c[GameAPI] ready — type GameAPI.help()', 'color:#4cf');
    }
    return api;
}
