import EventBus from '../systems/EventBus.js';
import { hasSave, load } from '../systems/SaveSystem.js';

export default class MainMenuScene extends Phaser.Scene {
    constructor() { super({ key: 'MainMenu' }); }

    create() {
        const W = this.scale.width, H = this.scale.height;

        // Dark background
        this.add.rectangle(W / 2, H / 2, W, H, 0x050510);

        // Decorative Rootstone glow effect (concentric semi-transparent circles)
        const glow = this.add.graphics();
        for (let r = 120; r > 0; r -= 20) {
            glow.fillStyle(0x00ccff, 0.03 * (120 - r) / 120);
            glow.fillCircle(W / 2, H * 0.35, r);
        }

        // Title
        this.add.text(W / 2, H * 0.18, 'AETHERMOOR', {
            fontSize: '48px', color: '#00ccff', fontFamily: 'Courier New',
            stroke: '#003366', strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.29, 'Chronicles of the Dying Rootstones', {
            fontSize: '14px', color: '#6688aa', fontFamily: 'Courier New'
        }).setOrigin(0.5);

        // Animated divider line
        const divider = this.add.graphics();
        divider.lineStyle(1, 0x003366, 0.8);
        divider.lineBetween(W / 2 - 200, H * 0.38, W / 2 + 200, H * 0.38);

        // Menu buttons
        const saveExists = hasSave();
        const buttons = [
            { label: 'New Game', y: H * 0.50, action: () => this.scene.start('CharacterCreate') },
            { label: 'Continue', y: H * 0.59, action: () => this.loadGame(), disabled: !saveExists },
            { label: 'Lore',     y: H * 0.68, action: () => this.showLore() }
        ];

        for (const btn of buttons) {
            this.createMenuButton(btn.label, W / 2, btn.y, btn.action, btn.disabled || false);
        }

        // Version info
        this.add.text(W - 10, H - 10, 'v0.1 — A Web RPG', {
            fontSize: '10px', color: '#333366', fontFamily: 'Courier New'
        }).setOrigin(1, 1);

        // Ambient pulsing glow
        this.tweens.add({
            targets: glow,
            alpha: { from: 0.5, to: 1.0 },
            duration: 3000, ease: 'Sine.easeInOut', yoyo: true, repeat: -1
        });
    }

    createMenuButton(label, x, y, action, disabled = false) {
        const fillColor  = disabled ? 0x0d0d22 : 0x1a1a4a;
        const strokeColor = disabled ? 0x222244 : 0x3a3a6a;
        const textColor  = disabled ? '#444466' : '#8888cc';

        const bg = this.add.rectangle(x, y, 200, 28, fillColor);
        bg.setStrokeStyle(1, strokeColor);

        const text = this.add.text(x, y, label, {
            fontSize: '16px', color: textColor, fontFamily: 'Courier New'
        }).setOrigin(0.5);

        if (!disabled) {
            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerover', () => { bg.setFillStyle(0x2a2a6a); text.setColor('#ccccff'); });
            bg.on('pointerout', () => { bg.setFillStyle(0x1a1a4a); text.setColor('#8888cc'); });
            bg.on('pointerdown', action);
        }
    }

    loadGame() {
        const save = load();
        if (save && save.player) {
            this.registry.set('player', save.player);
            if (save.world) {
                this.registry.set('worldData', save.world);
            }
            this.scene.start('Game');
        } else {
            // Show error notification — no save found
            const W = this.scale.width, H = this.scale.height;
            const msg = this.add.text(W / 2, H * 0.82, 'No save file found.', {
                fontSize: '12px', color: '#ff6666', fontFamily: 'Courier New'
            }).setOrigin(0.5);
            this.time.delayedCall(2000, () => msg.destroy());
        }
    }

    showLore() {
        const W = this.scale.width, H = this.scale.height;

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88);
        overlay.setDepth(100);

        const loreText =
            'In the year 1200 of the Arcanate, Grand Artificer Vorath-Kel\n' +
            'activated forty-seven Resonance Engines simultaneously.\n\n' +
            'He sought to end winter. He shattered the world.\n\n' +
            'Seven fragments of the continent of Ur-Varethos\n' +
            'remain suspended above the void called the Underlurk,\n' +
            'held aloft by ancient crystalline Rootstones.\n\n' +
            'The Rootstones are dying.\n\n' +
            'You are all that stands between Varethos\n' +
            'and the long fall into darkness.';

        const text = this.add.text(W / 2, H / 2 - 20, loreText, {
            fontSize: '13px', color: '#aaccdd', fontFamily: 'Courier New',
            align: 'center', lineSpacing: 6
        }).setOrigin(0.5).setDepth(101);

        const closeBtn = this.add.text(W / 2, H * 0.84, '[ Press any key or click to return ]', {
            fontSize: '12px', color: '#5566aa', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(101);

        // Blink the close hint
        this.tweens.add({
            targets: closeBtn,
            alpha: { from: 1, to: 0.3 },
            duration: 800, yoyo: true, repeat: -1
        });

        const close = () => {
            overlay.destroy();
            text.destroy();
            closeBtn.destroy();
            this.input.keyboard.off('keydown', close);
        };
        this.input.keyboard.once('keydown', close);
        overlay.setInteractive();
        overlay.on('pointerdown', close);
    }
}
