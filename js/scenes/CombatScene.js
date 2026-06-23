import {
    createCombatState,
    playerAttack,
    enemyTurn,
    nextRound,
    generateLoot
} from '../systems/CombatSystem.js';
import { useItem } from '../systems/InventorySystem.js';
import { getItem, ITEMS } from '../data/items.js';
import EventBus from '../systems/EventBus.js';

const PANEL_W = 960;
const PANEL_H = 640;

export default class CombatScene extends Phaser.Scene {
    constructor() { super({ key: 'Combat' }); }

    init(data) {
        this.enemyEntity = data.enemy || null;
    }

    create() {
        const player = this.registry.get('player');
        if (!player) { this.scene.stop(); return; }

        const enemy = this.enemyEntity
            ? { ...this.enemyEntity.template, health: this.enemyEntity.health, maxHealth: this.enemyEntity.maxHealth }
            : { id: 'goblin', name: 'Goblin', health: 25, maxHealth: 25, attributes: { STR: 4, END: 3, AGI: 6, INT: 2, WIL: 2, PER: 5 }, damage: [3, 7], armor: 2, lootTable: [], goldRange: [2, 8], xpReward: 20, spriteKey: 'enemy_goblin', skillLevel: 10 };

        this.combatState = createCombatState(player, enemy);
        this.combatLog   = [];
        this.playerTurn  = true;
        this.ended       = false;
        this.selectedItemIndex = -1;

        const W = PANEL_W, H = PANEL_H;

        // ── Full-screen dark overlay ──────────────────────────────────────────
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.92).setDepth(0);

