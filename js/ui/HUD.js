import EventBus from '../systems/EventBus.js';

export class HUD {
    constructor(scene, player) {
        this.scene      = scene;
        this.notifGroup = [];

        const W = scene.scale.width;
        const H = scene.scale.height;

        // ── Health bar (bottom-left) ─────────────────────────────────────────
        this.healthBg = scene.add.rectangle(10, H - 20, 120, 14, 0x220000)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(200);
        this.healthBg.setStrokeStyle(1, 0x440000);
        this.healthFill = scene.add.rectangle(11, H - 20, 118, 12, 0xcc2222)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(201);
        this.healthText = scene.add.text(70, H - 20,
            `${player.derived.health}/${player.derived.maxHealth} HP`, {
                fontSize: '9px', color: '#ffaaaa', fontFamily: 'Courier New'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(202);

        // ── Mana bar ─────────────────────────────────────────────────────────
        this.manaBg = scene.add.rectangle(10, H - 36, 120, 14, 0x000022)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(200);
        this.manaBg.setStrokeStyle(1, 0x000044);
        this.manaFill = scene.add.rectangle(11, H - 36, 118, 12, 0x2244cc)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(201);
        this.manaText = scene.add.text(70, H - 36,
            `${player.derived.mana}/${player.derived.maxMana} MP`, {
                fontSize: '9px', color: '#aaaaff', fontFamily: 'Courier New'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(202);

        // ── Stamina bar ───────────────────────────────────────────────────────
        this.staminaBg = scene.add.rectangle(10, H - 52, 120, 14, 0x002200)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(200);
        this.staminaBg.setStrokeStyle(1, 0x004400);
        this.staminaFill = scene.add.rectangle(11, H - 52, 118, 12, 0x22aa44)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(201);
        this.staminaText = scene.add.text(70, H - 52, 'ST', {
            fontSize: '9px', color: '#aaffaa', fontFamily: 'Courier New'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(202);

        // ── Gold counter ──────────────────────────────────────────────────────
        this.goldText = scene.add.text(140, H - 20, `◈ ${player.gold}g`, {
            fontSize: '11px', color: '#ddaa44', fontFamily: 'Courier New'
        }).setScrollFactor(0).setDepth(200);

        // ── Clock (top-right) ─────────────────────────────────────────────────
        this.clockText = scene.add.text(W - 10, 10, '07:00', {
            fontSize: '12px', color: '#7788aa', fontFamily: 'Courier New'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(200);

        // ── Active quest tracker (top-left) ───────────────────────────────────
        this.questTracker = scene.add.text(10, 10, '', {
            fontSize: '10px', color: '#aabb88', fontFamily: 'Courier New',
            wordWrap: { width: 220 }
        }).setScrollFactor(0).setDepth(200);

        // ── Interact hint (bottom-centre) ─────────────────────────────────────
        this.interactHint = scene.add.text(W / 2, H - 80, '', {
            fontSize: '11px', color: '#88aacc', fontFamily: 'Courier New',
            backgroundColor: '#00000088', padding: { x: 6, y: 3 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);

        // ── Controls reminder (bottom-right) ──────────────────────────────────
        scene.add.text(W - 10, H - 10, '[I]Inv  [M]Map  [J]Journal  [E]Talk', {
            fontSize: '9px', color: '#333355', fontFamily: 'Courier New'
        }).setOrigin(1, 1).setScrollFactor(0).setDepth(200);

        // ── Player name (top, tiny) ───────────────────────────────────────────
        scene.add.text(W / 2, 10, player.name || 'Traveler', {
            fontSize: '10px', color: '#556677', fontFamily: 'Courier New'
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(200);
    }

    update(player) {
        const hp = player.derived;

        // Health
        const hPct = Math.max(0, hp.health / hp.maxHealth);
        this.healthFill.setSize(Math.max(0, 118 * hPct), 12);
        this.healthText.setText(`${Math.ceil(hp.health)}/${hp.maxHealth} HP`);
        const hColor = hPct < 0.3 ? 0xdd1111 : hPct < 0.6 ? 0xcc6622 : 0xcc2222;
        this.healthFill.setFillStyle(hColor);

        // Mana
        const mPct = Math.max(0, hp.mana / hp.maxMana);
        this.manaFill.setSize(Math.max(0, 118 * mPct), 12);
        this.manaText.setText(`${Math.ceil(hp.mana)}/${hp.maxMana} MP`);

        // Stamina
        const sPct = Math.max(0, hp.stamina / hp.maxStamina);
        this.staminaFill.setSize(Math.max(0, 118 * sPct), 12);
        this.staminaText.setText(`${Math.ceil(hp.stamina)} ST`);

        // Gold
        this.goldText.setText(`◈ ${player.gold}g`);

        // Clock
        const hours = Math.floor((player.worldTime / 60) % 24);
        const mins  = Math.floor(player.worldTime % 60);
        this.clockText.setText(
            `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
        );

        // Active quest tracker
        const active = player.quests ? Array.from(player.quests.active.entries()) : [];
        if (active.length > 0) {
            const [qid] = active[0];
            this.questTracker.setText(`► ${qid.replace(/_/g, ' ')}`);
        } else {
            this.questTracker.setText('');
        }
    }

    showInteractHint(text) {
        this.interactHint.setText(text).setVisible(true);
    }

    hideInteractHint() {
        this.interactHint.setVisible(false);
    }

    showNotification(text, color = '#ffffff') {
        const W   = this.scene.scale.width;
        const idx = this.notifGroup.length;
        const y   = 56 + idx * 22;

        const notif = this.scene.add.text(W / 2, y, text, {
            fontSize: '12px', color, fontFamily: 'Courier New',
            backgroundColor: '#00000099', padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(250);

        this.notifGroup.push(notif);

        this.scene.tweens.add({
            targets:  notif,
            alpha:    0,
            y:        y - 20,
            duration: 3000,
            ease:     'Cubic.easeIn',
            onComplete: () => {
                notif.destroy();
                this.notifGroup = this.notifGroup.filter(n => n !== notif);
            }
        });
    }
}
