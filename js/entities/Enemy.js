import { ENEMIES } from '../data/enemies.js';
import EventBus from '../systems/EventBus.js';

const TILE_SIZE = 16;

export class Enemy {
    constructor(scene, x, y, enemyId, options = {}) {
        this.scene    = scene;
        this.enemyId  = enemyId;
        this.storyTag = options.storyTag || null;
        this.template = {
            ...(ENEMIES[enemyId] || ENEMIES.goblin),
            ...(options.templateOverrides || {})
        };

        // Clone mutable stats
        this.health    = this.template.health;
        this.maxHealth = this.template.maxHealth;
        this.alive     = true;
        this.aggro     = false;
        this._combatTriggered = false;

        const key = this.template.spriteKey;

        if (scene.textures.exists(key)) {
            this.sprite = scene.add.sprite(x, y, key);
            const isBoss = enemyId === 'hollow_prophet_boss';
            this.sprite.setDisplaySize(isBoss ? 38 : 24, isBoss ? 42 : 26);
            const animKey = `${key}_idle`;
            const texture = scene.textures.get(key);
            if (texture.frameTotal > 1 && !scene.anims.exists(animKey)) {
                scene.anims.create({
                    key:       animKey,
                    frames:    scene.anims.generateFrameNumbers(key, { start: 0, end: 1 }),
                    frameRate: 2,
                    repeat:    -1
                });
            }
            if (scene.anims.exists(animKey)) this.sprite.play(animKey);
        } else {
            // Fallback coloured rectangle
            const enemyColors = {
                goblin:      0x55aa33,
                bandit:      0xaa5533,
                cave_spider: 0x334455,
                skeleton:    0xddddcc,
                wraith:      0x8855aa
            };
            const col    = enemyColors[enemyId] || 0xcc3333;
            this.sprite  = scene.add.rectangle(x, y, 12, 16, col);
        }

        this.sprite.setDepth(9);

        // Health bar graphics
        this.healthBar = scene.add.graphics().setDepth(10);

        // Aggro indicator (small exclamation mark)
        this.aggroIndicator = scene.add.text(x, y - 18, '', {
            fontSize: '12px', color: '#ffdd00', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(12);

        // Wander state
        this.wanderTimer = Phaser.Math.Between(2000, 5000);
        this.wanderTargetX = x;
        this.wanderTargetY = y;
        this.originX = x;
        this.originY = y;
    }

    update(playerSprite, playerData, tileMap, delta) {
        if (!this.alive) return;
        if (this.sprite.visible === false) return;

        // Skip expensive wander/healthbar logic for off-screen non-aggro enemies
        if (!this.aggro) {
            const cam = this.scene.cameras.main;
            const onScreen = (
                this.sprite.x > cam.scrollX - 200 && this.sprite.x < cam.scrollX + cam.width + 200 &&
                this.sprite.y > cam.scrollY - 200 && this.sprite.y < cam.scrollY + cam.height + 200
            );
            if (!onScreen) return;
        }

        const sx   = this.sprite.x;
        const sy   = this.sprite.y;
        const dist = Phaser.Math.Distance.Between(sx, sy, playerSprite.x, playerSprite.y);
        const aggroRange = this.template.aggroRange * TILE_SIZE;

        // Aggro management
        if (!this.aggro && dist < aggroRange && this.template.aggressive) {
            this.aggro = true;
            this.aggroIndicator.setText('!');
            this.scene.time.delayedCall(800, () => {
                if (this.aggroIndicator) this.aggroIndicator.setText('');
            });
        }
        if (this.aggro && dist > aggroRange * 2.5) {
            this.aggro = false;
        }

        if (this.aggro) {
            // Move toward player
            if (dist > TILE_SIZE * 0.5) {
                const angle = Math.atan2(playerSprite.y - sy, playerSprite.x - sx);
                const spd   = 60;
                this.sprite.x += Math.cos(angle) * spd * (delta / 1000);
                this.sprite.y += Math.sin(angle) * spd * (delta / 1000);
            }

            // Initiate combat when very close
            if (dist < TILE_SIZE && !this._combatTriggered) {
                this._combatTriggered = true;
                this.initiateCombat(playerData);
            }
        } else {
            // Wander near origin
            this.wanderTimer -= delta;
            if (this.wanderTimer <= 0) {
                this.wanderTimer = Phaser.Math.Between(3000, 7000);
                const angle = Math.random() * Math.PI * 2;
                const range = TILE_SIZE * 3;
                this.wanderTargetX = this.originX + Math.cos(angle) * range;
                this.wanderTargetY = this.originY + Math.sin(angle) * range;
            }

            const wx   = this.wanderTargetX - sx;
            const wy   = this.wanderTargetY - sy;
            const wdst = Math.sqrt(wx * wx + wy * wy);
            if (wdst > 4) {
                this.sprite.x += (wx / wdst) * 25 * (delta / 1000);
                this.sprite.y += (wy / wdst) * 25 * (delta / 1000);
            }
        }

        // Draw health bar when aggroed
        this.healthBar.clear();
        if (this.aggro) {
            this.healthBar.fillStyle(0x880000, 1);
            this.healthBar.fillRect(sx - 8, sy - 14, 16, 3);
            this.healthBar.fillStyle(0x00cc00, 1);
            this.healthBar.fillRect(sx - 8, sy - 14, 16 * (this.health / this.maxHealth), 3);
        }

        this.aggroIndicator.x = sx;
        this.aggroIndicator.y = sy - 18;
    }

    initiateCombat(playerData) {
        if (!this.scene.scene.isActive('Combat')) {
            this.scene.scene.launch('Combat', { enemy: this });
            this.scene.scene.pause('Game');
        }
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        if (this.health <= 0) this.die();
        return this.health;
    }

    die() {
        if (!this.alive) return;
        this.alive = false;
        this.aggro = false;
        this.healthBar.clear();
        this.aggroIndicator.setText('');

        if (this.sprite.setAlpha) this.sprite.setAlpha(0.3);

        if (this.storyTag) EventBus.emit('story_enemy_killed', this.storyTag, this.enemyId);

        this.scene.time.delayedCall(2000, () => {
            if (this.sprite)          this.sprite.destroy();
            if (this.healthBar)       this.healthBar.destroy();
            if (this.aggroIndicator)  this.aggroIndicator.destroy();
        });
    }

    generateLoot() {
        const loot = [];
        if (this.template.lootTable) {
            for (const entry of this.template.lootTable) {
                if (Math.random() < (entry.chance || 0)) {
                    const qty = Array.isArray(entry.quantity)
                        ? Phaser.Math.Between(entry.quantity[0], entry.quantity[1])
                        : 1;
                    loot.push({ itemId: entry.itemId, quantity: qty });
                }
            }
        }
        if (this.template.gold) {
            const g = Phaser.Math.Between(this.template.gold[0], this.template.gold[1]);
            if (g > 0) loot.push({ itemId: 'gold_coin', quantity: g });
        }
        return loot;
    }
}
