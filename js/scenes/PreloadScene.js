import { SpriteFactory } from '../sprites/SpriteFactory.js';
import { generateWorld } from '../world/WorldGen.js';
import EventBus from '../systems/EventBus.js';

export default class PreloadScene extends Phaser.Scene {
    constructor() { super({ key: 'Preload' }); }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Draw loading screen background
        this.add.rectangle(W / 2, H / 2, W, H, 0x050510);

        // Title
        this.add.text(W / 2, H / 2 - 80, 'AETHERMOOR', {
            fontSize: '32px', color: '#00ccff', fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.add.text(W / 2, H / 2 - 40, 'Chronicles of the Dying Rootstones', {
            fontSize: '14px', color: '#6688aa', fontFamily: 'Courier New'
        }).setOrigin(0.5);

        // Loading bar background
        this.add.rectangle(W / 2, H / 2 + 20, 400, 12, 0x1a1a3a);
        const barFill = this.add.rectangle(W / 2 - 200, H / 2 + 20, 0, 10, 0x00ccff).setOrigin(0, 0.5);
        const statusText = this.add.text(W / 2, H / 2 + 44, 'Initializing...', {
            fontSize: '11px', color: '#6688aa', fontFamily: 'Courier New'
        }).setOrigin(0.5);

        // Actually call SpriteFactory and WorldGen with visual feedback via time events
        this.time.delayedCall(200, () => {
            statusText.setText('Weaving tile textures...');
            barFill.setSize(100, 10);

            this.time.delayedCall(80, () => {
                SpriteFactory.generateAll(this);
                statusText.setText('Generating Aethermoor...');
                barFill.setSize(300, 10);

                this.time.delayedCall(100, () => {
                    const seed = this.registry.get('worldSeed');
                    const worldData = generateWorld(seed);
                    this.registry.set('worldData', worldData);

                    barFill.setSize(400, 10);
                    statusText.setText('Complete.');

                    this.time.delayedCall(600, () => this.scene.start('MainMenu'));
                });
            });
        });
    }
}
