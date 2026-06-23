import { QUESTS } from '../data/quests.js';
import { runOnCompleteActions } from '../systems/CampaignQuestSystem.js';
import { getItemCount } from '../systems/InventorySystem.js';
import EventBus from '../systems/EventBus.js';

export default class StoryScene extends Phaser.Scene {
    constructor() { super({ key: 'Story' }); }

    init(data) {
        this.storyData = data || {};
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.add.rectangle(W / 2, H / 2, W, H, 0x02030a, 0.94);
        this.add.rectangle(W / 2, H / 2, 760, 470, 0x080b18)
            .setStrokeStyle(2, 0x3b5b72);

        if (this.storyData.mode === 'choice') this.createChoiceView();
        else this.createNarrativeView();
    }

    createNarrativeView() {
        const W = this.scale.width;
        const H = this.scale.height;
        this.add.text(W / 2, H / 2 - 170, this.storyData.title || 'Aethermoor', {
            fontSize: '24px', color: '#8ee6ff', fontFamily: 'Courier New'
        }).setOrigin(0.5);
        this.add.text(W / 2, H / 2 - 95, this.storyData.body || '', {
            fontSize: '15px', color: '#d0d9e8', fontFamily: 'Georgia',
            wordWrap: { width: 650 }, align: 'center', lineSpacing: 8
        }).setOrigin(0.5, 0);
        this.makeButton(W / 2, H / 2 + 175, 220, 'Continue', () => this.close());
        this.input.keyboard.on('keydown-SPACE', () => this.close());
        this.input.keyboard.on('keydown-ESC', () => this.close());
    }

    createChoiceView() {
        const player = this.registry.get('player');
        const quest = QUESTS[this.storyData.questId];
        const stageIndex = player?.quests.active.get(this.storyData.questId);
        const stage = quest?.stages?.[stageIndex];
        const objective = stage?.objectives?.find(obj => obj.type === 'player_choice');
        if (!player || !objective) {
            this.close();
            return;
        }

        const W = this.scale.width;
        const H = this.scale.height;
        this.add.text(W / 2, 90, stage.description || quest.name, {
            fontSize: '21px', color: '#ffd98a', fontFamily: 'Courier New',
            wordWrap: { width: 700 }, align: 'center'
        }).setOrigin(0.5);
        this.add.text(W / 2, 145, 'Your choice changes the world.', {
            fontSize: '12px', color: '#7b8da8', fontFamily: 'Courier New'
        }).setOrigin(0.5);

        const choices = objective.choices || [];
        choices.forEach((choice, index) => {
            const available = this.choiceAvailable(choice, player);
            const y = 220 + index * 92;
            const label = available ? choice.description : `${choice.description}\n[Requirements not met]`;
            this.makeButton(W / 2, y, 650, label, () => {
                if (!available) return;
                runOnCompleteActions(choice.effect || [], player, this);
                if (choice.ending) player.ending = choice.ending;
                EventBus.emit('player_choice', choice.id, this.storyData.questId);
                this.close();
            }, available);
        });
    }

    choiceAvailable(choice, player) {
        if (choice.requiresFlag && !player.flags.has(choice.requiresFlag)) return false;
        if (choice.requiresItems && !choice.requiresItems.every(id => getItemCount(player, id) > 0)) return false;
        if (choice.requiresSkill) {
            for (const [skillId, level] of Object.entries(choice.requiresSkill)) {
                const aliases = skillId === 'persuasion' ? ['speech', 'negotiation'] : [skillId];
                const actual = Math.max(...aliases.map(id => player.skills[id]?.level || 0));
                if (actual < level) return false;
            }
        }
        return true;
    }

    makeButton(x, y, width, text, callback, enabled = true) {
        const bg = this.add.rectangle(x, y, width, 68, enabled ? 0x12251d : 0x171719)
            .setStrokeStyle(1, enabled ? 0x4b9a72 : 0x444444)
            .setInteractive({ useHandCursor: enabled });
        const label = this.add.text(x, y, text, {
            fontSize: '13px', color: enabled ? '#bfffd8' : '#666666',
            fontFamily: 'Courier New', wordWrap: { width: width - 30 }, align: 'center'
        }).setOrigin(0.5);
        if (enabled) {
            bg.on('pointerover', () => bg.setFillStyle(0x1a3a2a));
            bg.on('pointerout', () => bg.setFillStyle(0x12251d));
            bg.on('pointerdown', callback);
        }
        return { bg, label };
    }

    close() {
        this.scene.stop('Story');
        if (this.scene.isPaused('Game') && !this.scene.isActive('Ending')) this.scene.resume('Game');
    }
}
