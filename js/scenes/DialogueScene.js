import { start, selectChoice, getCurrentDisplay } from '../systems/DialogueSystem.js';
import EventBus from '../systems/EventBus.js';

const CHAR_DELAY = 30; // ms per character

export default class DialogueScene extends Phaser.Scene {
    constructor() { super({ key: 'Dialogue' }); }

    init(data) {
        this.npcId       = data.npcId       || 'unknown';
        this.dialogueTree = data.dialogueTree || null;
    }

    create() {
        const player = this.registry.get('player');
        if (!player) { this.closeDialogue(); return; }

        const W = this.scale.width;
        const H = this.scale.height;

        // ── Background overlay ─────────────────────────────────────────────────
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.5).setDepth(0);

        // ── Dialogue box (bottom portion of screen) ────────────────────────────
        const boxH  = 220;
        const boxY  = H - boxH / 2 - 10;
        const boxX  = W / 2;

        this.add.rectangle(boxX, boxY, W - 40, boxH, 0x05050f)
            .setStrokeStyle(1, 0x2a2a5a).setDepth(1);

        // ── Portrait area (left side of dialogue box) ──────────────────────────
        const portX = 90;
        const portY = boxY;

        this.add.rectangle(portX, portY, 120, 140, 0x0a0a20)
            .setStrokeStyle(1, 0x223355).setDepth(2);

        this.portraitImage = null;
        this.portraitFallback = this.add.graphics().setDepth(3);

        // ── Speaker name ───────────────────────────────────────────────────────
        this.speakerText = this.add.text(170, boxY - 90, '', {
            fontSize: '14px', color: '#00ccff', fontFamily: 'Courier New'
        }).setDepth(3);

        // ── Dialogue text (typewriter) ─────────────────────────────────────────
        this.dialogueText = this.add.text(170, boxY - 66, '', {
            fontSize: '12px', color: '#ccddee', fontFamily: 'Courier New',
            wordWrap: { width: W - 260 }, lineSpacing: 4
        }).setDepth(3);

        // ── Choice buttons ─────────────────────────────────────────────────────
        this.choiceButtons = [];
        this.choiceContainer = this.add.container(0, 0).setDepth(4);

        // ── Typewriter state ───────────────────────────────────────────────────
        this._fullText      = '';
        this._charIndex     = 0;
        this._typewriterDone = false;
        this._typewriterTimer = null;

        // Click anywhere to skip typewriter or advance
        this.input.on('pointerdown', () => this.handleClick());
        this.input.keyboard.on('keydown-SPACE', () => this.handleClick());
        this.input.keyboard.on('keydown-ESC', () => this.closeDialogue());

