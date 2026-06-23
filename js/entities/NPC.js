const TILE_SIZE = 16;

export class NPC {
    constructor(scene, x, y, npcData) {
        this.scene = scene;
        this.data  = npcData;

        // Sprite or fallback rectangle
        if (scene.textures.exists(npcData.spriteKey)) {
            this.sprite = scene.add.sprite(x, y, npcData.spriteKey, 0);

            const animKey = `${npcData.spriteKey}_idle`;
            if (!scene.anims.exists(animKey)) {
                scene.anims.create({
                    key:       animKey,
                    frames:    [{ key: npcData.spriteKey, frame: 0 }],
                    frameRate: 1
                });
            }
            this.sprite.play(animKey);
        } else {
            // Fallback: coloured rectangle to represent the NPC
            const colors = { varesh: 0xd4a76a, cindrak: 0x9a8a7a, sylveni: 0xc8d4b8, vorrkai: 0x5a6a7a, thornkin: 0x7a6a4a };
            const col    = colors[npcData.race] || 0xaaaaaa;
            this.sprite  = scene.add.rectangle(x, y, 12, 18, col);
        }

        this.sprite.setDepth(9);

        // Name label
        this.nameLabel = scene.add.text(x, y - 14, npcData.name, {
            fontSize: '8px', color: '#aaccff', fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(11);

        // Title/role label
        if (npcData.title) {
            this.titleLabel = scene.add.text(x, y - 22, npcData.title, {
                fontSize: '7px', color: '#667788', fontFamily: 'Courier New'
            }).setOrigin(0.5).setDepth(11);
        }

        this.targetX = x;
        this.targetY = y;
        this.homeX   = x;
        this.homeY   = y;
    }

    update(worldTime, delta) {
        const gameHour = (worldTime / 60) % 24;

        // Follow daily schedule
        if (this.data.schedule && this.data.schedule.length > 0) {
            for (let i = this.data.schedule.length - 1; i >= 0; i--) {
                if (gameHour >= this.data.schedule[i].hour) {
                    const target = this.data.schedule[i].tile;
                    this.targetX = target.x * TILE_SIZE + TILE_SIZE / 2;
                    this.targetY = target.y * TILE_SIZE + TILE_SIZE / 2;
                    break;
                }
            }
        }

        // Smooth movement toward target position
        const dx   = this.targetX - this.sprite.x;
        const dy   = this.targetY - this.sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 2) {
            const spd = 40;
            this.sprite.x += (dx / dist) * spd * (delta / 1000);
            this.sprite.y += (dy / dist) * spd * (delta / 1000);
        }

        // Keep labels above NPC
        const sx = this.sprite.x;
        const sy = this.sprite.y;

        this.nameLabel.x = sx;
        this.nameLabel.y = sy - 14;

        if (this.titleLabel) {
            this.titleLabel.x = sx;
            this.titleLabel.y = sy - 23;
        }
    }

    destroy() {
        this.sprite.destroy();
        this.nameLabel.destroy();
        if (this.titleLabel) this.titleLabel.destroy();
    }
}
