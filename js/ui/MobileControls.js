// MobileControls.js — On-screen touch controls for GameScene.
// Renders a virtual joystick (left thumb) + action buttons (right thumb),
// fixed to the camera. Only active on touch-capable devices so desktop
// keyboard play is unaffected.

const DEPTH       = 300;   // above HUD (200–250)
const DEAD_ZONE   = 0.25;  // ignore tiny joystick nudges
const RUN_ZONE    = 0.9;   // push past this magnitude to run

export class MobileControls {
    constructor(scene, player) {
        this.scene  = scene;
        this.player = player;

        // Detect touch capability; bail out (no UI) on desktop.
        const dev = scene.sys.game.device.input;
        this.enabled = !!(dev && dev.touch) || ('ontouchstart' in window) ||
                       (navigator.maxTouchPoints > 0);

        // Movement state consumed by Player.update via getMoveState()
        this.move = { up: false, down: false, left: false, right: false, run: false };

        if (!this.enabled) return;

        // Allow simultaneous touches (joystick + an action button)
        scene.input.addPointer(2);

        this._buildJoystick();
        this._buildActionButtons();
        this._wireJoystickInput();
    }

    // ── Virtual joystick (bottom-left) ──────────────────────────────────────
    _buildJoystick() {
        const H = this.scene.scale.height;

        this.joyRadius = 52;
        this.joyBaseX  = 80;
        this.joyBaseY  = H - 80;

        this.joyBase = this.scene.add.circle(
            this.joyBaseX, this.joyBaseY, this.joyRadius, 0x1a2a3a, 0.35
        ).setScrollFactor(0).setDepth(DEPTH).setStrokeStyle(2, 0x4488aa, 0.6);

        this.joyThumb = this.scene.add.circle(
            this.joyBaseX, this.joyBaseY, 24, 0x66aacc, 0.55
        ).setScrollFactor(0).setDepth(DEPTH + 1).setStrokeStyle(2, 0x88ccee, 0.8);

        this._joyPointerId = null;
    }

    // ── Action buttons (bottom-right) ───────────────────────────────────────
    _buildActionButtons() {
        const W = this.scene.scale.width;
        const H = this.scene.scale.height;

        // Big interact button (E)
        this._makeButton(W - 70, H - 80, 34, 'E', 0x2a3a1a, 0x88cc66,
            () => this.scene.interact && this.scene.interact());

        // Small menu buttons stacked above-left of the interact button
        this._makeButton(W - 150, H - 90, 20, 'I', 0x2a2a3a, 0xaaaacc,
            () => this.scene.openInventory && this.scene.openInventory());
        this._makeButton(W - 150, H - 44, 20, 'M', 0x2a2a3a, 0xaaaacc,
            () => this.scene.openMap && this.scene.openMap());
        this._makeButton(W - 104, H - 30, 20, 'J', 0x2a2a3a, 0xaaaacc,
            () => this.scene.openJournal && this.scene.openJournal());
    }

    _makeButton(x, y, radius, label, fill, textColor, onTap) {
        const circle = this.scene.add.circle(x, y, radius, fill, 0.5)
            .setScrollFactor(0).setDepth(DEPTH)
            .setStrokeStyle(2, textColor, 0.7)
            .setInteractive({ useHandCursor: true });

        const txt = this.scene.add.text(x, y, label, {
            fontSize: `${Math.round(radius)}px`,
            color: Phaser.Display.Color.IntegerToColor(textColor).rgba,
            fontFamily: 'Courier New'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH + 1);

        circle.on('pointerdown', (pointer, lx, ly, event) => {
            // Don't let this tap also drive the joystick
            if (event) event.stopPropagation();
            circle.setAlpha(0.85);
            onTap();
        });
        circle.on('pointerup',   () => circle.setAlpha(0.5));
        circle.on('pointerout',  () => circle.setAlpha(0.5));

        return { circle, txt };
    }

    // ── Joystick pointer handling ───────────────────────────────────────────
    _wireJoystickInput() {
        const W = this.scene.scale.width;

        this.scene.input.on('pointerdown', (pointer) => {
            // Only the left half of the screen drives the joystick.
            if (this._joyPointerId !== null) return;
            if (pointer.x > W / 2) return;
            this._joyPointerId = pointer.id;
            // Re-center the base under the finger for a "floating" stick feel
            this.joyBaseX = pointer.x;
            this.joyBaseY = pointer.y;
            this.joyBase.setPosition(this.joyBaseX, this.joyBaseY).setVisible(true);
            this.joyThumb.setPosition(this.joyBaseX, this.joyBaseY).setVisible(true);
            this._updateJoystick(pointer);
        });

        this.scene.input.on('pointermove', (pointer) => {
            if (pointer.id !== this._joyPointerId) return;
            this._updateJoystick(pointer);
        });

        const release = (pointer) => {
            if (pointer.id !== this._joyPointerId) return;
            this._joyPointerId = null;
            this.joyThumb.setPosition(this.joyBaseX, this.joyBaseY);
            this.move.up = this.move.down = this.move.left = this.move.right = false;
            this.move.run = false;
        };
        this.scene.input.on('pointerup', release);
        this.scene.input.on('pointerupoutside', release);
    }

    _updateJoystick(pointer) {
        let dx = pointer.x - this.joyBaseX;
        let dy = pointer.y - this.joyBaseY;
        const dist = Math.hypot(dx, dy);
        const max  = this.joyRadius;

        // Clamp thumb to the base radius
        if (dist > max) {
            dx = (dx / dist) * max;
            dy = (dy / dist) * max;
        }
        this.joyThumb.setPosition(this.joyBaseX + dx, this.joyBaseY + dy);

        const mag = Math.min(dist, max) / max; // 0..1
        if (mag < DEAD_ZONE) {
            this.move.up = this.move.down = this.move.left = this.move.right = false;
            this.move.run = false;
            return;
        }

        // Normalised direction → 8-way booleans via per-axis thresholds
        const nx = dx / max;
        const ny = dy / max;
        const axisThreshold = 0.35;

        this.move.left  = nx < -axisThreshold;
        this.move.right = nx >  axisThreshold;
        this.move.up    = ny < -axisThreshold;
        this.move.down  = ny >  axisThreshold;
        this.move.run   = mag >= RUN_ZONE;
    }

    // ── Public API ──────────────────────────────────────────────────────────
    getMoveState() {
        return this.enabled ? this.move : null;
    }
}