        // Start dialogue
        this.startDialogue(player);
    }

    async startDialogue(player) {
        if (!this.dialogueTree) {
            // No dialogue tree — show a generic greeting
            this.displayNode({
                speaker: this.npcId.replace(/_/g, ' '),
                text: `Hello, ${player.name}. Safe travels.`,
                portrait: null,
                choices: [{ text: 'Farewell.', nextNode: 'END' }]
            });
            return;
        }

        const display = await start(this.dialogueTree, player, this.npcId);
        if (display) {
            this.displayNode(display);
        } else {
            // Fallback: dialogue tree not found
            this.displayNode({
                speaker: this.npcId,
                text: '...',
                portrait: null,
                choices: []
            });
            this.time.delayedCall(1500, () => this.closeDialogue());
        }
    }

    displayNode(display) {
        const W = this.scale.width;
        const H = this.scale.height;

        // Update speaker name
        this.speakerText.setText(display.speaker || '');

        // Draw portrait
        this.portraitFallback.clear();
        if (display.portrait && this.textures.exists(display.portrait)) {
            if (this.portraitImage) {
                this.portraitImage.setTexture(display.portrait);
            } else {
                const boxY = H - 220 / 2 - 10;
                this.portraitImage = this.add.image(90, boxY, display.portrait)
                    .setDisplaySize(110, 130).setDepth(3);
            }
        } else {
            // Draw a coloured placeholder portrait
            const boxY = H - 220 / 2 - 10;
            this.portraitFallback.fillStyle(0x112233, 1);
            this.portraitFallback.fillRect(30, boxY - 70, 120, 140);
            this.portraitFallback.lineStyle(1, 0x334455, 1);
            this.portraitFallback.strokeRect(30, boxY - 70, 120, 140);
            // Simple face
            this.portraitFallback.fillStyle(0xd4a76a, 1);
            this.portraitFallback.fillCircle(90, boxY - 20, 28);
            this.portraitFallback.fillRect(68, boxY + 10, 44, 36);
        }

        // Begin typewriter for dialogue text
        this._fullText      = display.text || '';
        this._charIndex     = 0;
        this._typewriterDone = false;
        this.dialogueText.setText('');

        // Clear existing choices
        this.choiceContainer.removeAll(true);
        this.choiceButtons = [];

        // Store choices to show after typewriter finishes
        this._pendingChoices = display.choices || [];

        this.startTypewriter();
    }

    startTypewriter() {
        if (this._typewriterTimer) {
            this._typewriterTimer.remove();
        }

        this._typewriterTimer = this.time.addEvent({
            delay: CHAR_DELAY,
            callback: this.typeNextChar,
            callbackScope: this,
            repeat: this._fullText.length
        });
    }

    typeNextChar() {
        if (this._charIndex < this._fullText.length) {
            this._charIndex++;
            this.dialogueText.setText(this._fullText.substring(0, this._charIndex));
        } else {
            this._typewriterDone = true;
            if (this._typewriterTimer) {
                this._typewriterTimer.remove();
                this._typewriterTimer = null;
            }
            this.showChoices(this._pendingChoices);
        }
    }

    showChoices(choices) {
        this.choiceContainer.removeAll(true);
        this.choiceButtons = [];

        const W   = this.scale.width;
        const H   = this.scale.height;
        const baseY = H - 52;
        const player = this.registry.get('player');

        if (!choices || choices.length === 0) {
            // Auto-close after a moment if no choices
            const hint = this.add.text(W / 2, baseY, '[ Click or Space to continue ]', {
                fontSize: '10px', color: '#445566', fontFamily: 'Courier New'
            }).setOrigin(0.5).setDepth(5);
            this.choiceContainer.add(hint);
            return;
        }

        const colW  = Math.min(220, (W - 80) / Math.min(choices.length, 3));
        const startX = W / 2 - (Math.min(choices.length, 3) - 1) * colW / 2;

        choices.forEach((choice, i) => {
            const cx  = startX + (i % 3) * colW;
            const cy  = baseY - Math.floor(i / 3) * 28;
            const bg  = this.add.rectangle(cx, cy, colW - 10, 22, 0x0a1a0a)
                .setStrokeStyle(1, 0x224422).setInteractive({ useHandCursor: true }).setDepth(4);
            const txt = this.add.text(cx, cy, choice.text || `Option ${i + 1}`, {
                fontSize: '11px', color: '#88cc88', fontFamily: 'Courier New',
                wordWrap: { width: colW - 20 }
            }).setOrigin(0.5).setDepth(5);

            bg.on('pointerover', () => { bg.setFillStyle(0x152a15); txt.setColor('#ccffcc'); });
            bg.on('pointerout',  () => { bg.setFillStyle(0x0a1a0a); txt.setColor('#88cc88'); });
            bg.on('pointerdown', () => this.selectChoice(i));

            this.choiceContainer.add(bg);
            this.choiceContainer.add(txt);
            this.choiceButtons.push({ bg, txt, index: i });
        });
    }

    selectChoice(index) {
        const player = this.registry.get('player');
        if (!player) { this.closeDialogue(); return; }

        const result = selectChoice(index, player, this);

        if (result.done) {
            if (result.display) {
                // Final display node — show it then close
                this.displayNode(result.display);
                this.time.delayedCall(2000, () => this.closeDialogue());
            } else {
                this.closeDialogue();
            }
        } else if (result.display) {
            this.displayNode(result.display);
        }
    }

    handleClick() {
        if (!this._typewriterDone) {
            // Skip typewriter
            if (this._typewriterTimer) {
                this._typewriterTimer.remove();
                this._typewriterTimer = null;
            }
            this.dialogueText.setText(this._fullText);
            this._charIndex      = this._fullText.length;
            this._typewriterDone = true;
            this.showChoices(this._pendingChoices);
        } else if (this._pendingChoices && this._pendingChoices.length === 0) {
            // No choices — click advances/closes
            this.closeDialogue();
        }
    }

    closeDialogue() {
        EventBus.emit('npc_talked_to', this.npcId);
        EventBus.emit('dialogue_end', this.npcId);
        this.scene.stop('Dialogue');
        // Resume game if it was paused
        if (this.scene.isPaused('Game') && !this.scene.isActive('Story') && !this.scene.isActive('Ending')) {
            this.scene.resume('Game');
        }
    }
}
