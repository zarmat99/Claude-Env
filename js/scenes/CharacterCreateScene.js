import { RACES, createBaseAttributes } from '../data/races.js';
import { FACTIONS } from '../data/factions.js';
import { initializeRep } from '../systems/FactionSystem.js';
import { getItem } from '../data/items.js';
import EventBus from '../systems/EventBus.js';

export default class CharacterCreateScene extends Phaser.Scene {
    constructor() { super({ key: 'CharacterCreate' }); }

    create() {
        this.selectedRace = 'varesh';
        this.playerName = 'Traveler';
        this.statPoints = 5;
        this.customAttributes = { STR: 0, END: 0, AGI: 0, INT: 0, WIL: 0, PER: 0 };
        this.raceCardBgs = [];
        this.nameDisplay = null;

        const W = this.scale.width, H = this.scale.height;

        // Background
        this.add.rectangle(W / 2, H / 2, W, H, 0x050510);

        // Title
        this.add.text(W / 2, 24, 'Choose Your Origin', {
            fontSize: '22px', color: '#00ccff', fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.drawRaceCards();
        this.drawNameInput();
        this.drawStatAllocation();

        // Race description panel
        this.descPanel = this.add.text(W / 2, H * 0.75, '', {
            fontSize: '11px', color: '#8899aa', fontFamily: 'Courier New',
            wordWrap: { width: 520 }, align: 'center'
        }).setOrigin(0.5);
        this.updateDescription();

        this.createBeginButton();
    }

    drawRaceCards() {
        const races = Object.values(RACES);
        const W = this.scale.width;
        const totalWidth = (races.length - 1) * 100;
        const startX = W / 2 - totalWidth / 2;

        this.raceCardBgs = [];
        races.forEach((race, i) => {
            const x = startX + i * 100;
            const y = 160;

            const bg = this.add.rectangle(x, y, 88, 120, 0x0d0d2a).setStrokeStyle(1, 0x2a2a5a);
            const nameText = this.add.text(x, y + 42, race.name, {
                fontSize: '10px', color: '#aaaacc', fontFamily: 'Courier New'
            }).setOrigin(0.5);

            // Race portrait placeholder drawn with graphics
            const g = this.add.graphics();
            const pColor = Phaser.Display.Color.HexStringToColor(
                ['#d4a76a', '#9a8a7a', '#c8d4b8', '#5a6a7a', '#7a6a4a'][i]
            ).color;
            g.fillStyle(pColor, 1);
            g.fillCircle(x, y - 20, 16); // head
            g.fillRect(x - 10, y - 4, 20, 22); // body

            const raceId = race.id;
            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerover', () => {
                if (this.selectedRace !== raceId) bg.setStrokeStyle(2, 0x6688cc);
            });
            bg.on('pointerout', () => {
                bg.setStrokeStyle(this.selectedRace === raceId ? 2 : 1,
                    this.selectedRace === raceId ? 0x00ccff : 0x2a2a5a);
            });
            bg.on('pointerdown', () => {
                this.selectedRace = raceId;
                this.updateRaceSelection();
                this.updateDescription();
            });

            this.raceCardBgs.push({ bg, g, raceId });
        });
    }

