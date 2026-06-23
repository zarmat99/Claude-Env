import { QUESTS } from '../data/quests.js';
import { save } from '../systems/SaveSystem.js';

export default class EndingScene extends Phaser.Scene {
    constructor() { super({ key: 'Ending' }); }

    init(data) {
        this.endingId = data?.endingId || 'ending_delay';
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        const ending = QUESTS.main_act5.endings[this.endingId] || QUESTS.main_act5.endings.ending_delay;
        const player = this.registry.get('player');
        if (player) {
            player.ending = ending.id;
            save(player, this.registry.get('worldData'));
        }

        this.add.rectangle(W / 2, H / 2, W, H, 0x03030a);
        this.add.image(W / 2, 135,
            ending.id === 'ending_restoration' ? 'story_restored_rootstone' : 'story_rootwarden_altar')
            .setDisplaySize(150, 150);
        this.add.text(W / 2, 245, ending.title, {
            fontSize: '32px', color: '#91f4df', fontFamily: 'Courier New'
        }).setOrigin(0.5);
        this.add.text(W / 2, 315, ending.description, {
            fontSize: '17px', color: '#d5d9e6', fontFamily: 'Georgia',
            wordWrap: { width: 650 }, align: 'center', lineSpacing: 9
        }).setOrigin(0.5, 0);
        this.add.text(W / 2, 475, 'AETHERMOOR — CHRONICLES OF THE DYING ROOTSTONES', {
            fontSize: '13px', color: '#62738c', fontFamily: 'Courier New'
        }).setOrigin(0.5);

        const button = this.add.text(W / 2, 545, '[ Continue in Aethermoor ]', {
            fontSize: '16px', color: '#8ee6ff', fontFamily: 'Courier New',
            backgroundColor: '#0b1924', padding: { x: 18, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        button.on('pointerdown', () => {
            this.scene.stop('Ending');
            if (this.scene.isPaused('Game')) this.scene.resume('Game');
        });
    }
}
