// playthrough.mjs — Headless verification harness for Aethermoor.
// Imports the REAL game systems (via shim) and drives an automated playthrough,
// asserting that core mechanics behave correctly. Run: node verify/playthrough.mjs
import './shim.mjs';

import { RACES, createBaseAttributes } from '../js/data/races.js';
import { ENEMIES } from '../js/data/enemies.js';
import { ITEMS } from '../js/data/items.js';
import { computeDerived } from '../js/systems/StatsSystem.js';
import {
    addItem, removeItem, equipItem, useItem,
    getItemCount, getTotalWeight, hasItem
} from '../js/systems/InventorySystem.js';
import {
    createCombatState, playerAttack, enemyTurn, nextRound, generateLoot
} from '../js/systems/CombatSystem.js';
import { addXP, getSkillLevel, getXPToNextLevel } from '../js/systems/SkillSystem.js';
import {
    subscribeToEvents, startQuest, advanceStage,
    isQuestActive, isQuestComplete, getActiveObjectives
} from '../js/systems/QuestSystem.js';
import { changeRep, getRep, getDisposition } from '../js/systems/FactionSystem.js';
import { start as dlgStart, selectChoice as dlgChoose, isDialogueActive } from '../js/systems/DialogueSystem.js';
import { craft, canCraft, getKnownRecipes } from '../js/systems/CraftingSystem.js';
import { save as saveGame, load as loadGame, hasSave } from '../js/systems/SaveSystem.js';
import EventBus from '../js/systems/EventBus.js';

