import { equipItem, unequipItem, useItem, sortInventory, getTotalWeight } from '../systems/InventorySystem.js';
import { getItem, ITEMS } from '../data/items.js';
import { getSkillLevel } from '../systems/SkillSystem.js';
import EventBus from '../systems/EventBus.js';

const SLOT_SIZE = 36;
const GRID_COLS = 6;
const GRID_ROWS = 8;

export default class InventoryScene extends Phaser.Scene {
    constructor() { super({ key: 'Inventory' }); }

    init(data) {
        this.startTab = (data && data.tab) || 'inventory';
    }

    create() {
        const player = this.registry.get('player');
        if (!player) { this.scene.stop(); return; }

        const W = this.scale.width;
        const H = this.scale.height;

        this.selectedSlot   = -1;
        this.currentTab     = this.startTab;
        this.tooltipObjects = [];

        // ── Background panel ───────────────────────────────────────────────────
        this.add.rectangle(W / 2, H / 2, W - 40, H - 40, 0x05050f, 0.97)
            .setStrokeStyle(1, 0x2a2a5a).setScrollFactor(0).setDepth(100);

        // ── Title ──────────────────────────────────────────────────────────────
        this.add.text(W / 2, 28, 'Character & Inventory', {
            fontSize: '16px', color: '#00ccff', fontFamily: 'Courier New'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

        // ── Close button ───────────────────────────────────────────────────────
        const closeBtn = this.add.text(W - 32, 18, '[X]', {
            fontSize: '14px', color: '#cc4444', fontFamily: 'Courier New'
        }).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(101);
        closeBtn.on('pointerdown', () => this.scene.stop('Inventory'));
        this.input.keyboard.on('keydown-ESC', () => this.scene.stop('Inventory'));
        this.input.keyboard.on('keydown-I',   () => this.scene.stop('Inventory'));

        // ── Tabs ───────────────────────────────────────────────────────────────
        const tabs = ['inventory', 'quests', 'character'];
        const tabLabels = { inventory: 'Inventory', quests: 'Journal', character: 'Character' };
        this.tabObjects = {};

        tabs.forEach((tab, i) => {
            const tx  = 100 + i * 140;
            const ty  = 52;
            const bg  = this.add.rectangle(tx, ty, 120, 22, this.currentTab === tab ? 0x1a2a4a : 0x0d0d2a)
                .setStrokeStyle(1, this.currentTab === tab ? 0x00aaff : 0x2a2a5a)
                .setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true });
            const txt = this.add.text(tx, ty, tabLabels[tab], {
                fontSize: '11px', color: this.currentTab === tab ? '#88ccff' : '#5566aa',
                fontFamily: 'Courier New'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

            bg.on('pointerdown', () => this.switchTab(tab));
            this.tabObjects[tab] = { bg, txt };
        });

        // ── Content containers ─────────────────────────────────────────────────
        this.contentObjects = [];
        this.drawCurrentTab(player);

        // Tooltip (hidden until hover)
        this.tooltip = this.add.container(0, 0).setDepth(200).setScrollFactor(0);

        // Listen for hud_update
        EventBus.on('hud_update', this.refresh, this);
    }

    switchTab(tab) {
        this.currentTab = tab;

        // Update tab visuals
        for (const [t, obj] of Object.entries(this.tabObjects)) {
            const active = t === tab;
            obj.bg.setFillStyle(active ? 0x1a2a4a : 0x0d0d2a);
            obj.bg.setStrokeStyle(1, active ? 0x00aaff : 0x2a2a5a);
            obj.txt.setColor(active ? '#88ccff' : '#5566aa');
        }

        // Clear and redraw
        for (const obj of this.contentObjects) obj.destroy();
        this.contentObjects = [];
        this.selectedSlot = -1;
        this.hideTooltip();

        const player = this.registry.get('player');
        if (player) this.drawCurrentTab(player);
    }

    drawCurrentTab(player) {
        if (this.currentTab === 'inventory') this.drawInventory(player);
        else if (this.currentTab === 'quests')    this.drawQuests(player);
        else if (this.currentTab === 'character')  this.drawCharacter(player);
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  INVENTORY TAB
    // ──────────────────────────────────────────────────────────────────────────
    drawInventory(player) {
        const W = this.scale.width;
        const H = this.scale.height;
        const gridLeft = 30;
        const gridTop  = 78;

        // ── Grid slots ─────────────────────────────────────────────────────────
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const slotIdx = row * GRID_COLS + col;
                const sx = gridLeft + col * (SLOT_SIZE + 2);
                const sy = gridTop  + row * (SLOT_SIZE + 2);

                const bg = this.add.rectangle(sx + SLOT_SIZE / 2, sy + SLOT_SIZE / 2, SLOT_SIZE - 2, SLOT_SIZE - 2, 0x0a0a1a)
                    .setStrokeStyle(1, slotIdx === this.selectedSlot ? 0x00ccff : 0x222244)
                    .setScrollFactor(0).setDepth(102)
                    .setInteractive({ useHandCursor: true });

                const slotData = player.inventory[slotIdx];
                let itemTxt = null;

                if (slotData) {
                    const def = getItem(slotData.itemId);

                    // Item icon (tiny coloured square as fallback)
                    const iconKey = def ? `item_${slotData.itemId}` : null;
                    if (iconKey && this.textures.exists(iconKey)) {
                        const icon = this.add.image(sx + SLOT_SIZE / 2, sy + SLOT_SIZE / 2 - 4, iconKey)
                            .setDisplaySize(22, 22).setScrollFactor(0).setDepth(103);
                        this.contentObjects.push(icon);
                    } else if (def) {
                        // Colour code by type
                        const typeColors = { weapon: 0xcc4444, armor: 0x4444cc, consumable: 0x44cc44, ingredient: 0x44ccaa, quest: 0xdddd00, misc: 0x888888 };
                        const ic = this.add.rectangle(sx + SLOT_SIZE / 2, sy + SLOT_SIZE / 2 - 4, 20, 20, typeColors[def.type] || 0x888888)
                            .setScrollFactor(0).setDepth(103);
                        this.contentObjects.push(ic);
                    }

                    if (def && slotData.quantity > 1) {
                        itemTxt = this.add.text(sx + SLOT_SIZE - 8, sy + SLOT_SIZE - 10,
                            String(slotData.quantity), {
                                fontSize: '8px', color: '#ffffff', fontFamily: 'Courier New'
                            }).setOrigin(1, 1).setScrollFactor(0).setDepth(104);
                        this.contentObjects.push(itemTxt);
                    }

                    bg.on('pointerover', () => {
                        this.showItemTooltip(def, slotData, sx, sy);
                    });
                    bg.on('pointerout', () => this.hideTooltip());

                    bg.on('pointerdown', () => {
                        if (this.selectedSlot === slotIdx) {
                            // Double-action: use or equip
                            this.useOrEquip(slotData, player);
                        } else {
                            this.selectedSlot = slotIdx;
                            this.refresh(player);
                        }
                    });
                } else {
                    bg.on('pointerdown', () => { this.selectedSlot = -1; });
                }

                this.contentObjects.push(bg);
            }
        }

        // ── Equipment paper doll (right side) ─────────────────────────────────
        const dollX = W - 200;
        const dollY = 120;

        this.add.text(dollX, 70, 'Equipment', {
            fontSize: '13px', color: '#00ccff', fontFamily: 'Courier New'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        const equipSlots = [
            { slot: 'head',    label: 'Head',    x: dollX,       y: dollY },
            { slot: 'chest',   label: 'Chest',   x: dollX,       y: dollY + 52 },
            { slot: 'legs',    label: 'Legs',    x: dollX,       y: dollY + 104 },
            { slot: 'hands',   label: 'Hands',   x: dollX - 60,  y: dollY + 78 },
            { slot: 'feet',    label: 'Feet',    x: dollX,       y: dollY + 156 },
            { slot: 'weapon',  label: 'Weapon',  x: dollX - 60,  y: dollY + 26 },
            { slot: 'offhand', label: 'Shield',  x: dollX + 60,  y: dollY + 26 },
            { slot: 'ring',    label: 'Ring',    x: dollX + 60,  y: dollY + 78 }
        ];

        for (const es of equipSlots) {
            const item = player.equipment[es.slot];

            const bg = this.add.rectangle(es.x, es.y, 48, 44, item ? 0x112233 : 0x080818)
                .setStrokeStyle(1, item ? 0x4488cc : 0x222244)
                .setScrollFactor(0).setDepth(102).setInteractive({ useHandCursor: true });

            const label = this.add.text(es.x, es.y + 26, es.label, {
                fontSize: '8px', color: '#445566', fontFamily: 'Courier New'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(103);

            if (item) {
                const nameShort = item.name.substring(0, 8);
                const nameTxt = this.add.text(es.x, es.y - 4, nameShort, {
                    fontSize: '7px', color: '#88aacc', fontFamily: 'Courier New'
                }).setOrigin(0.5).setScrollFactor(0).setDepth(103);
                this.contentObjects.push(nameTxt);

                bg.on('pointerover', () => this.showItemTooltip(item, { itemId: item.id, quantity: 1 }, es.x, es.y));
                bg.on('pointerout',  () => this.hideTooltip());
                bg.on('pointerdown', () => {
                    unequipItem(player, es.slot, this);
                    this.switchTab('inventory');
                });
            } else {
                bg.on('pointerdown', () => {
                    // Try to equip selected item into this slot
                    if (this.selectedSlot >= 0 && player.inventory[this.selectedSlot]) {
                        const slot = player.inventory[this.selectedSlot];
                        const def  = getItem(slot.itemId);
                        if (def) {
                            equipItem(player, slot.itemId, this);
                            this.selectedSlot = -1;
                            this.switchTab('inventory');
                        }
                    }
                });
            }

            this.contentObjects.push(bg, label);
        }

        // ── Weight and gold ────────────────────────────────────────────────────
        const wgt    = getTotalWeight(player);
        const maxWgt = player.derived.maxCarryWeight;
        const wgtTxt = this.add.text(W / 2, H - 22,
            `Weight: ${wgt.toFixed(1)} / ${maxWgt}  |  Gold: ${player.gold}g`, {
                fontSize: '10px', color: wgt > maxWgt * 0.9 ? '#ff6644' : '#667788',
                fontFamily: 'Courier New'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        // Sort button
        const sortBtn = this.add.text(gridLeft + GRID_COLS * (SLOT_SIZE + 2) - 10, H - 22, '[Sort]', {
            fontSize: '10px', color: '#5566aa', fontFamily: 'Courier New'
        }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(102).setInteractive({ useHandCursor: true });
        sortBtn.on('pointerdown', () => {
            sortInventory(player);
            this.switchTab('inventory');
        });

        this.contentObjects.push(wgtTxt, sortBtn);

        // Selection panel (use / drop)
        if (this.selectedSlot >= 0 && player.inventory[this.selectedSlot]) {
            const slot = player.inventory[this.selectedSlot];
            const def  = getItem(slot.itemId);
            if (def) {
                const pY = gridTop + GRID_ROWS * (SLOT_SIZE + 2) + 12;

                const useBtn = this.add.text(gridLeft + 30, pY, '[Use/Equip]', {
                    fontSize: '11px', color: '#88cc88', fontFamily: 'Courier New'
                }).setScrollFactor(0).setDepth(103).setInteractive({ useHandCursor: true });
                useBtn.on('pointerdown', () => this.useOrEquip(slot, player));

                const selName = this.add.text(gridLeft + 140, pY, def.name, {
                    fontSize: '11px', color: '#aabbcc', fontFamily: 'Courier New'
                }).setScrollFactor(0).setDepth(103);

                this.contentObjects.push(useBtn, selName);
            }
        }
    }

    useOrEquip(slotData, player) {
        const def = getItem(slotData.itemId);
        if (!def) return;

        if (def.type === 'weapon' || def.type === 'armor') {
            const ok = equipItem(player, slotData.itemId, this);
            if (ok) {
                EventBus.emit('show_notification', `Equipped: ${def.name}`, '#88ccff');
                this.switchTab('inventory');
            }
        } else if (def.type === 'consumable' || (def.effects && def.effects.length)) {
            const ok = useItem(player, slotData.itemId, this);
            if (ok) this.switchTab('inventory');
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  QUESTS TAB
    // ──────────────────────────────────────────────────────────────────────────
    drawQuests(player) {
        const W = this.scale.width;
        let y = 78;
        const x = 40;

        this.add.text(W / 2, y, 'Journal', {
            fontSize: '15px', color: '#aabb88', fontFamily: 'Courier New'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        y += 30;

        // Active quests
        const active = Array.from(player.quests.active.entries());
        if (active.length === 0) {
            const t = this.add.text(W / 2, y + 20, 'No active quests.', {
                fontSize: '12px', color: '#445566', fontFamily: 'Courier New'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
            this.contentObjects.push(t);
            y += 44;
        } else {
            const hdr = this.add.text(x, y, '── Active Quests ──────────────────────────────', {
                fontSize: '11px', color: '#aabb88', fontFamily: 'Courier New'
            }).setScrollFactor(0).setDepth(102);
            this.contentObjects.push(hdr);
            y += 20;

            for (const [questId, stageIndex] of active) {
                const qName = questId.replace(/_/g, ' ');
                const qtxt = this.add.text(x + 10, y, `► ${qName}  [Stage ${stageIndex + 1}]`, {
                    fontSize: '12px', color: '#ccdd88', fontFamily: 'Courier New'
                }).setScrollFactor(0).setDepth(102);
                this.contentObjects.push(qtxt);
                y += 20;
            }
        }

        y += 14;

        // Completed quests
        const completed = Array.from(player.quests.completed);
        if (completed.length > 0) {
            const hdr2 = this.add.text(x, y, '── Completed ──────────────────────────────────', {
                fontSize: '11px', color: '#446644', fontFamily: 'Courier New'
            }).setScrollFactor(0).setDepth(102);
            this.contentObjects.push(hdr2);
            y += 20;

            for (const questId of completed.slice(0, 10)) {
                const qt = this.add.text(x + 10, y, `✓ ${questId.replace(/_/g, ' ')}`, {
                    fontSize: '11px', color: '#557755', fontFamily: 'Courier New'
                }).setScrollFactor(0).setDepth(102);
                this.contentObjects.push(qt);
                y += 18;
            }
        }

        // World time / in-game date
        const hours  = Math.floor((player.worldTime / 60) % 24);
        const mins   = Math.floor(player.worldTime % 60);
        const dayNum = Math.floor(player.worldTime / (60 * 24)) + 1;
        const timeTxt = this.add.text(W / 2, this.scale.height - 30,
            `Day ${dayNum}  |  ${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}`, {
                fontSize: '11px', color: '#445566', fontFamily: 'Courier New'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
        this.contentObjects.push(timeTxt);
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  CHARACTER TAB
    // ──────────────────────────────────────────────────────────────────────────
    drawCharacter(player) {
        const W  = this.scale.width;
        const H  = this.scale.height;
        const lx = 40;
        const rx = W / 2 + 20;
        let ly   = 80;
        let ry   = 80;

        // ── Left: Attributes ───────────────────────────────────────────────────
        const attrHdr = this.add.text(lx, ly, `${player.name} — Level ${player.level} ${player.race}`, {
            fontSize: '13px', color: '#00ccff', fontFamily: 'Courier New'
        }).setScrollFactor(0).setDepth(102);
        this.contentObjects.push(attrHdr);
        ly += 28;

        const xpBar = this.makeXpBar(lx, ly, 260, player.xp || 0, (player.level || 1) * 100);
        this.contentObjects.push(...xpBar);
        ly += 22;

        const attrs = [
            ['Strength',     player.attributes.STR],
            ['Endurance',    player.attributes.END],
            ['Agility',      player.attributes.AGI],
            ['Intelligence', player.attributes.INT],
            ['Willpower',    player.attributes.WIL],
            ['Perception',   player.attributes.PER]
        ];
        for (const [name, val] of attrs) {
            const at = this.add.text(lx, ly, `${name.padEnd(14)} ${String(val).padStart(3)}`, {
                fontSize: '11px', color: '#8899aa', fontFamily: 'Courier New'
            }).setScrollFactor(0).setDepth(102);
            this.contentObjects.push(at);
            ly += 16;
        }

        ly += 10;
        const derived = [
            [`HP`,  `${Math.ceil(player.derived.health)} / ${player.derived.maxHealth}`],
            [`MP`,  `${Math.ceil(player.derived.mana)} / ${player.derived.maxMana}`],
            [`ST`,  `${Math.ceil(player.derived.stamina)} / ${player.derived.maxStamina}`],
            [`Armor`, `${player.derived.baseArmor}`],
            [`Speed`, `${player.derived.moveSpeed}`]
        ];
        for (const [label, val] of derived) {
            const dt = this.add.text(lx, ly, `${label.padEnd(8)} ${val}`, {
                fontSize: '11px', color: '#667788', fontFamily: 'Courier New'
            }).setScrollFactor(0).setDepth(102);
            this.contentObjects.push(dt);
            ly += 16;
        }

        ly += 10;
        // Faction reputations
        const fHdr = this.add.text(lx, ly, '── Factions ────────────────────────', {
            fontSize: '10px', color: '#445566', fontFamily: 'Courier New'
        }).setScrollFactor(0).setDepth(102);
        this.contentObjects.push(fHdr);
        ly += 16;

        for (const [fId, rep] of Object.entries(player.factionRep)) {
            const col  = rep >= 50 ? '#44cc44' : rep >= 0 ? '#8899aa' : '#cc4444';
            const name = fId.replace(/_/g, ' ');
            const rt   = this.add.text(lx, ly, `${name.substring(0,18).padEnd(18)} ${rep > 0 ? '+' : ''}${rep}`, {
                fontSize: '10px', color: col, fontFamily: 'Courier New'
            }).setScrollFactor(0).setDepth(102);
            this.contentObjects.push(rt);
            ly += 14;
        }

        // ── Right: Skills ──────────────────────────────────────────────────────
        const skillHdr = this.add.text(rx, ry, '── Skills ────────────────────────', {
            fontSize: '10px', color: '#445566', fontFamily: 'Courier New'
        }).setScrollFactor(0).setDepth(102);
        this.contentObjects.push(skillHdr);
        ry += 18;

        const skillGroups = [
            ['Combat',  ['blades', 'blunt', 'archery', 'block']],
            ['Magic',   ['destruction', 'restoration', 'illusion', 'conjuration']],
            ['Stealth', ['sneak', 'lockpicking', 'pickpocket']],
            ['Craft',   ['smithing', 'alchemy', 'enchanting', 'herbalism']],
            ['Social',  ['speech', 'negotiation', 'survival']]
        ];

        for (const [groupName, skillIds] of skillGroups) {
            const ghdr = this.add.text(rx, ry, groupName, {
                fontSize: '10px', color: '#556677', fontFamily: 'Courier New'
            }).setScrollFactor(0).setDepth(102);
            this.contentObjects.push(ghdr);
            ry += 14;

            for (const skillId of skillIds) {
                const sk    = player.skills[skillId];
                if (!sk) continue;
                const level = sk.level;
                const xp    = sk.xp || 0;
                const xpMax = level * 50;

                const skTxt = this.add.text(rx + 4, ry, `${skillId.padEnd(14)} Lv.${String(level).padStart(2)}`, {
                    fontSize: '10px', color: '#778899', fontFamily: 'Courier New'
                }).setScrollFactor(0).setDepth(102);

                // Mini XP bar
                const barW = 80;
                const barBg  = this.add.rectangle(rx + 180, ry + 5, barW, 6, 0x111122)
                    .setScrollFactor(0).setDepth(102).setOrigin(0, 0.5);
                const barFill = this.add.rectangle(rx + 180, ry + 5, Math.floor(barW * Math.min(1, xp / xpMax)), 4, 0x2244cc)
                    .setScrollFactor(0).setDepth(103).setOrigin(0, 0.5);

                this.contentObjects.push(skTxt, barBg, barFill);
                ry += 16;
            }
            ry += 4;
        }
    }

    makeXpBar(x, y, w, xp, xpMax) {
        const bg   = this.add.rectangle(x + w / 2, y, w, 10, 0x111122)
            .setStrokeStyle(1, 0x222244).setScrollFactor(0).setDepth(102).setOrigin(0.5);
        const fill = this.add.rectangle(x, y, Math.floor(w * Math.min(1, xp / xpMax)), 8, 0x8855cc)
            .setScrollFactor(0).setDepth(103).setOrigin(0, 0.5);
        const txt  = this.add.text(x + w / 2, y, `${xp} / ${xpMax} XP`, {
            fontSize: '8px', color: '#887799', fontFamily: 'Courier New'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(104);
        return [bg, fill, txt];
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  TOOLTIP
    // ──────────────────────────────────────────────────────────────────────────
    showItemTooltip(itemDef, slotData, x, y) {
        if (!itemDef) return;
        this.hideTooltip();

        const W   = this.scale.width;
        const H   = this.scale.height;
        const tipW = 200;
        const tipX = Math.min(x + 22, W - tipW - 10);
        const tipY = Math.max(y - 20, 10);

        const lines = [
            { text: itemDef.name, color: '#ddccff', size: '12px' },
            { text: `${itemDef.type}${itemDef.subtype ? ' · ' + itemDef.subtype : ''}`, color: '#6677aa', size: '10px' },
        ];

        if (itemDef.stats) {
            if (itemDef.stats.damage) {
                const [mn, mx] = Array.isArray(itemDef.stats.damage) ? itemDef.stats.damage : [itemDef.stats.damage, itemDef.stats.damage];
                lines.push({ text: `Damage: ${mn}-${mx}`, color: '#cc8844', size: '10px' });
            }
            if (itemDef.stats.defense) lines.push({ text: `Defense: +${itemDef.stats.defense}`, color: '#4488cc', size: '10px' });
            if (itemDef.stats.magicDamage) lines.push({ text: `Magic: +${itemDef.stats.magicDamage}`, color: '#8855cc', size: '10px' });
        }

        if (itemDef.description) {
            lines.push({ text: itemDef.description, color: '#8899aa', size: '9px' });
        }

        lines.push({ text: `Value: ${itemDef.value || 0}g  |  Weight: ${itemDef.weight || 0}`, color: '#445566', size: '9px' });

        let offY = 0;
        const objs = [];
        const bg = this.add.rectangle(tipX + tipW / 2, tipY + lines.length * 14 / 2 + 8, tipW + 10, lines.length * 14 + 16, 0x050510, 0.95)
            .setStrokeStyle(1, 0x334466).setScrollFactor(0).setDepth(210).setOrigin(0.5);
        objs.push(bg);

        for (const ln of lines) {
            const t = this.add.text(tipX, tipY + offY, ln.text, {
                fontSize: ln.size, color: ln.color, fontFamily: 'Courier New',
                wordWrap: { width: tipW }
            }).setScrollFactor(0).setDepth(211);
            objs.push(t);
            offY += 14;
        }

        this.tooltipObjects = objs;
    }

    hideTooltip() {
        for (const o of this.tooltipObjects) o.destroy();
        this.tooltipObjects = [];
    }

    refresh(player) {
        if (!player) player = this.registry.get('player');
        if (!player) return;
        for (const obj of this.contentObjects) obj.destroy();
        this.contentObjects = [];
        this.hideTooltip();
        this.drawCurrentTab(player);
    }

    shutdown() {
        EventBus.off('hud_update', this.refresh, this);
        this.hideTooltip();
    }
}
