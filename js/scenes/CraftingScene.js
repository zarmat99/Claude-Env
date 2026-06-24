import { getKnownRecipes, canCraft, craft } from '../systems/CraftingSystem.js';
import { getSkillLevel } from '../systems/SkillSystem.js';
import { getItemCount } from '../systems/InventorySystem.js';
import { getItem } from '../data/items.js';
import EventBus from '../systems/EventBus.js';

const TABS = ['smithing', 'alchemy', 'smelting'];

export default class CraftingScene extends Phaser.Scene {
    constructor() { super({ key: 'Crafting' }); }

    init(data) {
        this.craftType = data.craftType || 'smithing';
        this.stationName = data.stationName || 'Forge';
    }

    create() {
        const player = this.registry.get('player');
        if (!player) { this.scene.stop('Crafting'); return; }

        const W = this.scale.width;
        const H = this.scale.height;

        this._selectedIdx = 0;
        this._activeTab   = this.craftType;

        // ── Dim overlay ───────────────────────────────────────────────────────
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75).setDepth(0);

        // ── Main panel ────────────────────────────────────────────────────────
        const panelW = 760;
        const panelH = 480;
        const panelX = W / 2;
        const panelY = H / 2;

        this.add.rectangle(panelX, panelY, panelW, panelH, 0x05050f)
            .setStrokeStyle(1, 0x2a2a5a).setDepth(1);

        // ── Title ─────────────────────────────────────────────────────────────
        this.add.text(panelX, panelY - panelH / 2 + 18, this.stationName.toUpperCase(), {
            fontSize: '14px', color: '#ffd700', fontFamily: 'Courier New'
        }).setOrigin(0.5, 0.5).setDepth(2);

        // ── Tabs ──────────────────────────────────────────────────────────────
        this._tabBtns = [];
        const tabY = panelY - panelH / 2 + 44;
        TABS.forEach((tab, i) => {
            const tx = panelX - 120 + i * 120;
            const active = tab === this._activeTab;
            const bg = this.add.rectangle(tx, tabY, 110, 22,
                active ? 0x1a3a1a : 0x0a0a1a)
                .setStrokeStyle(1, active ? 0x44aa44 : 0x2a2a5a)
                .setInteractive({ useHandCursor: true }).setDepth(2);
            const label = this.add.text(tx, tabY,
                tab.charAt(0).toUpperCase() + tab.slice(1), {
                    fontSize: '11px',
                    color: active ? '#88ff88' : '#556677',
                    fontFamily: 'Courier New'
                }).setOrigin(0.5).setDepth(3);
            bg.on('pointerdown', () => this.switchTab(tab));
            bg.on('pointerover', () => { if (tab !== this._activeTab) bg.setFillStyle(0x0f1f0f); });
            bg.on('pointerout',  () => { if (tab !== this._activeTab) bg.setFillStyle(0x0a0a1a); });
            this._tabBtns.push({ tab, bg, label });
        });

        // ── Left panel: recipe list ────────────────────────────────────────
        const listX    = panelX - panelW / 2 + 10;
        const listW    = 260;
        const listTopY = panelY - panelH / 2 + 70;
        const listBotY = panelY + panelH / 2 - 50;

        this.add.rectangle(listX + listW / 2, (listTopY + listBotY) / 2,
            listW, listBotY - listTopY, 0x080818)
            .setStrokeStyle(1, 0x1a1a3a).setDepth(2);

        this._recipeListContainer = this.add.container(0, 0).setDepth(3);

        // ── Right panel: recipe detail ────────────────────────────────────
        const detailX  = listX + listW + 20;
        const detailW  = panelW - listW - 40;

        this.add.rectangle(detailX + detailW / 2, (listTopY + listBotY) / 2,
            detailW, listBotY - listTopY, 0x080818)
            .setStrokeStyle(1, 0x1a1a3a).setDepth(2);

        this._detailContainer = this.add.container(0, 0).setDepth(3);

