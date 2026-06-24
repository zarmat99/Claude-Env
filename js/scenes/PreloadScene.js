import { SpriteFactory } from '../sprites/SpriteFactory.js';
import { generateWorld } from '../world/WorldGen.js';
import EventBus from '../systems/EventBus.js';

export default class PreloadScene extends Phaser.Scene {
    constructor() { super({ key: 'Preload' }); }

    preload() {
        this.load.image('tiles', 'assets/textures/tiles.png?v=generated-32px-tiles');

        const spriteKeys = [
            'player_varesh', 'player_cindrak', 'player_sylveni', 'player_vorrkai', 'player_thornkin',
            'npc_scholar', 'npc_rootwarden_elder', 'npc_high_consul', 'npc_warmaster', 'npc_abbess',
            'npc_innkeeper', 'npc_blacksmith', 'npc_guard_captain', 'npc_alchemist', 'npc_vorrkai_elder',
            'enemy_goblin', 'enemy_bandit', 'enemy_cave_spider', 'enemy_swamp_crawler', 'enemy_skeleton',
            'enemy_cult_zealot', 'enemy_wraith', 'enemy_lava_salamander', 'enemy_void_hound',
            'enemy_hollow_prophet_boss'
        ];
        for (const key of spriteKeys) this.load.image(key, `assets/sprites/${key}.png`);
        const portraitAliases = {
            portrait_race_varesh: 'player_varesh',
            portrait_race_cindrak: 'player_cindrak',
            portrait_race_sylveni: 'player_sylveni',
            portrait_race_vorrkai: 'player_vorrkai',
            portrait_race_thornkin: 'player_thornkin',
            portrait_cael: 'npc_scholar',
            portrait_sathis: 'npc_rootwarden_elder',
            portrait_varenne: 'npc_high_consul',
            portrait_kash: 'npc_warmaster',
            portrait_abbess_vonn: 'npc_abbess',
            portrait_innkeeper: 'npc_innkeeper',
            portrait_blacksmith: 'npc_blacksmith',
            portrait_guard_captain: 'npc_guard_captain',
            portrait_syllis_vaar: 'npc_alchemist',
            portrait_zeth_mirrak: 'npc_vorrkai_elder'
        };
        for (const [portraitKey, spriteKey] of Object.entries(portraitAliases)) {
            this.load.image(portraitKey, `assets/sprites/${spriteKey}.png`);
        }

        const objectKeys = [
            'story_station_console', 'story_station_sabotaged', 'story_resonance_vial',
            'story_cael_notes', 'story_marker_7e', 'story_mine_shaft', 'story_underlurk_gate',
            'story_vorrkai_shrine', 'story_cult_shrine', 'story_void_sanctum', 'story_monolith',
            'story_anchor_thorn', 'story_anchor_aetherwood', 'story_anchor_emberpeak',
            'story_fallen_thornpillar', 'story_rootwarden_altar', 'story_voidbloom_weave',
            'story_voidbloom', 'story_emberpetal', 'story_rootmoss', 'story_sundering_rite',
            'story_ritual_brazier', 'story_farmhouse_cache', 'story_treasure_chest',
            'story_restored_rootstone'
        ];
        for (const key of objectKeys) this.load.image(key, `assets/objects/${key}.png`);
    }

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
