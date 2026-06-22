import EventBus from '../systems/EventBus.js';

export default class BootScene extends Phaser.Scene {
    constructor() { super({ key: 'Boot' }); }

    create() {
        // Set up global registry defaults
        this.registry.set('worldSeed', 12345);
        this.registry.set('player', null);
        this.registry.set('worldData', null);
        this.registry.set('currentDungeon', null);
        this.registry.set('gameStartTime', Date.now());

        // Set preferred scale
        this.scale.setGameSize(960, 640);

        this.scene.start('Preload');
    }
}