        // ── Craft button ──────────────────────────────────────────────────
        const craftBtnY = panelY + panelH / 2 - 24;
        this._craftBtnBg = this.add.rectangle(panelX + 100, craftBtnY, 160, 30, 0x0a2a0a)
            .setStrokeStyle(1, 0x22aa22)
            .setInteractive({ useHandCursor: true }).setDepth(4);
        this._craftBtnText = this.add.text(panelX + 100, craftBtnY, 'CRAFT  [C]', {
            fontSize: '12px', color: '#44cc44', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(5);
        this._craftBtnBg.on('pointerdown', () => this.doCraft());
        this._craftBtnBg.on('pointerover', () => this._craftBtnBg.setFillStyle(0x153a15));
        this._craftBtnBg.on('pointerout',  () => this._craftBtnBg.setFillStyle(0x0a2a0a));

        // ── Close button ──────────────────────────────────────────────────
        const closeBtnX = panelX + panelW / 2 - 50;
        const closeBg = this.add.rectangle(closeBtnX, craftBtnY, 80, 30, 0x1a0a0a)
            .setStrokeStyle(1, 0x552222)
            .setInteractive({ useHandCursor: true }).setDepth(4);
        this.add.text(closeBtnX, craftBtnY, 'CLOSE', {
            fontSize: '12px', color: '#cc4444', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(5);
        closeBg.on('pointerdown', () => this.closeCrafting());
        closeBg.on('pointerover', () => closeBg.setFillStyle(0x2a1010));
        closeBg.on('pointerout',  () => closeBg.setFillStyle(0x1a0a0a));

        // ── Feedback text ─────────────────────────────────────────────────
        this._feedbackText = this.add.text(panelX - 60, craftBtnY,  '', {
            fontSize: '11px', color: '#ffffff', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(5);

        // ── Skill levels (bottom-left) ────────────────────────────────────
        this._skillText = this.add.text(listX + 4, craftBtnY - 8, '', {
            fontSize: '10px', color: '#7788aa', fontFamily: 'Courier New'
        }).setDepth(3);

        // ── Keyboard shortcuts ────────────────────────────────────────────
        this.input.keyboard.on('keydown-ESC',   () => this.closeCrafting());
        this.input.keyboard.on('keydown-C',     () => this.doCraft());
        this.input.keyboard.on('keydown-UP',    () => this.moveSelection(-1));
        this.input.keyboard.on('keydown-DOWN',  () => this.moveSelection(1));
        this.input.keyboard.on('keydown-LEFT',  () => this.cycleTabs(-1));
        this.input.keyboard.on('keydown-RIGHT', () => this.cycleTabs(1));

        // Store layout refs
        this._layout = { listX, listW, listTopY, listBotY, detailX, detailW };

        this.refreshAll();
    }

    // ── Tab management ─────────────────────────────────────────────────────────

    switchTab(tab) {
        this._activeTab   = tab;
        this._selectedIdx = 0;
        this._tabBtns.forEach(({ tab: t, bg, label }) => {
            const active = t === tab;
            bg.setFillStyle(active ? 0x1a3a1a : 0x0a0a1a);
            bg.setStrokeStyle(1, active ? 0x44aa44 : 0x2a2a5a);
            label.setColor(active ? '#88ff88' : '#556677');
        });
        this.refreshAll();
    }

    cycleTabs(dir) {
        const idx = TABS.indexOf(this._activeTab);
        const next = (idx + dir + TABS.length) % TABS.length;
        this.switchTab(TABS[next]);
    }

    moveSelection(dir) {
        const player  = this.registry.get('player');
        const recipes = getKnownRecipes(player, this._activeTab);
        if (recipes.length === 0) return;
        this._selectedIdx = Math.max(0, Math.min(recipes.length - 1, this._selectedIdx + dir));
        this.refreshAll();
    }

    // ── Refresh UI ─────────────────────────────────────────────────────────────

    refreshAll() {
        const player  = this.registry.get('player');
        const recipes = getKnownRecipes(player, this._activeTab);

        this._selectedIdx = Math.min(this._selectedIdx, Math.max(0, recipes.length - 1));

        this.refreshRecipeList(player, recipes);
        this.refreshDetail(player, recipes);
        this.refreshSkillText(player);
    }

    refreshRecipeList(player, recipes) {
        const { listX, listW, listTopY, listBotY } = this._layout;
        this._recipeListContainer.removeAll(true);

        if (recipes.length === 0) {
            const msg = this.add.text(listX + listW / 2, (listTopY + listBotY) / 2,
                'No recipes available', {
                    fontSize: '10px', color: '#445566', fontFamily: 'Courier New'
                }).setOrigin(0.5);
            this._recipeListContainer.add(msg);
            return;
        }

        const rowH      = 28;
        const visibleN  = Math.floor((listBotY - listTopY) / rowH);
        const scrollOff = Math.max(0, this._selectedIdx - visibleN + 1);

        recipes.forEach((recipe, i) => {
            const visIdx = i - scrollOff;
            if (visIdx < 0 || visIdx >= visibleN) return;

            const ry      = listTopY + visIdx * rowH + 14;
            const selected = i === this._selectedIdx;
            const color   = recipe.locked ? '#334444'
                : recipe.craftable ? '#88cc88' : '#cc8844';

            const rowBg = this.add.rectangle(
                listX + listW / 2, ry, listW - 4, rowH - 2,
                selected ? 0x0f2f0f : 0x080818
            ).setStrokeStyle(selected ? 1 : 0, 0x33aa33)
             .setInteractive({ useHandCursor: true });

            rowBg.on('pointerdown', () => {
                this._selectedIdx = i;
                this.refreshAll();
            });

            const rowText = this.add.text(listX + 8, ry, recipe.name, {
                fontSize: '11px', color, fontFamily: 'Courier New'
            }).setOrigin(0, 0.5);

            const statusIcon = recipe.locked ? '🔒' : recipe.craftable ? '✓' : '○';
            const iconText = this.add.text(listX + listW - 12, ry, statusIcon, {
                fontSize: '10px', color, fontFamily: 'Courier New'
            }).setOrigin(1, 0.5);

            this._recipeListContainer.add([rowBg, rowText, iconText]);
        });
    }

    refreshDetail(player, recipes) {
        const { detailX, detailW, listTopY, listBotY } = this._layout;
        this._detailContainer.removeAll(true);

        if (recipes.length === 0) return;

        const recipe = recipes[this._selectedIdx];
        if (!recipe) return;

        let y = listTopY + 12;
        const lx = detailX + 8;
        const lineH = 18;

        // Name
        this._detailContainer.add(
            this.add.text(lx, y, recipe.name, {
                fontSize: '14px', color: '#ffd700', fontFamily: 'Courier New'
            })
        );
        y += 22;

        // Description
        if (recipe.description) {
            this._detailContainer.add(
                this.add.text(lx, y, recipe.description, {
                    fontSize: '10px', color: '#8899aa', fontFamily: 'Courier New',
                    wordWrap: { width: detailW - 16 }
                })
            );
            y += 36;
        }

        // Skill requirements
        if (recipe.requiresSkill) {
            this._detailContainer.add(
                this.add.text(lx, y, 'SKILL REQUIRED:', {
                    fontSize: '10px', color: '#aabbcc', fontFamily: 'Courier New'
                })
            );
            y += lineH;
            for (const [skillId, needed] of Object.entries(recipe.requiresSkill)) {
                const have = getSkillLevel(player, skillId);
                const met  = have >= needed;
                this._detailContainer.add(
                    this.add.text(lx + 8, y,
                        `${skillId}: ${have}/${needed} ${met ? '✓' : '✗'}`, {
                        fontSize: '10px',
                        color: met ? '#88cc88' : '#cc4444',
                        fontFamily: 'Courier New'
                    })
                );
                y += lineH;
            }
            y += 4;
        }

        // Ingredients
        this._detailContainer.add(
            this.add.text(lx, y, 'INGREDIENTS:', {
                fontSize: '10px', color: '#aabbcc', fontFamily: 'Courier New'
            })
        );
        y += lineH;

        for (const ing of recipe.ingredients) {
            const have = getItemCount(player, ing.itemId);
            const has  = have >= ing.quantity;
            const itemName = this._getItemName(ing.itemId);
            this._detailContainer.add(
                this.add.text(lx + 8, y,
                    `${itemName}: ${have}/${ing.quantity} ${has ? '✓' : '✗'}`, {
                    fontSize: '10px',
                    color: has ? '#88cc88' : '#cc4444',
                    fontFamily: 'Courier New'
                })
            );
            y += lineH;
        }

        y += 8;

        // Output
        const outName = this._getItemName(recipe.output.itemId);
        this._detailContainer.add(
            this.add.text(lx, y, `OUTPUT: ${outName} ×${recipe.output.quantity}`, {
                fontSize: '10px', color: '#ccdd88', fontFamily: 'Courier New'
            })
        );
        y += lineH;

        // XP gain
        if (recipe.xpGain) {
            const xpStr = Object.entries(recipe.xpGain)
                .map(([s, v]) => `+${v} ${s} XP`).join(', ');
            this._detailContainer.add(
                this.add.text(lx, y, xpStr, {
                    fontSize: '10px', color: '#8888ff', fontFamily: 'Courier New'
                })
            );
        }

        // Craftable status
        const canMake = recipe.craftable;
        const statusColor = canMake ? '#44ff44' : '#ff4444';
        const statusMsg   = canMake ? 'READY TO CRAFT' : recipe.locked ? 'LOCKED' : 'MISSING INGREDIENTS';
        this._detailContainer.add(
            this.add.text(detailX + detailW / 2, listBotY - 16, statusMsg, {
                fontSize: '12px', color: statusColor, fontFamily: 'Courier New'
            }).setOrigin(0.5, 1)
        );
    }

    refreshSkillText(player) {
        const smithLvl = getSkillLevel(player, 'smithing');
        const alchLvl  = getSkillLevel(player, 'alchemy');
        this._skillText.setText(
            `Smith: ${smithLvl}  Alchemy: ${alchLvl}`
        );
    }

    // ── Crafting ───────────────────────────────────────────────────────────────

    doCraft() {
        const player  = this.registry.get('player');
        const recipes = getKnownRecipes(player, this._activeTab);
        const recipe  = recipes[this._selectedIdx];
        if (!recipe) return;

        const result = craft(recipe.id, player, this, this._activeTab);
        this.showFeedback(result.message, result.success ? '#88ff88' : '#ff6644');

        if (result.success) {
            this.refreshAll();
        }
    }

    showFeedback(msg, color = '#ffffff') {
        this._feedbackText.setText(msg).setColor(color).setAlpha(1);
        this.tweens.killTweensOf(this._feedbackText);
        this.tweens.add({
            targets:  this._feedbackText,
            alpha:    0,
            delay:    1800,
            duration: 800,
            ease:     'Linear'
        });
    }

    // ── Close ──────────────────────────────────────────────────────────────────

    closeCrafting() {
        this.scene.stop('Crafting');
        if (this.scene.isPaused('Game')) this.scene.resume('Game');
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    _getItemName(itemId) {
        const def = getItem(itemId);
        if (def && def.name) return def.name;
        return itemId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
}