    drawNameInput() {
        const W = this.scale.width;
        const y = 290;
        this.add.text(W / 2, y, 'Character Name:', {
            fontSize: '12px', color: '#6688aa', fontFamily: 'Courier New'
        }).setOrigin(0.5);

        const nameBox = this.add.rectangle(W / 2, y + 22, 220, 22, 0x0a0a20)
            .setStrokeStyle(1, 0x3a3a6a);
        this.nameDisplay = this.add.text(W / 2, y + 22, this.playerName + '|', {
            fontSize: '13px', color: '#ccccff', fontFamily: 'Courier New'
        }).setOrigin(0.5);

        // Touch devices have no physical keyboard — tap the field to type via
        // the native on-screen keyboard (window.prompt).
        const dev = this.sys.game.device.input;
        const isTouch = !!(dev && dev.touch) || ('ontouchstart' in window) ||
                        (navigator.maxTouchPoints > 0);
        if (isTouch) {
            this.add.text(W / 2, y + 40, '(tocca per scrivere)', {
                fontSize: '9px', color: '#556688', fontFamily: 'Courier New'
            }).setOrigin(0.5);
            nameBox.setInteractive({ useHandCursor: true });
            nameBox.on('pointerdown', () => {
                const entered = window.prompt('Nome personaggio:', this.playerName);
                if (entered !== null) {
                    this.playerName = entered.slice(0, 20);
                }
            });
        }

        // Blinking cursor
        this.time.addEvent({
            delay: 500,
            callback: () => {
                if (this.nameDisplay && this.nameDisplay.active) {
                    const showCursor = !this.nameDisplay.text.endsWith('|');
                    this.nameDisplay.setText(this.playerName + (showCursor ? '|' : ' '));
                }
            },
            loop: true
        });

        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Backspace') {
                if (this.playerName.length > 0) {
                    this.playerName = this.playerName.slice(0, -1);
                }
            } else if (event.key.length === 1 && this.playerName.length < 20) {
                this.playerName += event.key;
            }
        });
    }

    drawStatAllocation() {
        const W = this.scale.width;
        const headerY = 336;

        const pointsLabel = this.add.text(W / 2, headerY, 'Bonus Attribute Points: 5', {
            fontSize: '11px', color: '#aaaacc', fontFamily: 'Courier New'
        }).setOrigin(0.5).setName('pointsText');

        const attrs  = ['STR', 'END', 'AGI', 'INT', 'WIL', 'PER'];
        const labels = ['Strength', 'Endurance', 'Agility', 'Intelligence', 'Willpower', 'Perception'];
        const colW   = 160;
        const startX = W / 2 - colW * 1.5 + 20;
        const baseY  = headerY + 24;

        attrs.forEach((attr, i) => {
            const col  = i % 3;
            const row  = Math.floor(i / 3);
            const x    = startX + col * colW;
            const ay   = baseY + row * 28;

            this.add.text(x, ay, labels[i], {
                fontSize: '10px', color: '#7788aa', fontFamily: 'Courier New'
            });

            const minusBtn = this.add.text(x + 106, ay, '[-]', {
                fontSize: '10px', color: '#aa4444', fontFamily: 'Courier New'
            });
            const valueText = this.add.text(x + 126, ay, '0', {
                fontSize: '10px', color: '#ccccff', fontFamily: 'Courier New'
            }).setName(`stat_${attr}`);
            const plusBtn = this.add.text(x + 140, ay, '[+]', {
                fontSize: '10px', color: '#44aa44', fontFamily: 'Courier New'
            });

            plusBtn.setInteractive({ useHandCursor: true });
            plusBtn.on('pointerdown', () => {
                if (this.statPoints > 0) {
                    this.statPoints--;
                    this.customAttributes[attr]++;
                    this.updateStatDisplay();
                }
            });

            minusBtn.setInteractive({ useHandCursor: true });
            minusBtn.on('pointerdown', () => {
                if (this.customAttributes[attr] > 0) {
                    this.statPoints++;
                    this.customAttributes[attr]--;
                    this.updateStatDisplay();
                }
            });
        });
    }

    updateStatDisplay() {
        ['STR', 'END', 'AGI', 'INT', 'WIL', 'PER'].forEach(attr => {
            const txt = this.children.getByName(`stat_${attr}`);
            if (txt) txt.setText(String(this.customAttributes[attr]));
        });
        const ptsTxt = this.children.getByName('pointsText');
        if (ptsTxt) ptsTxt.setText('Bonus Attribute Points: ' + this.statPoints);
    }

    updateRaceSelection() {
        this.raceCardBgs.forEach(({ bg, raceId }) => {
            const selected = raceId === this.selectedRace;
            bg.setStrokeStyle(selected ? 2 : 1, selected ? 0x00ccff : 0x2a2a5a);
            bg.setFillStyle(selected ? 0x152540 : 0x0d0d2a);
        });
    }

    updateDescription() {
        const race = RACES[this.selectedRace];
        if (race && this.descPanel) {
            this.descPanel.setText(race.description + '\n\n' + race.traits.join('  |  '));
        }
    }

    createBeginButton() {
        const W = this.scale.width, H = this.scale.height;
        const btn = this.add.rectangle(W / 2, H - 36, 200, 34, 0x004488)
            .setStrokeStyle(1, 0x0088cc)
            .setInteractive({ useHandCursor: true });
        const text = this.add.text(W / 2, H - 36, 'Begin Journey', {
            fontSize: '16px', color: '#88ccff', fontFamily: 'Courier New'
        }).setOrigin(0.5);

        btn.on('pointerover', () => { btn.setFillStyle(0x0066bb); text.setColor('#cceeff'); });
        btn.on('pointerout',  () => { btn.setFillStyle(0x004488); text.setColor('#88ccff'); });
        btn.on('pointerdown', () => this.startGame());
    }

    startGame() {
        const name = this.playerName.trim() || 'Traveler';
        const race = RACES[this.selectedRace];
        const raceAttrs = createBaseAttributes(this.selectedRace);

        const finalAttrs = {};
        for (const [k, v] of Object.entries(raceAttrs)) {
            finalAttrs[k] = v + (this.customAttributes[k] || 0);
        }

        const player = {
            name,
            race: this.selectedRace,
            level: 1, xp: 0,
            attributes: finalAttrs,
            derived: {
                health:         race.health,
                maxHealth:      race.health,
                mana:           race.mana,
                maxMana:        race.mana,
                stamina:        race.stamina,
                maxStamina:     race.stamina,
                carryWeight:    0,
                maxCarryWeight: 100 + finalAttrs.STR * 10,
                moveSpeed:      120 + finalAttrs.AGI * 4,
                baseArmor:      0
            },
            skills: {
                blades:      { xp: 0, level: 1, perksUnlocked: [] },
                blunt:       { xp: 0, level: 1, perksUnlocked: [] },
                archery:     { xp: 0, level: 1, perksUnlocked: [] },
                block:       { xp: 0, level: 1, perksUnlocked: [] },
                destruction: { xp: 0, level: 1, perksUnlocked: [] },
                restoration: { xp: 0, level: 1, perksUnlocked: [] },
                illusion:    { xp: 0, level: 1, perksUnlocked: [] },
                conjuration: { xp: 0, level: 1, perksUnlocked: [] },
                sneak:       { xp: 0, level: 1, perksUnlocked: [] },
                lockpicking: { xp: 0, level: 1, perksUnlocked: [] },
                pickpocket:  { xp: 0, level: 1, perksUnlocked: [] },
                smithing:    { xp: 0, level: 1, perksUnlocked: [] },
                alchemy:     { xp: 0, level: 1, perksUnlocked: [] },
                enchanting:  { xp: 0, level: 1, perksUnlocked: [] },
                speech:      { xp: 0, level: 1, perksUnlocked: [] },
                negotiation: { xp: 0, level: 1, perksUnlocked: [] },
                herbalism:   { xp: 0, level: 1, perksUnlocked: [] },
                survival:    { xp: 0, level: 1, perksUnlocked: [] }
            },
            equipment: { head: null, chest: null, legs: null, hands: null, feet: null, weapon: getItem('iron_sword'), offhand: null, ring: null },
            worldX: 82, worldY: 98,
            flags: new Set(),
            quests: { active: new Map(), completed: new Set(), failed: new Set() },
            inventory: [
                { itemId: 'health_potion_minor', quantity: 3 },
                { itemId: 'bread',               quantity: 2 }
            ],
            gold: 50,
            factionRep: {
                auric_concordat:   0,
                rootwarden_circle: 0,
                iron_compact:      0,
                underlurk_cult:   -30,
                grey_penitents:    10
            },
            exploredTiles: new Uint8Array(40000),
            worldTime: 7 * 60,
            kills: {}, crafted: {}
        };

        // Apply race starting skills
        if (race.startingSkills) {
            for (const [skillId, level] of Object.entries(race.startingSkills)) {
                if (player.skills[skillId]) player.skills[skillId].level = level;
            }
        }

        this.registry.set('player', player);
        this.scene.start('Game');
    }
}
