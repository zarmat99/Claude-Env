// StoryWorldSystem.js — physical story sites, encounters and quest interactions.
import EventBus from './EventBus.js';
import { QUESTS } from '../data/quests.js';
import { Enemy } from '../entities/Enemy.js';
import { addItem, getItemCount, removeItem } from './InventorySystem.js';

const TILE = 16;

export const STORY_SITES = [
    { id: 'station_verath', x: 88, y: 75, name: 'Station Verath', texture: 'story_station_sabotaged', kind: 'station' },
    { id: 'station_ossian', x: 80, y: 70, name: 'Station Ossian', texture: 'story_station_console', kind: 'station' },
    { id: 'station_keld', x: 108, y: 88, name: 'Station Keld', texture: 'story_station_sabotaged', kind: 'station' },
    { id: 'mine_shaft_entrance', x: 88, y: 148, name: 'Arcanate Mine 7-E', texture: 'story_mine_shaft', kind: 'location' },
    { id: 'underlurk_chasm', x: 91, y: 152, name: 'Underlurk Chasm', texture: 'story_underlurk_gate', kind: 'location' },
    { id: 'void_sanctum', x: 100, y: 160, name: 'Void Sanctum', texture: 'story_void_sanctum', kind: 'location' },
    { id: 'underlurk_exit', x: 88, y: 146, name: 'Ventilation Chimney', texture: 'story_marker_7e', kind: 'location' },
    { id: 'void_anchor_thornpillar', x: 80, y: 69, name: 'Thornpillar Void Anchor', texture: 'story_anchor_thorn', kind: 'anchor' },
    { id: 'void_anchor_aetherwood', x: 173, y: 103, name: 'Aetherwood Void Anchor', texture: 'story_anchor_aetherwood', kind: 'anchor' },
    { id: 'void_anchor_emberpeak', x: 158, y: 173, name: 'Emberpeak Void Anchor', texture: 'story_anchor_emberpeak', kind: 'anchor' },
    { id: 'thornpillar_fall', x: 82, y: 82, name: 'The Fallen Thornpillar', texture: 'story_fallen_thornpillar', kind: 'event' },
    { id: 'thornpillar_chasm_edge', x: 84, y: 84, name: 'Thornpillar Chasm Edge', texture: 'story_ritual_brazier', kind: 'ritual' },
    { id: 'rootwarden_altar', x: 165, y: 85, name: 'Rootwarden Altar', texture: 'story_rootwarden_altar', kind: 'altar' },
    { id: 'greyhollow_warehouse', x: 75, y: 98, name: 'Greyhollow Warehouse', texture: 'story_treasure_chest', kind: 'side' },
    { id: 'aetherwood_deep', x: 174, y: 92, name: 'Deep Aetherwood', texture: 'story_vorrkai_shrine', kind: 'side' },
    { id: 'aetherwood_heart_grove', x: 180, y: 100, name: 'Heart Grove', texture: 'story_restored_rootstone', kind: 'side' },
    { id: 'abandoned_farmstead_cache', x: 102, y: 115, name: 'Loose Farmhouse Floorboard', texture: 'story_farmhouse_cache', kind: 'side' },
    { id: 'monolith_upper_shallows', x: 90, y: 151, name: 'Shallows Monolith', texture: 'story_monolith', kind: 'monolith' },
    { id: 'monolith_vorrkai_territory', x: 93, y: 155, name: 'Vorrkai Monolith', texture: 'story_monolith', kind: 'monolith' },
    { id: 'monolith_cult_shrine', x: 97, y: 158, name: 'Cult Shrine Monolith', texture: 'story_monolith', kind: 'monolith' },
    { id: 'monolith_void_sanctum_base', x: 101, y: 162, name: 'Sanctum Monolith', texture: 'story_monolith', kind: 'monolith' },

    // New narrative sites added in expansion
    { id: 'arcanate_console',     x: 120, y: 68,  name: 'Resonance Console',          kind: 'location', texture: 'story_station_console' },
    { id: 'oren_journal',         x: 101, y: 161, name: "The Prophet's Journal",       kind: 'side',     texture: 'story_farmhouse_cache' },
    { id: 'ashveil_shrine',       x:  10, y: 110, name: 'Dying Rootstone Shrine',      kind: 'ritual',   texture: 'story_ritual_brazier' },
    { id: 'observatory_lens',     x: 158, y: 32,  name: 'Observatory Telescope',       kind: 'location', texture: 'story_marker_7e' },
    { id: 'vorrkai_memorial',     x:  97, y: 157, name: 'Vorrkai Wall of Names',       kind: 'monolith', texture: 'story_monolith' },
    { id: 'pre_shattering_map',   x: 121, y: 67,  name: 'World Map (Pre-Shattering)',  kind: 'side',     texture: 'story_farmhouse_cache' },
    { id: 'arcanate_engine_core', x: 119, y: 70,  name: 'Resonance Engine Core',       kind: 'side',     texture: 'story_void_sanctum' },
    { id: 'compact_mass_grave',   x:  35, y:  72, name: 'The Unmarked Graves',         kind: 'event',    texture: 'story_fallen_thornpillar' },

    { id: 'emberpetal_1', x: 153, y: 176, name: 'Emberpetal', texture: 'story_emberpetal', kind: 'herb', itemId: 'emberpetal' },
    { id: 'emberpetal_2', x: 157, y: 178, name: 'Emberpetal', texture: 'story_emberpetal', kind: 'herb', itemId: 'emberpetal' },
    { id: 'emberpetal_3', x: 162, y: 176, name: 'Emberpetal', texture: 'story_emberpetal', kind: 'herb', itemId: 'emberpetal' },
    { id: 'emberpetal_4', x: 165, y: 171, name: 'Emberpetal', texture: 'story_emberpetal', kind: 'herb', itemId: 'emberpetal' },
    { id: 'rootmoss_1', x: 78, y: 72, name: 'Rootmoss', texture: 'story_rootmoss', kind: 'herb', itemId: 'rootmoss' },
    { id: 'rootmoss_2', x: 81, y: 73, name: 'Rootmoss', texture: 'story_rootmoss', kind: 'herb', itemId: 'rootmoss' },
    { id: 'rootmoss_3', x: 83, y: 76, name: 'Rootmoss', texture: 'story_rootmoss', kind: 'herb', itemId: 'rootmoss' },
    { id: 'rootmoss_4', x: 79, y: 78, name: 'Rootmoss', texture: 'story_rootmoss', kind: 'herb', itemId: 'rootmoss' },
    { id: 'rootmoss_5', x: 84, y: 79, name: 'Rootmoss', texture: 'story_rootmoss', kind: 'herb', itemId: 'rootmoss' },
    { id: 'voidbloom_1', x: 91, y: 154, name: 'Voidbloom', texture: 'story_voidbloom', kind: 'herb', itemId: 'voidbloom' },
    { id: 'voidbloom_2', x: 94, y: 153, name: 'Voidbloom', texture: 'story_voidbloom', kind: 'herb', itemId: 'voidbloom' },
    { id: 'voidbloom_3', x: 96, y: 156, name: 'Voidbloom', texture: 'story_voidbloom', kind: 'herb', itemId: 'voidbloom' },
    { id: 'voidbloom_4', x: 99, y: 155, name: 'Voidbloom', texture: 'story_voidbloom', kind: 'herb', itemId: 'voidbloom' },
    { id: 'voidbloom_5', x: 102, y: 158, name: 'Voidbloom', texture: 'story_voidbloom', kind: 'herb', itemId: 'voidbloom' },
    { id: 'voidbloom_6', x: 95, y: 161, name: 'Voidbloom', texture: 'story_voidbloom', kind: 'herb', itemId: 'voidbloom' },
    { id: 'voidbloom_7', x: 103, y: 163, name: 'Voidbloom', texture: 'story_voidbloom', kind: 'herb', itemId: 'voidbloom' },
    { id: 'voidbloom_8', x: 89, y: 158, name: 'Voidbloom', texture: 'story_voidbloom', kind: 'herb', itemId: 'voidbloom' }
];