        // ── Combat title banner ───────────────────────────────────────────────
        this.add.text(W / 2, 18, '⚔ COMBAT ⚔', {
            fontSize: '16px', color: '#cc4444', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(1);

        // ── Enemy area (top centre) ───────────────────────────────────────────
        const enemyPanelX = W / 2;
        const enemyPanelY = 120;

        this.add.rectangle(enemyPanelX, enemyPanelY, 260, 160, 0x110000)
            .setStrokeStyle(1, 0x440000).setDepth(1);

        // Enemy sprite / fallback rectangle
        const eKey = enemy.spriteKey;
        if (this.textures.exists(eKey)) {
            this.enemySprite = this.add.image(enemyPanelX, enemyPanelY - 20, eKey)
                .setDisplaySize(enemy.isBoss ? 92 : 72, enemy.isBoss ? 104 : 82).setDepth(2);
        } else {
            this.enemySprite = this.add.rectangle(enemyPanelX, enemyPanelY - 20, 48, 60, 0xcc3333)
                .setDepth(2);
        }

        this.enemyNameText = this.add.text(enemyPanelX, enemyPanelY + 40, enemy.name, {
            fontSize: '14px', color: '#ff8888', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(2);

        // Enemy HP bar
        this.add.rectangle(enemyPanelX, enemyPanelY + 58, 180, 10, 0x330000)
            .setStrokeStyle(1, 0x550000).setDepth(2);
        this.enemyHpFill = this.add.rectangle(enemyPanelX - 89, enemyPanelY + 58, 178, 8, 0xcc2222)
            .setOrigin(0, 0.5).setDepth(3);
        this.enemyHpText = this.add.text(enemyPanelX, enemyPanelY + 58,
            `${enemy.health} / ${enemy.maxHealth}`, {
                fontSize: '9px', color: '#ffaaaa', fontFamily: 'Courier New'
            }).setOrigin(0.5).setDepth(4);

        // ── Player status (bottom-left) ───────────────────────────────────────
        const playerPanelX = 130;
        const playerPanelY = H - 160;

        this.add.rectangle(playerPanelX, playerPanelY, 240, 120, 0x001122)
            .setStrokeStyle(1, 0x003366).setDepth(1);

        this.add.text(playerPanelX - 110, playerPanelY - 50, player.name || 'Player', {
            fontSize: '13px', color: '#88ccff', fontFamily: 'Courier New'
        }).setDepth(2);

        // Player HP / MP bars
        this.playerHpBar  = this.makeBar(playerPanelX - 110, playerPanelY - 30, 200, 10, 0xcc2222, 'HP', 2);
        this.playerMpBar  = this.makeBar(playerPanelX - 110, playerPanelY - 14, 200, 10, 0x2244cc, 'MP', 2);
        this.playerStBar  = this.makeBar(playerPanelX - 110, playerPanelY +  2, 200, 10, 0x22aa44, 'ST', 2);

        // Equipped weapon info
        const wep     = player.equipment && player.equipment.weapon;
        const wepName = wep ? wep.name : 'Bare Fists';
        this.add.text(playerPanelX - 110, playerPanelY + 22, `Weapon: ${wepName}`, {
            fontSize: '9px', color: '#667788', fontFamily: 'Courier New'
        }).setDepth(2);

        // ── Action menu (bottom centre) ───────────────────────────────────────
        const menuX = W / 2;
        const menuY = H - 130;

        this.add.rectangle(menuX, menuY, 300, 100, 0x001100)
            .setStrokeStyle(1, 0x224422).setDepth(1);
        this.add.text(menuX, menuY - 42, 'Choose Action:', {
            fontSize: '11px', color: '#aabbaa', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(2);

        const actions = [
            { key: 'attack',  label: '[A] Attack',  x: menuX - 110, y: menuY - 20 },
            { key: 'defend',  label: '[D] Defend',  x: menuX -  30, y: menuY - 20 },
            { key: 'item',    label: '[I] Item',     x: menuX +  50, y: menuY - 20 },
            { key: 'spell',   label: '[S] Spell',   x: menuX - 110, y: menuY +  4 },
            { key: 'flee',    label: '[F] Flee',    x: menuX -  30, y: menuY +  4 }
        ];

        this.actionButtons = [];
        for (const a of actions) {
            const btn = this.add.text(a.x, a.y, a.label, {
                fontSize: '12px', color: '#88cc88', fontFamily: 'Courier New',
                backgroundColor: '#001a00', padding: { x: 5, y: 3 }
            }).setDepth(2).setInteractive({ useHandCursor: true });

            btn.on('pointerover', () => btn.setColor('#ccffcc'));
            btn.on('pointerout',  () => btn.setColor('#88cc88'));
            btn.on('pointerdown', () => this.handleAction(a.key));
            this.actionButtons.push(btn);
        }

        // Keyboard shortcuts
        this.input.keyboard.on('keydown-A', () => this.handleAction('attack'));
        this.input.keyboard.on('keydown-D', () => this.handleAction('defend'));
        this.input.keyboard.on('keydown-I', () => this.handleAction('item'));
        this.input.keyboard.on('keydown-S', () => this.handleAction('spell'));
        this.input.keyboard.on('keydown-F', () => this.handleAction('flee'));

        // ── Combat log (right panel) ──────────────────────────────────────────
        const logX = W - 200;
        const logY = H / 2 - 30;

        this.add.rectangle(logX, logY, 360, 340, 0x050510)
            .setStrokeStyle(1, 0x1a1a3a).setDepth(1);
        this.add.text(logX - 170, logY - 160, '── Combat Log ──', {
            fontSize: '10px', color: '#445566', fontFamily: 'Courier New'
        }).setDepth(2);

        this.logTexts = [];
        for (let i = 0; i < 12; i++) {
            this.logTexts.push(this.add.text(logX - 172, logY - 140 + i * 22, '', {
                fontSize: '10px', color: '#aabbcc', fontFamily: 'Courier New',
                wordWrap: { width: 340 }
            }).setDepth(2));
        }

        // ── Item sub-menu (hidden by default) ────────────────────────────────
        this.itemPanel = this.add.container(0, 0).setDepth(10);
        this.buildItemPanel(player);

        // ── Round counter ─────────────────────────────────────────────────────
        this.roundText = this.add.text(W / 2, H - 20, 'Round 1', {
            fontSize: '10px', color: '#445566', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(2);

        // Initial log entry
        this.addLog(`Combat begins! ${enemy.name} attacks!`, '#ff8888');
        this.updateUI();
    }

    makeBar(x, y, w, h, color, label, depth) {
        this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x111111)
            .setStrokeStyle(1, 0x222222).setDepth(depth);
        const fill = this.add.rectangle(x, y + h / 2, w, h - 2, color)
            .setOrigin(0, 0.5).setDepth(depth + 1);
        this.add.text(x + w + 4, y, label, {
            fontSize: '8px', color: '#667788', fontFamily: 'Courier New'
        }).setDepth(depth + 2);
        return fill;
    }

    buildItemPanel(player) {
        // Destroy previous children
        this.itemPanel.removeAll(true);
        this.itemPanel.setVisible(false);

        const W = PANEL_W, H = PANEL_H;
        const panelX = W / 2 - 80;
        const panelY = H / 2 + 20;

        const bg = this.add.rectangle(panelX + 80, panelY, 200, 160, 0x001100)
            .setStrokeStyle(1, 0x224422).setDepth(11);
        this.itemPanel.add(bg);

        const title = this.add.text(panelX + 80, panelY - 70, 'Select Item:', {
            fontSize: '11px', color: '#88cc88', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(12);
        this.itemPanel.add(title);

        // Filter consumable items in inventory
        const consumables = player.inventory.filter(slot => {
            const def = getItem(slot.itemId);
            return def && (def.type === 'consumable' || (def.effects && def.effects.length));
        });

        if (consumables.length === 0) {
            const noItem = this.add.text(panelX + 80, panelY, 'No usable items.', {
                fontSize: '10px', color: '#666666', fontFamily: 'Courier New'
            }).setOrigin(0.5).setDepth(12);
            this.itemPanel.add(noItem);
        } else {
            consumables.slice(0, 6).forEach((slot, i) => {
                const def = getItem(slot.itemId);
                const iy  = panelY - 50 + i * 18;
                const btn = this.add.text(panelX + 10, iy, `${def.name} x${slot.quantity}`, {
                    fontSize: '10px', color: '#99bbaa', fontFamily: 'Courier New'
                }).setInteractive({ useHandCursor: true }).setDepth(12);
                btn.on('pointerover', () => btn.setColor('#ccffcc'));
                btn.on('pointerout',  () => btn.setColor('#99bbaa'));
                btn.on('pointerdown', () => {
                    this.itemPanel.setVisible(false);
                    this.useItemInCombat(slot.itemId, player);
                });
                this.itemPanel.add(btn);
            });
        }

        const closeBtn = this.add.text(panelX + 80, panelY + 70, '[ Cancel ]', {
            fontSize: '10px', color: '#888888', fontFamily: 'Courier New'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(12);
        closeBtn.on('pointerdown', () => this.itemPanel.setVisible(false));
        this.itemPanel.add(closeBtn);
    }

    handleAction(action) {
        if (!this.playerTurn || this.ended) return;

        const player = this.registry.get('player');

        if (action === 'item') {
            this.buildItemPanel(player);
            this.itemPanel.setVisible(true);
            return;
        }

        if (action === 'spell') {
            // Use equipped weapon's magic attack (same as normal attack but isMagic=true)
            this.executePlayerTurn('attack', player);
            return;
        }

        this.executePlayerTurn(action, player);
    }

    useItemInCombat(itemId, player) {
        const result = useItem(player, itemId, this);
        if (result) {
            const def = getItem(itemId);
            this.addLog(`You used ${def ? def.name : itemId}.`, '#88ffaa');
        } else {
            this.addLog('Could not use that item.', '#ff8888');
        }
        this.updateUI();
        this.playerTurn = false;
        this.time.delayedCall(600, () => this.runEnemyTurn());
    }

    executePlayerTurn(action, player) {
        this.playerTurn = false;
        this.setActionsEnabled(false);

        const result = playerAttack(this.combatState, action);
        this.addLog(result.message, result.hit ? '#ccffcc' : '#ffcccc');

        if (result.statusApplied) {
            this.addLog(`Status: ${result.statusApplied} applied to enemy.`, '#ffdd88');
        }

        this.updateUI();

        if (result.combatOver) {
            this.time.delayedCall(800, () => this.endCombat(result.result, result.loot));
            return;
        }

        // Enemy turn after a delay
        this.time.delayedCall(700, () => this.runEnemyTurn());
    }

    runEnemyTurn() {
        if (this.ended) return;

        const result = enemyTurn(this.combatState);
        this.addLog(result.message, result.hit ? '#ffaaaa' : '#aaaaaa');

        if (result.statusApplied) {
            this.addLog(`You are ${result.statusApplied}!`, '#ffdd44');
        }

        this.updateUI();

        if (result.combatOver) {
            this.time.delayedCall(800, () => this.endCombat(result.result, result.loot || []));
            return;
        }

        nextRound(this.combatState);
        this.roundText.setText(`Round ${this.combatState.round}`);
        this.playerTurn = true;
        this.setActionsEnabled(true);
    }

    endCombat(result, loot = []) {
        if (this.ended) return;
        this.ended = true;
        this.pendingLoot = loot;
        this.setActionsEnabled(false);
        this.input.keyboard.removeAllListeners();

        const W = PANEL_W, H = PANEL_H;

        if (result === 'victory') {
            // Show victory panel
            const vPanel = this.add.rectangle(W / 2, H / 2, 360, 280, 0x001100)
                .setStrokeStyle(2, 0x44aa44).setDepth(20);

            this.add.text(W / 2, H / 2 - 110, 'VICTORY!', {
                fontSize: '24px', color: '#44ff44', fontFamily: 'Courier New'
            }).setOrigin(0.5).setDepth(21);

            const xp = this.combatState.enemy.xpReward || 20;
            this.add.text(W / 2, H / 2 - 70, `+${xp} XP`, {
                fontSize: '14px', color: '#ffdd44', fontFamily: 'Courier New'
            }).setOrigin(0.5).setDepth(21);

            if (loot && loot.length > 0) {
                this.add.text(W / 2, H / 2 - 46, 'Loot:', {
                    fontSize: '12px', color: '#aabbcc', fontFamily: 'Courier New'
                }).setOrigin(0.5).setDepth(21);

                loot.forEach((item, i) => {
                    const def  = getItem(item.itemId);
                    const name = (item.itemId === 'gold_coin' || item.itemId === 'gold')
                        ? `${item.quantity} Gold`
                        : `${def ? def.name : item.itemId} x${item.quantity}`;
                    this.add.text(W / 2, H / 2 - 24 + i * 18, name, {
                        fontSize: '11px', color: '#ffdd88', fontFamily: 'Courier New'
                    }).setOrigin(0.5).setDepth(21);
                });
            }

            const continueBtn = this.add.text(W / 2, H / 2 + 90, '[ Continue ]', {
                fontSize: '14px', color: '#44ff44', fontFamily: 'Courier New'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(21);

            continueBtn.on('pointerdown', () => {
                if (this.enemyEntity) this.enemyEntity.die();
                EventBus.emit('combat_end', 'victory', loot);
                this.scene.stop('Combat');
            });

            // Award XP to player
            const player = this.registry.get('player');
            if (player) player.xp = (player.xp || 0) + xp;

        } else if (result === 'fled') {
            this.addLog('You escaped!', '#ffdd44');
            this.time.delayedCall(1000, () => {
                EventBus.emit('combat_end', 'fled', []);
                this.scene.stop('Combat');
            });

        } else {
            // Defeat
            const dPanel = this.add.rectangle(W / 2, H / 2, 360, 240, 0x110000)
                .setStrokeStyle(2, 0xaa2222).setDepth(20);

            this.add.text(W / 2, H / 2 - 90, 'DEFEATED', {
                fontSize: '28px', color: '#ff4444', fontFamily: 'Courier New'
            }).setOrigin(0.5).setDepth(21);

            this.add.text(W / 2, H / 2 - 44, 'You have fallen in battle...', {
                fontSize: '12px', color: '#888888', fontFamily: 'Courier New'
            }).setOrigin(0.5).setDepth(21);

            const reloadBtn = this.add.text(W / 2, H / 2 + 30, '[ Reload Last Save ]', {
                fontSize: '14px', color: '#ffaaaa', fontFamily: 'Courier New'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(21);

            const menuBtn = this.add.text(W / 2, H / 2 + 65, '[ Main Menu ]', {
                fontSize: '14px', color: '#888888', fontFamily: 'Courier New'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(21);

            reloadBtn.on('pointerdown', () => {
                EventBus.emit('combat_end', 'defeat', []);
                this.scene.stop('Combat');
                this.scene.stop('Game');
                this.scene.start('MainMenu');
            });

            menuBtn.on('pointerdown', () => {
                EventBus.emit('combat_end', 'defeat', []);
                this.scene.stop('Combat');
                this.scene.stop('Game');
                this.scene.start('MainMenu');
            });
        }
    }

    addLog(msg, color = '#aabbcc') {
        this.combatLog.push({ msg, color });
        // Show last N entries
        const start = Math.max(0, this.combatLog.length - this.logTexts.length);
        for (let i = 0; i < this.logTexts.length; i++) {
            const entry = this.combatLog[start + i];
            if (entry) {
                this.logTexts[i].setText(entry.msg).setColor(entry.color);
            } else {
                this.logTexts[i].setText('');
            }
        }
    }

    updateUI() {
        const player = this.registry.get('player');
        const enemy  = this.combatState.enemy;

        // Enemy HP bar
        const ePct = Math.max(0, enemy.health / enemy.maxHealth);
        this.enemyHpFill.setSize(Math.max(0, 178 * ePct), 8);
        this.enemyHpText.setText(`${Math.max(0, Math.ceil(enemy.health))} / ${enemy.maxHealth}`);

        // Player bars
        if (player) {
            const hp = player.derived;
            this.playerHpBar.setSize(Math.max(0, 200 * (hp.health / hp.maxHealth)), 8);
            this.playerMpBar.setSize(Math.max(0, 200 * (hp.mana / hp.maxMana)), 8);
            this.playerStBar.setSize(Math.max(0, 200 * (hp.stamina / hp.maxStamina)), 8);
        }
    }

    setActionsEnabled(enabled) {
        for (const btn of this.actionButtons) {
            btn.setColor(enabled ? '#88cc88' : '#445544');
        }
    }
}