// ─── Tiny assertion framework ───────────────────────────────────────────────
let PASS = 0, FAIL = 0, WARN = 0;
const findings = [];
function check(name, cond, detail = '') {
    if (cond) { PASS++; console.log(`  ✓ ${name}`); }
    else { FAIL++; console.log(`  ✗ ${name}${detail ? '  — ' + detail : ''}`); findings.push('FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function warn(name, detail = '') {
    WARN++; console.log(`  ⚠ ${name}${detail ? '  — ' + detail : ''}`);
    findings.push('WARN: ' + name + (detail ? ' — ' + detail : ''));
}
function section(t) { console.log(`\n=== ${t} ===`); }
async function safe(name, fn) {
    try { await fn(); }
    catch (e) { FAIL++; console.log(`  ✗ ${name} CRASHED — ${e.message}`); findings.push(`CRASH in ${name}: ${e.message}`); }
}

// Silence noisy notification spam but keep a tap for assertions if needed.
const notifications = [];
EventBus.on('show_notification', (text) => notifications.push(text));

// ─── Player factory (mirrors CharacterCreateScene.startGame) ────────────────
function createPlayer(raceId = 'varesh', name = 'Tester') {
    const race = RACES[raceId];
    const raceAttrs = createBaseAttributes(raceId);
    const player = {
        name, race: raceId, level: 1, xp: 0,
        attributes: { ...raceAttrs },
        derived: {
            health: race.health, maxHealth: race.health,
            mana: race.mana, maxMana: race.mana,
            stamina: race.stamina, maxStamina: race.stamina,
            carryWeight: 0, maxCarryWeight: 100 + raceAttrs.STR * 10,
            moveSpeed: 120 + raceAttrs.AGI * 4, baseArmor: 0
        },
        skills: Object.fromEntries(
            ['blades','blunt','archery','block','destruction','restoration','illusion',
             'conjuration','sneak','lockpicking','pickpocket','smithing','alchemy',
             'enchanting','speech','negotiation','herbalism','survival']
            .map(s => [s, { xp: 0, level: 1, perksUnlocked: [] }])
        ),
        equipment: { head: null, chest: null, legs: null, hands: null, feet: null, weapon: null, offhand: null, ring: null },
        worldX: 100, worldY: 103,
        flags: new Set(),
        quests: { active: new Map(), completed: new Set(), failed: new Set() },
        inventory: [
            { itemId: 'iron_sword', quantity: 1 },
            { itemId: 'health_potion_minor', quantity: 3 },
            { itemId: 'bread', quantity: 2 }
        ],
        gold: 50,
        factionRep: { auric_concordat: 0, rootwarden_circle: 0, iron_compact: 0, underlurk_cult: -30, grey_penitents: 10 },
        exploredTiles: new Uint8Array(40000),
        worldTime: 7 * 60, kills: {}, crafted: {}
    };
    if (race.startingSkills) {
        for (const [sid, lvl] of Object.entries(race.startingSkills)) {
            if (player.skills[sid]) player.skills[sid].level = lvl;
        }
    }
    return player;
}

function freshEnemy(id) {
    const t = ENEMIES[id];
    return { ...t, health: t.health, maxHealth: t.maxHealth };
}

// Mirrors CombatScene's turn flow: player attacks, then enemy, then next round.
function simulateCombat(player, enemyId, { maxRounds = 100 } = {}) {
    const enemy = freshEnemy(enemyId);
    const state = createCombatState(player, enemy);
    let rounds = 0, loot = null, result = null;
    while (state.active && rounds < maxRounds) {
        rounds++;
        const pr = playerAttack(state, 'attack');
        if (pr.combatOver) { result = pr.result; loot = pr.loot || []; break; }
        const er = enemyTurn(state);
        if (er.combatOver) { result = er.result; loot = er.loot || []; break; }
        nextRound(state);
    }
    if (!result) result = state.active ? 'timeout' : 'unknown';
    return { result, rounds, loot, enemy };
}

// ════════════════════════════════════════════════════════════════════════════
async function main() {
    console.log('AETHERMOOR — Headless Verification Harness\n');

    // ── 1. Character creation & races ──────────────────────────────────────
    section('1. Character creation (all 5 races)');
    for (const raceId of Object.keys(RACES)) {
        const p = createPlayer(raceId, 'T_' + raceId);
        check(`create ${raceId}: attributes present`,
            p.attributes && typeof p.attributes.STR === 'number');
        check(`create ${raceId}: 18 skills`,
            Object.keys(p.skills).length === 18);
        check(`create ${raceId}: derived hp>0`,
            p.derived.maxHealth > 0);
    }

    // ── 2. Derived stats formula ───────────────────────────────────────────
    section('2. computeDerived formula');
    {
        const p = createPlayer('cindrak');
        const before = p.derived.maxHealth;
        computeDerived(p);
        const END = p.attributes.END;
        const expected = RACES.cindrak.health + END * 10 + 1 * 5;
        check('maxHealth = raceBase + END*10 + level*5', p.derived.maxHealth === expected,
            `got ${p.derived.maxHealth}, expected ${expected}`);
        check('baseArmor computed from END/4', p.derived.baseArmor >= Math.floor(END / 4));
        if (before !== p.derived.maxHealth) {
            warn('maxHealth jumps after first computeDerived',
                `creation set ${before}, computeDerived set ${p.derived.maxHealth} (creation skips the formula)`);
        }
    }

    // ── 3. Inventory ───────────────────────────────────────────────────────
    section('3. Inventory add / remove / weight');
    {
        const p = createPlayer();
        const w0 = getTotalWeight(p);
        const ok = addItem(p, 'iron_ore', 3);
        check('addItem returns true', ok === true);
        check('iron_ore count == 3', getItemCount(p, 'iron_ore') === 3);
        check('weight increased', getTotalWeight(p) > w0);
        removeItem(p, 'iron_ore', 2);
        check('removeItem leaves 1', getItemCount(p, 'iron_ore') === 1);
        check('hasItem(bread,2) true', hasItem(p, 'bread', 2) === true);
        // Overweight guard
        const huge = addItem(p, 'iron_ore', 100000);
        check('overweight add rejected', huge === false);
    }

    // ── 4. Equipment ───────────────────────────────────────────────────────
    section('4. Equip weapon');
    {
        const p = createPlayer();
        const ok = equipItem(p, 'iron_sword');
        check('equip iron_sword succeeds', ok === true);
        check('equipment.weapon set', p.equipment.weapon && p.equipment.weapon.id === 'iron_sword');
        check('iron_sword removed from inventory', getItemCount(p, 'iron_sword') === 0);
        check('weapon has damage stats', Array.isArray(p.equipment.weapon.stats.damage));
    }

    // ── 4b. Starting gear is usable by every race ──────────────────────────
    section('4b. Every race can equip its starting weapon');
    {
        for (const raceId of Object.keys(RACES)) {
            const p = createPlayer(raceId);
            const ok = equipItem(p, 'iron_sword');
            if (!ok) {
                warn(`${raceId} cannot equip starting iron_sword`,
                    `STR ${p.attributes.STR} < required (iron_sword needs STR 4); every character spawns with this sword in inventory`);
            } else {
                check(`${raceId} equips starting iron_sword`, true);
            }
        }
    }

    // ── 5. Combat ──────────────────────────────────────────────────────────
    section('5. Combat vs Goblin (statistical, 100 fights)');
    {
        const N = 100;
        let wins = 0, losses = 0, timeouts = 0, totalRounds = 0;
        let crashed = false;
        for (let i = 0; i < N; i++) {
            const p = createPlayer();
            equipItem(p, 'iron_sword');
            computeDerived(p);
            p.derived.health = p.derived.maxHealth; // full HP each fight
            try {
                const r = simulateCombat(p, 'goblin');
                if (r.result === 'victory') wins++;
                else if (r.result === 'defeat') losses++;
                else timeouts++;
                totalRounds += r.rounds;
            } catch (e) { crashed = true; console.log('    crash:', e.message); break; }
        }
        check('no crashes during 100 fights', !crashed);
        check('no infinite-loop timeouts', timeouts === 0, `${timeouts} timeouts`);
        check('player wins vs goblin majority', wins > losses, `wins=${wins} losses=${losses}`);
        console.log(`    stats: wins=${wins} losses=${losses} timeouts=${timeouts} avgRounds=${(totalRounds / N).toFixed(1)}`);
    }

    // ── 6. Loot & gold ─────────────────────────────────────────────────────
    section('6. Loot generation & gold drop');
    {
        let gotGold = false, gotItems = 0, runs = 200;
        for (let i = 0; i < runs; i++) {
            const loot = generateLoot(freshEnemy('bandit'));
            if (loot.some(l => l.itemId === 'gold_coin')) gotGold = true;
            gotItems += loot.length;
        }
        check('loot can drop items', gotItems > 0);
        if (!gotGold) {
            warn('combat kills never award gold',
                'enemies define `gold:[min,max]` but CombatSystem.generateLoot reads `enemy.goldRange` — gold never drops from combat');
        } else {
            check('combat awards gold', true);
        }
    }

    // ── 7. Skills & perks ──────────────────────────────────────────────────
    section('7. Skill XP, level-up, perk unlock');
    {
        const p = createPlayer();
        const before = getSkillLevel(p, 'blades');
        addXP(p, 'blades', 50); // > 100*1*1? threshold getXPToNextLevel(1)=100 -> need 100
        const mid = getSkillLevel(p, 'blades');
        check('small XP below threshold does not level', mid === before, `level ${before}->${mid}`);
        // Push to level 25 to unlock a perk
        addXP(p, 'blades', 5_000_000);
        check('bulk XP levels skill up', getSkillLevel(p, 'blades') > before);
        check('perk unlocked at level >=25',
            p.skills.blades.perksUnlocked.length > 0,
            `level=${getSkillLevel(p, 'blades')} perks=${JSON.stringify(p.skills.blades.perksUnlocked)}`);
        check('skill caps at 100', getSkillLevel(p, 'blades') <= 100);
    }

    // ── 8. Factions ────────────────────────────────────────────────────────
    section('8. Faction reputation');
    {
        const p = createPlayer();
        changeRep(p, 'rootwarden_circle', 30);
        check('rep increased', getRep(p, 'rootwarden_circle') === 30);
        changeRep(p, 'rootwarden_circle', 1000);
        check('rep clamps at +100', getRep(p, 'rootwarden_circle') === 100);
        changeRep(p, 'underlurk_cult', -1000);
        check('rep clamps at -100', getRep(p, 'underlurk_cult') === -100);
        check('getDisposition returns a string', typeof getDisposition(p, 'rootwarden_circle') === 'string');
    }

    // ── 9. Dialogue ────────────────────────────────────────────────────────
    section('9. Dialogue tree (cael_intro)');
    {
        const p = createPlayer();
        const display = await dlgStart('cael_intro', p, 'cael');
        check('dialogue start returns display', !!display, 'tree missing or failed');
        if (display) {
            check('display has text', typeof display.text === 'string' && display.text.length > 0);
            check('display has visible choices', Array.isArray(display.choices) && display.choices.length > 0);
            check('dialogue marked active', isDialogueActive() === true);
            // Walk the tree by always taking the first choice, up to 12 hops.
            let hops = 0, done = false, crashed = false;
            try {
                while (!done && hops < 12) {
                    const res = dlgChoose(0, p, null);
                    done = res.done; hops++;
                }
            } catch (e) { crashed = true; console.log('    dialogue crash:', e.message); }
            check('dialogue traversal does not crash', !crashed);
            check('dialogue terminates', done === true, `still open after ${hops} hops`);
        }
    }

    // ── 10. Quests ─────────────────────────────────────────────────────────
    section('10. Quest progression');
    {
        const p = createPlayer();
        subscribeToEvents(() => p, null);
        const started = await startQuest('main_act1', p, null);
        check('startQuest(main_act1) succeeds', started === true);
        check('quest is active', isQuestActive(p, 'main_act1') === true);
        check('getActiveObjectives does not crash', Array.isArray(getActiveObjectives(p)));

        const stageBefore = p.quests.active.get('main_act1'); // 0
        // Normal gameplay path: talking to Cael emits 'npc_talked_to'
        EventBus.emit('npc_talked_to', 'cael');
        const stageAfterEvent = p.quests.active.get('main_act1');
        check('quest advances on talk event (gameplay path)',
            stageAfterEvent === stageBefore + 1,
            `stage ${stageBefore} -> ${stageAfterEvent}`);

        // Direct API path advances by one from the CURRENT stage:
        const stageCur = p.quests.active.get('main_act1');
        advanceStage('main_act1', null, p, null);
        const stageAfterDirect = isQuestComplete(p, 'main_act1')
            ? stageCur + 1
            : p.quests.active.get('main_act1');
        check('advanceStage() advances exactly one stage',
            stageAfterDirect === stageCur + 1,
            `stage ${stageCur} -> ${stageAfterDirect}`);
    }

    // ── 11. Crafting ───────────────────────────────────────────────────────
    section('11. Crafting (smithing iron_sword)');
    {
        const p = createPlayer();
        addItem(p, 'iron_ingot', 5);
        addItem(p, 'leather_strips', 3);
        const known = getKnownRecipes(p, 'smithing');
        check('smithing recipes available', Array.isArray(known) && known.length > 0);
        const before = getItemCount(p, 'iron_sword');
        const can = canCraft('recipe_iron_sword', p, 'smithing');
        check('canCraft iron_sword with ingredients', can === true);
        const res = craft('recipe_iron_sword', p, null, 'smithing');
        check('craft succeeds', res && res.success === true, res && res.message);
        check('crafted item added to inventory', getItemCount(p, 'iron_sword') === before + 1);
        check('ingredients consumed', getItemCount(p, 'iron_ingot') === 3);
        check('smithing XP gained', p.skills.smithing.xp > 0 || getSkillLevel(p, 'smithing') > 1);
    }

    // ── 12. Save / Load round-trip ─────────────────────────────────────────
    section('12. Save / Load round-trip');
    {
        const p = createPlayer('cindrak', 'SaveTest'); // cindrak STR>=4 can equip
        const equipped = equipItem(p, 'iron_sword');
        check('equip succeeded before save', equipped === true);
        addItem(p, 'iron_ore', 7);
        p.flags.add('test_flag');
        p.quests.active.set('main_act1', 1);
        p.exploredTiles[123] = 1;
        changeRep(p, 'iron_compact', 25);
        const okSave = saveGame(p, { seed: 12345 });
        check('save returns true', okSave === true);
        check('hasSave true', hasSave() === true);
        const loaded = loadGame();
        check('load returns player', !!(loaded && loaded.player));
        if (loaded && loaded.player) {
            const lp = loaded.player;
            check('name preserved', lp.name === 'SaveTest');
            check('race preserved', lp.race === 'cindrak');
            check('flags (Set) preserved', lp.flags instanceof Set && lp.flags.has('test_flag'));
            check('quests.active (Map) preserved', lp.quests.active instanceof Map && lp.quests.active.get('main_act1') === 1);
            check('inventory preserved', getItemCount(lp, 'iron_ore') === 7);
            check('equipment preserved', lp.equipment.weapon && lp.equipment.weapon.id === 'iron_sword');
            check('exploredTiles (Uint8Array) preserved', lp.exploredTiles instanceof Uint8Array && lp.exploredTiles[123] === 1);
            check('factionRep preserved', lp.factionRep.iron_compact === 25);
        }
    }

    // ── Summary ────────────────────────────────────────────────────────────
    console.log('\n────────────────────────────────────────');
    console.log(`RESULT: ${PASS} passed, ${FAIL} failed, ${WARN} warnings`);
    if (findings.length) {
        console.log('\nFindings:');
        for (const f of findings) console.log('  • ' + f);
    }
    console.log('────────────────────────────────────────');
    process.exit(FAIL > 0 ? 1 : 0);
}

main().catch(e => { console.error('HARNESS CRASH:', e); process.exit(2); });