export class StoryWorldSystem {
    constructor(scene) {
        this.scene = scene;
        this.player = scene.registry.get('player');
        this.sites = STORY_SITES.map(site => this.createSite(site));
        this.storyEnemies = [];
        this.spawnStoryEnemies();
        EventBus.on('story_enemy_killed', this.onStoryEnemyKilled, this);
        EventBus.on('flag_set', this.refresh, this);
        EventBus.on('quest_stage_complete', this.refresh, this);
        this.refresh();
    }

    createSite(def) {
        const sprite = this.scene.add.image(def.x * TILE + 8, def.y * TILE + 8, def.texture)
            .setDisplaySize(def.kind === 'event' ? 34 : 25, def.kind === 'event' ? 34 : 25)
            .setDepth(8);
        sprite.setData('storySiteId', def.id);
        this.scene.tweens.add({
            targets: sprite,
            y: sprite.y - 2,
            duration: 1100 + (def.x % 5) * 90,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        return { ...def, sprite };
    }

    spawnStoryEnemies() {
        const encounters = [
            [87, 75, 'cave_spider', 'station_verath_guardian'],
            [79, 70, 'void_hound', 'station_ossian_guardian'],
            [107, 88, 'cult_zealot', 'station_keld_guardian'],
            [100, 160, 'hollow_prophet_boss', 'hollow_prophet_boss'],
            [80, 69, 'void_anchor_thornpillar', 'void_anchor_thornpillar'],
            [173, 103, 'void_anchor_aetherwood', 'void_anchor_aetherwood'],
            [158, 173, 'void_anchor_emberpeak', 'void_anchor_emberpeak'],
            [178, 99, 'corrupted_woven', 'corrupted_woven_1'],
            [181, 98, 'corrupted_woven', 'corrupted_woven_2'],
            [181, 102, 'corrupted_woven', 'corrupted_woven_3'],
            [100, 114, 'compact_deserter_hunter', 'deserter_hunter_1'],
            [104, 116, 'compact_deserter_hunter', 'deserter_hunter_2'],
            // Arcanate Ruins guardians (visible once pre_shattering_map found)
            [118, 66, 'arcanate_guardian', 'arcanate_guardian_1'],
            [122, 70, 'arcanate_guardian', 'arcanate_guardian_2'],
            // Ashveil Wraith (appears during side_last_ashveil study stage)
            [9, 110, 'ashveil_wraith', 'ashveil_wraith']
        ];
        for (const [x, y, enemyId, storyTag] of encounters) {
            if (this.player.flags.has(`${storyTag}_defeated`)) continue;
            const stationFight = storyTag.startsWith('station_');
            const enemy = new Enemy(this.scene, x * TILE + 8, y * TILE + 8, enemyId, {
                storyTag,
                templateOverrides: stationFight ? {
                    health: 48, maxHealth: 48, damage: [5, 10], armor: 3, xpReward: 55
                } : {}
            });
            this.storyEnemies.push(enemy);
            this.scene.enemies.push(enemy);
        }
    }

    onStoryEnemyKilled(storyTag, enemyId) {
        this.player.flags.add(`${storyTag}_defeated`);
        if (storyTag.startsWith('station_')) this.player.flags.add(storyTag.replace('_guardian', '_secured'));
        if (storyTag === 'hollow_prophet_boss') {
            EventBus.emit('target_destroyed', 'hollow_prophet_boss');
        }
        if (storyTag.startsWith('void_anchor_')) {
            if (getItemCount(this.player, 'resonance_sample')) removeItem(this.player, 'resonance_sample', 1);
            EventBus.emit('target_destroyed', storyTag);
        }
        this.refresh();
    }

    activeStage(questId, stageId = null) {
        const index = this.player.quests.active.get(questId);
        if (index === undefined) return false;
        const stage = QUESTS[questId]?.stages?.[index];
        return stageId ? stage?.id === stageId : stage;
    }

    refresh() {
        for (const site of this.sites) {
            let visible = !this.player.flags.has(`site_${site.id}_used`);
            if (site.kind === 'anchor') visible = !!this.activeStage('main_act4', 'destroy_anchors') &&
                !this.player.flags.has(`${site.id}_defeated`);
            if (site.id === 'thornpillar_fall') visible = !!this.activeStage('main_act4', 'thornpillar_falls') ||
                this.player.flags.has('thornpillar_fallen');
            if (site.id === 'thornpillar_chasm_edge') visible = !!this.activeStage('main_act5', 'gather_ingredients');
            // Oren journal only visible after the boss is dead
            if (site.id === 'oren_journal') visible = this.player.flags.has('hollow_prophet_boss_defeated') &&
                !this.player.flags.has('oren_journal_found');
            // Arcanate engine core only visible once ruins are reached
            if (site.id === 'arcanate_engine_core') visible = !!this.player.flags.has('pre_shattering_map_found') ||
                !!this.activeStage('side_arcanate_engine', 'find_engine_core') ||
                !!this.activeStage('side_arcanate_engine', 'choose_engine_fate');
            // Ashveil shrine triggers the side quest when first approached
            if (site.id === 'ashveil_shrine') visible = !this.player.flags.has('ashveil_stone_studied') ||
                !!this.activeStage('side_last_ashveil', 'decide_stone_fate');
            // Vorrkai memorial only visible once in the outpost
            if (site.id === 'vorrkai_memorial') visible = !this.player.flags.has('vorrkai_memorial_read');
            site.sprite.setVisible(visible);
        }
        for (const enemy of this.storyEnemies) {
            let visible = true;
            if (enemy.storyTag === 'hollow_prophet_boss') visible = !!this.activeStage('main_act3', 'confront_prophet');
            if (enemy.storyTag?.startsWith('void_anchor_')) visible = !!this.activeStage('main_act4', 'destroy_anchors');
            if (enemy.storyTag?.startsWith('corrupted_woven_')) visible = !!this.activeStage('side_woven_lament', 'find_apprentice');
            if (enemy.storyTag?.startsWith('deserter_hunter_')) visible = !!this.activeStage('side_iron_blood', 'retrieve_evidence');
            if (enemy.storyTag?.startsWith('arcanate_guardian_')) visible = !!this.player.flags.has('pre_shattering_map_found') &&
                !this.player.flags.has(`${enemy.storyTag}_defeated`);
            if (enemy.storyTag === 'ashveil_wraith') visible = !!this.activeStage('side_last_ashveil', 'study_stone') &&
                !this.player.flags.has('ashveil_wraith_defeated');
            enemy.sprite.setVisible(visible && enemy.alive);
            enemy.healthBar.setVisible(visible && enemy.alive);
            enemy.aggroIndicator.setVisible(visible && enemy.alive);
        }
    }

    getNearby(maxTiles = 2) {
        const playerSprite = this.scene.playerEntity.sprite;
        return this.sites
            .filter(site => site.sprite.visible)
            .map(site => ({ site, distance: Phaser.Math.Distance.Between(
                playerSprite.x, playerSprite.y, site.sprite.x, site.sprite.y
            ) / TILE }))
            .filter(entry => entry.distance <= maxTiles)
            .sort((a, b) => a.distance - b.distance);
    }

    getHint() {
        const nearest = this.getNearby()[0];
        return nearest ? `[E] ${nearest.site.kind === 'herb' ? 'Gather' : 'Inspect'} ${nearest.site.name}` : null;
    }

    interactNearest() {
        const nearest = this.getNearby()[0];
        if (!nearest) return false;
        this.interact(nearest.site);
        return true;
    }

    interact(site) {
        if (site.kind === 'herb') return this.gatherHerb(site);
        if (site.kind === 'station') return this.inspectStation(site);
        if (site.kind === 'monolith') {
            EventBus.emit('story_interacted', site.id);
            return this.narrate('The Hollow Name', 'The stone drinks the torchlight. You press the rubbing cloth to its surface and copy a fragment of a name that feels older than language.');
        }
        if (site.kind === 'anchor') return this.confrontStoryEnemy(site.id, 'A resonance sample is required to rupture the anchor.');

        switch (site.id) {
            case 'mine_shaft_entrance':
                EventBus.emit('location_reached', 'mine_shaft_entrance');
                return this.narrate('Survey Marker 7-E', 'Behind the collapsed timbers, cold air rises from a shaft deliberately sealed from below. Cael was right: this was never a natural cave-in.');
            case 'underlurk_chasm':
                this.player.flags.add('found_vorrkai_settlement');
                EventBus.emit('location_reached', 'underlurk_chasm');
                return this.narrate('The Underlurk', 'The tunnel opens into a luminous abyss. Vorrkai lanterns mark a narrow path through roots, black water and stone that seems to breathe.');
            case 'void_sanctum':
                EventBus.emit('location_reached', 'void_sanctum');
                if (this.activeStage('main_act3', 'confront_prophet') &&
                    !this.player.flags.has('hollow_prophet_boss_defeated')) {
                    return this.confrontStoryEnemy('hollow_prophet_boss');
                }
                return this.narrate('Void Sanctum', 'The Prophet is gone. The stolen rite still hums with the machinery of a planned apocalypse.');
            case 'underlurk_exit':
                EventBus.emit('location_reached', 'underlurk_exit');
                return this.narrate('Surface Air', 'You climb the ventilation chimney as cult bells roll through the Chasm. Dawn reaches you one bleeding hand at a time.');
            case 'thornpillar_fall':
                EventBus.emit('event_witnessed', 'thornpillar_falls');
                return this.narrate('The Thornpillar Falls', 'The sky cracks. Crystal the size of a city leans, groans, and descends into the Underlurk. Greyhollow survives beneath a rain of teal fire.');
            case 'thornpillar_chasm_edge':
                if (!getItemCount(this.player, 'sundering_rite')) return this.notify('You no longer carry the Sundering Rite.');
                removeItem(this.player, 'sundering_rite', 1);
                EventBus.emit('item_used_at_location', 'sundering_rite', 'thornpillar_chasm_edge');
                return this.narrate('Ash at the Edge', 'The rite burns with a flame that gives no heat. Its ash spirals downward and seals the wound in the fallen Rootstone.');
            case 'rootwarden_altar':
                if (this.activeStage('main_act5', 'gather_ingredients')) {
                    if (getItemCount(this.player, 'voidbloom') < 5) return this.notify('The weave requires five Voidblooms.');
                    removeItem(this.player, 'voidbloom', 5);
                    addItem(this.player, 'voidbloom_weave', 1);
                    this.player.flags.add('voidbloom_weave_created');
                    for (let i = 0; i < 5; i++) {
                        EventBus.emit('crafted_at_location', 'rootwarden_altar', 'voidbloom_weave_created');
                    }
                    return this.narrate('Voidbloom Weave', 'The black flowers knot themselves around the altar roots. Darkness becomes a lattice strong enough to carry living resonance.');
                }
                return this.narrate('Rootwarden Altar', 'Ancient roots form a living arch around the Sanctuary altar.');
            case 'greyhollow_warehouse':
                if (this.activeStage('side_merchant_debt', 'investigate_warehouse')) {
                    addItem(this.player, 'ledger_evidence', 1);
                    EventBus.emit('story_interacted', 'greyhollow_warehouse');
                    this.player.flags.add('site_greyhollow_warehouse_used');
                    return this.narrate('False Ledgers', 'Behind a loose panel you find altered manifests—and a letter proving the missing coin has been feeding a family crushed by debt.');
                }
                if (this.activeStage('side_merchant_debt', 'decision')) return this.launchChoice('side_merchant_debt');
                return this.notify('The warehouse records are locked away.');
            case 'aetherwood_deep':
                EventBus.emit('story_interacted', 'aetherwood_deep');
                return this.narrate('A Trail in the Roots', 'Torn silver cloth, disturbed Rootmoss and a cold void-burn form a trail toward the Heart Grove.');
            case 'aetherwood_heart_grove':
                if (this.activeStage('side_woven_lament', 'find_apprentice')) {
                    if (!this.player.flags.has('corrupted_woven_defeated')) return this.notify('Corrupted Woven still guard the hollow oak.');
                    EventBus.emit('npc_talked_to', 'vel_apprentice');
                    return this.narrate('Vel in the Woven', 'Vel is alive inside the great oak, his voice braided with the wounded spirit around him.');
                }
                if (this.activeStage('side_woven_lament', 'cleanse_woven')) return this.launchChoice('side_woven_lament');
                return this.narrate('Heart Grove', 'The oldest oak in Aethermoor listens through a thousand pale leaves.');
            case 'abandoned_farmstead_cache':
                if (this.activeStage('side_iron_blood', 'retrieve_evidence')) {
                    addItem(this.player, 'massacre_orders', 1);
                    this.player.flags.add('site_abandoned_farmstead_cache_used');
                    return;
                }
                if (this.activeStage('side_iron_blood', 'decide_evidence')) return this.launchChoice('side_iron_blood');
                return this.notify('A loose floorboard shifts beneath your boot.');

            case 'arcanate_console':
                EventBus.emit('location_reached', 'arcanate_ruins');
                return this.narrate('Resonance Console',
                    'The console is cold and silent — the Arcanate\'s last act was to shut it down cleanly, as though they expected to return. Forty-seven engines recorded. One column is blank.');

            case 'pre_shattering_map':
                EventBus.emit('story_interacted', 'pre_shattering_map');
                this.player.flags.add('pre_shattering_map_found');
                return this.narrate('World Map (Pre-Shattering)',
                    'A cartographic record etched in resonance-crystal. Varethos was once a single continent. The seven shards hang where seven engines once stood. The Shattering was not an accident. It was a deliberate architecture — someone meant this to be reversible.');

            case 'arcanate_engine_core':
                EventBus.emit('story_interacted', 'arcanate_engine_core');
                if (this.activeStage('side_arcanate_engine', 'find_engine_core')) {
                    addItem(this.player, 'engine_core_data', 1);
                    this.player.flags.add('engine_core_found');
                    EventBus.emit('item_collected', 'engine_core_data');
                    return this.narrate('The 48th Engine',
                        'The engine is intact — sealed, not destroyed. The reason is inscribed on the housing in Vorath-Kel\'s hand: "Unstable. Requires living catalyst. Await the willing." Someone knew. Someone always knew.');
                }
                if (this.activeStage('side_arcanate_engine', 'choose_engine_fate')) return this.launchChoice('side_arcanate_engine');
                return this.narrate('Resonance Engine Core', 'Ancient machinery hums with dormant potential, waiting for someone who understands what it was built for.');

            case 'oren_journal':
                EventBus.emit('story_interacted', 'oren_journal');
                this.player.flags.add('oren_journal_found');
                addItem(this.player, 'oren_journal_copy', 1);
                EventBus.emit('item_collected', 'oren_journal_copy');
                return this.narrate("The Prophet's Journal",
                    '"Year 3 of the Dimming. My sister\'s reports speak of \'controlled decline.\' Rootwardens speak of \'buying time.\' I spent a month below the Thornpillar watching the entity breathe. It is not destroying us. It is hungry, and we have built our civilization on its back without feeding it once.\n\nYear 5. The Concordat has classified my research. Varenne says it would \'cause panic.\' I think she means it would cause accountability.\n\nYear 7. I have stopped writing for the Concordat. I write for the entity now."');

            case 'ashveil_shrine':
                EventBus.emit('location_reached', 'ashveil_outpost');
                if (this.activeStage('side_last_ashveil', 'study_stone')) {
                    if (getItemCount(this.player, 'resonance_sample') < 1)
                        return this.notify('You need a resonance sample to measure the stone\'s remaining energy.');
                    addItem(this.player, 'ashveil_reading', 1);
                    this.player.flags.add('ashveil_stone_studied');
                    EventBus.emit('item_collected', 'ashveil_reading');
                    return this.narrate('The Dying Stone',
                        'The resonance vial dims when held near the Ashveil Stone. The reading confirms what Maren already knew: three months, perhaps four. The stone is not fading — it is choosing to let go.');
                }
                if (this.activeStage('side_last_ashveil', 'decide_stone_fate')) return this.launchChoice('side_last_ashveil');
                return this.narrate('Ashveil Shrine',
                    'The Rootstone\'s light is the colour of an old bruise. Around the shrine the grass has died in concentric rings, like ripples from a stone dropped in still water.');

            case 'observatory_lens':
                EventBus.emit('location_reached', 'collapsed_observatory');
                this.player.flags.add('observatory_visited');
                return this.narrate('The Telescope',
                    'The lens is intact. Through it you see Varethos whole for the first time: seven floating shards of a broken world, each lit from below by the Rootstone it carries. The distances between them are not random. They are the gaps left by seven missing engines.');

            case 'vorrkai_memorial':
                EventBus.emit('story_interacted', 'vorrkai_memorial');
                this.player.flags.add('vorrkai_memorial_read');
                return this.narrate('Wall of Names',
                    'The wall is covered in a script that spirals outward from a central point. The language is Vorrkai — names, thousands of them. At the centre: a single phrase in Old Arcanate, the language that exiled them. "They were not wrong. We were afraid."');

            case 'compact_mass_grave':
                EventBus.emit('story_interacted', 'compact_mass_grave');
                if (!this.player.quests.completed.has('side_iron_blood') &&
                    !this.player.quests.active.has('side_iron_blood')) {
                    return this.narrate('The Unmarked Graves',
                        'Forty-three graves with no markers. The Iron Compact does not commemorate its mistakes. Someone has placed a single emberpetal on each mound — the Vorrkai sign for "remembered."');
                }
                return this.narrate('The Unmarked Graves', 'Forty-three graves. The Compact has already moved on. You are one of the few who will remember why they are here.');

            default:
                return this.narrate(site.name, 'This place carries old marks of the Dimming.');
        }
    }

    inspectStation(site) {
        if (this.activeStage('main_act2', 'cael_assassination') && site.id === 'station_verath') {
            if (!getItemCount(this.player, 'cael_notes')) addItem(this.player, 'cael_notes', 1);
            return this.narrate('Cael’s Last Safeguard', 'Beneath the console casing you find Cael’s ciphered notebook and survey marker 7-E circled three times.');
        }
        if (!this.activeStage('main_act1', 'investigate_stations')) {
            return this.narrate(site.name, 'A Rootwarden console ticks softly among signs of violence and hurried sabotage.');
        }
        if (!this.player.flags.has(`${site.id}_secured`)) return this.notify('A hostile presence still controls the station.');
        if (this.player.flags.has(`${site.id}_investigated`)) return this.notify('The resonance collector has already been removed.');
        addItem(this.player, 'resonance_sample', 1);
        EventBus.emit('location_reached', site.id);
        return this.narrate(site.name, 'You free the resonance vial from its cracked housing. The crystal inside pulses like a failing heartbeat.');
    }

    gatherHerb(site) {
        if (this.player.flags.has(`site_${site.id}_used`)) return;
        if (addItem(this.player, site.itemId, 1)) {
            this.player.flags.add(`site_${site.id}_used`);
            site.sprite.setVisible(false);
        }
    }

    confrontStoryEnemy(storyTag, missingMessage = null) {
        if (storyTag.startsWith('void_anchor_') && getItemCount(this.player, 'resonance_sample') < 1) {
            return this.notify(missingMessage || 'A resonance sample is required.');
        }
        const enemy = this.storyEnemies.find(entry => entry.storyTag === storyTag && entry.alive);
        if (!enemy) return this.notify('Nothing remains here but cooling residue.');
        enemy.initiateCombat(this.player);
    }

    tryNpcChoice(npcId) {
        const choices = {
            elder_sathis: ['main_act5', 'final_choice'],
            grey_penitent_monk: ['side_hollow_name', 'the_name'],
            iron_compact_deserter: ['side_iron_blood', 'decide_evidence'],
            concordat_merchant: ['side_merchant_debt', 'decision']
        };
        const [questId, stageId] = choices[npcId] || [];
        if (questId && this.activeStage(questId, stageId)) {
            this.launchChoice(questId);
            return true;
        }
        return false;
    }

    launchChoice(questId) {
        this.scene.scene.launch('Story', { mode: 'choice', questId });
        this.scene.scene.pause('Game');
    }

    narrate(title, body) {
        this.scene.scene.launch('Story', { mode: 'narrative', title, body });
        this.scene.scene.pause('Game');
    }

    notify(text) {
        EventBus.emit('show_notification', text, '#ffcc88');
    }

    destroy() {
        EventBus.off('story_enemy_killed', this.onStoryEnemyKilled, this);
        EventBus.off('flag_set', this.refresh, this);
        EventBus.off('quest_stage_complete', this.refresh, this);
    }
}
