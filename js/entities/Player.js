import { TILE } from '../world/Biomes.js';
import EventBus from '../systems/EventBus.js';

const TILE_SIZE = 16;

export class Player {
    constructor(scene, x, y, playerData) {
        this.scene = scene;
        this.data  = playerData;

        const raceKey = `player_${playerData.race}`;

        // Use a sprite if the texture exists; otherwise fall back to a rectangle stand-in
        if (scene.textures.exists(raceKey)) {
            this.sprite = scene.physics.add.sprite(x, y, raceKey, 0);
        } else {
            // Fallback: physics-enabled rectangle drawn as a graphics object
            this.sprite = scene.physics.add.sprite(x, y, '__DEFAULT');
            this.sprite.setDisplaySize(14, 18);
            this.sprite.setTint(0x88ccff);
        }

        this.sprite.setCollideWorldBounds(true);
        this.sprite.setDepth(10);

        // Directional shadow to show facing (small graphics object)
        this.shadow = scene.add.graphics().setDepth(9);

        // Create walk/idle animations if texture is a sprite sheet
        this.createAnimations(scene, playerData.race);

        this.facingDir = 0;   // 0=down, 1=up, 2=left, 3=right
        this.isMoving  = false;
    }

    createAnimations(scene, race) {
        const key = `player_${race}`;
        if (!scene.textures.exists(key)) return;
        if (scene.anims.exists(`${key}_walk_down`)) return;

        const dirs = ['down', 'up', 'left', 'right'];
        dirs.forEach((dir, i) => {
            const startFrame = i * 5;
            scene.anims.create({
                key:       `${key}_walk_${dir}`,
                frames:    scene.anims.generateFrameNumbers(key, { start: startFrame, end: startFrame + 4 }),
                frameRate: 8,
                repeat:    -1
            });
            scene.anims.create({
                key:       `${key}_idle_${dir}`,
                frames:    [{ key, frame: startFrame }],
                frameRate: 1,
                repeat:    -1
            });
        });
    }

    update(cursors, wasd, tileMap, playerData, delta, touch = null) {
        const speed    = playerData.derived.moveSpeed || 140;
        const canRun   = playerData.derived.stamina > 5;
        const runHeld  = (wasd.run && wasd.run.isDown) || (touch && touch.run);
        const runMult  = (runHeld && canRun) ? 1.7 : 1.0;

        const left  = cursors.left.isDown  || (wasd.left  && wasd.left.isDown)  || (touch && touch.left);
        const right = cursors.right.isDown || (wasd.right && wasd.right.isDown) || (touch && touch.right);
        const up    = cursors.up.isDown    || (wasd.up    && wasd.up.isDown)    || (touch && touch.up);
        const down  = cursors.down.isDown  || (wasd.down  && wasd.down.isDown)  || (touch && touch.down);

        let vx = 0, vy = 0;
        if (left)  { vx = -speed * runMult; this.facingDir = 2; }
        if (right) { vx =  speed * runMult; this.facingDir = 3; }
        if (up)    { vy = -speed * runMult; this.facingDir = 1; }
        if (down)  { vy =  speed * runMult; this.facingDir = 0; }

        // Diagonal normalisation
        if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

        // Tile-based collision check (per-axis)
        const dt    = delta / 1000;
        const curTX = Math.floor(this.sprite.x / TILE_SIZE);
        const curTY = Math.floor(this.sprite.y / TILE_SIZE);

        if (tileMap && vx !== 0) {
            const nextTX = Math.floor((this.sprite.x + vx * dt) / TILE_SIZE);
            if (!tileMap.isWalkable(nextTX, curTY)) vx = 0;
        }
        if (tileMap && vy !== 0) {
            const nextTY = Math.floor((this.sprite.y + vy * dt) / TILE_SIZE);
            if (!tileMap.isWalkable(curTX, nextTY)) vy = 0;
        }

        this.sprite.setVelocity(vx, vy);

        // Animation
        const key     = `player_${playerData.race}`;
        const dirs    = ['down', 'up', 'left', 'right'];
        const dirName = dirs[this.facingDir];
        const moving  = vx !== 0 || vy !== 0;

        if (this.scene.textures.exists(key) && this.scene.anims.exists(`${key}_walk_${dirName}`)) {
            this.sprite.play(moving ? `${key}_walk_${dirName}` : `${key}_idle_${dirName}`, true);
        }

        // Update shadow position
        this.shadow.clear();
        this.shadow.fillStyle(0x000000, 0.3);
        this.shadow.fillEllipse(this.sprite.x, this.sprite.y + 8, 14, 6);

        // Stamina management
        if (moving && runMult > 1) {
            playerData.derived.stamina = Math.max(0, playerData.derived.stamina - delta * 0.02);
        } else {
            playerData.derived.stamina = Math.min(
                playerData.derived.maxStamina,
                playerData.derived.stamina + delta * 0.005
            );
        }
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }

    destroy() {
        this.sprite.destroy();
        this.shadow.destroy();
    }
}
