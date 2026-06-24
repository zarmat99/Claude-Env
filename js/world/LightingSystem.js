// LightingSystem.js — Day/night cycle + torch lighting
// 1 real second = 1 game minute. Full day = 24 real minutes.

export class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.gameMinutesPerRealSecond = 1; // 1 real second = 1 game minute

        // Full-screen overlay — scrollFactor 0 so it stays fixed on screen
        this.overlay = scene.add.rectangle(
            0, 0,
            scene.scale.width,
            scene.scale.height,
            0x000820, 0
        );
        this.overlay.setOrigin(0, 0).setScrollFactor(0).setDepth(100);

        // Torch light circles drawn on a second overlay using a Graphics object
        this.torchGraphics = scene.add.graphics();
        this.torchGraphics.setScrollFactor(0).setDepth(99);
        this.torchGraphics.setBlendMode(Phaser.BlendModes.ADD);

        this.torches = []; // { worldX, worldY, radius }

        this._lastGameHour = -1;
    }

    /**
     * Call in scene update().
     * @param {number} worldTime  seconds since game start
     * @param {number} playerX    camera/player world pixel X
     * @param {number} playerY    camera/player world pixel Y
     */
    update(worldTime, playerX, playerY) {
        const gameHour = this.getGameHour(worldTime);
        const alpha = this.calculateDarknessAlpha(gameHour);
        if (Math.abs(alpha - (this._lastAlpha ?? -1)) > 0.001) {
            this.overlay.setAlpha(alpha);
            this._lastAlpha = alpha;
        }

        // Only redraw torch graphics when transitioning or torches exist
        if (alpha > 0.05 && this.torches.length > 0) {
            this._drawTorches(playerX, playerY, alpha);
        } else {
            this.torchGraphics.clear();
        }

        this._lastGameHour = gameHour;
    }

    /**
     * Returns the current game hour (0–24) as a float.
     */
    getGameHour(worldTime) {
        const totalGameMinutes = worldTime * this.gameMinutesPerRealSecond;
        return (totalGameMinutes / 60) % 24;
    }

    /**
     * Returns darkness alpha: 0 at noon, 0.85 at midnight.
     * Smooth transitions at dawn (5-7) and dusk (19-21).
     */
    calculateDarknessAlpha(gameHour) {
        // Midday = 12:00 → alpha 0
        // Midnight = 0:00 / 24:00 → alpha 0.85
        // Dawn: 5:00 → 0.85, 7:00 → 0
        // Dusk: 19:00 → 0, 21:00 → 0.85

        const MAX_DARK = 0.85;

        if (gameHour >= 7 && gameHour <= 19) {
            // Full day
            if (gameHour <= 13) {
                // Morning to noon: 7→0, 13→0
                return 0;
            }
            // noon to evening stays 0
            return 0;
        }

        if (gameHour > 5 && gameHour < 7) {
            // Dawn: fading from dark to light
            const t = (gameHour - 5) / 2; // 0..1
            return MAX_DARK * (1 - smoothstep(t));
        }

        if (gameHour > 19 && gameHour < 21) {
            // Dusk: fading from light to dark
            const t = (gameHour - 19) / 2; // 0..1
            return MAX_DARK * smoothstep(t);
        }

        // Night: 21:00–5:00 (wrapping through midnight)
        // Peak darkness at midnight (hour 0 / 24)
        if (gameHour >= 21) {
            // 21 → 0.85 already (see dusk), hold at max
            const t = (gameHour - 21) / 3; // 21..24 → 0..1
            return MAX_DARK * (0.85 + 0.15 * smoothstep(t)) / 1; // slight variation
        }

        // 0:00–5:00
        if (gameHour <= 5) {
            if (gameHour < 2) return MAX_DARK;
            // Slowly fade toward dawn
            const t = (gameHour - 2) / 3; // 0..1 from 2:00 to 5:00
            return MAX_DARK * (1 - 0.15 * smoothstep(t));
        }

        return 0;
    }

    _drawTorches(playerX, playerY, overlayAlpha) {
        const cam = this.scene.cameras.main;
        this.torchGraphics.clear();

        for (const torch of this.torches) {
            // Convert world pixel to screen pixel
            const screenX = torch.worldX - cam.scrollX;
            const screenY = torch.worldY - cam.scrollY;

            const radiusPx = torch.radius * 16; // radius in tiles → pixels

            // Draw additive light circle: bright centre fading out
            const steps = 6;
            for (let i = steps; i >= 1; i--) {
                const r = (i / steps) * radiusPx;
                const a = (1 - i / steps) * overlayAlpha * 0.9;
                this.torchGraphics.fillStyle(0xff9933, a);
                this.torchGraphics.fillCircle(screenX, screenY, r);
            }
        }
    }

    /**
     * Returns formatted time string e.g. "14:32"
     */
    getTimeString(worldTime) {
        const totalMin = Math.floor(worldTime * this.gameMinutesPerRealSecond);
        const h = Math.floor((totalMin / 60) % 24);
        const m = totalMin % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    /**
     * Returns 'dawn' | 'day' | 'dusk' | 'night'
     */
    getTimePeriod(worldTime) {
        const h = this.getGameHour(worldTime);
        if (h >= 5  && h < 7)  return 'dawn';
        if (h >= 7  && h < 19) return 'day';
        if (h >= 19 && h < 21) return 'dusk';
        return 'night';
    }

    addTorch(worldX, worldY, radius = 4) {
        // Avoid duplicates
        const exists = this.torches.some(t => t.worldX === worldX && t.worldY === worldY);
        if (!exists) {
            this.torches.push({ worldX, worldY, radius });
        }
    }

    removeTorch(worldX, worldY) {
        this.torches = this.torches.filter(t => !(t.worldX === worldX && t.worldY === worldY));
    }

    destroy() {
        this.overlay.destroy();
        this.torchGraphics.destroy();
    }
}

// Smooth hermite interpolation
function smoothstep(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
}
