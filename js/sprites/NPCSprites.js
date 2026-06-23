// NPCSprites.js — NPC and enemy sprites

import { SpriteFactory } from './SpriteFactory.js';
import { RACE_PALETTE } from '../data/races.js';

export function generateNPCSprites(scene) {
    const npcTypes = [
        { key: 'npc_scholar',       palette: RACE_PALETTE.varesh,   clothing: '#3a5a8a', hat: '#2a4a7a' },
        { key: 'npc_innkeeper',     palette: RACE_PALETTE.varesh,   clothing: '#8a5a3a', hat: '#6a4a2a' },
        { key: 'npc_guard',         palette: RACE_PALETTE.varesh,   clothing: '#5a5a5a', hat: '#3a3a3a' },
        { key: 'npc_merchant',      palette: RACE_PALETTE.varesh,   clothing: '#c8a830', hat: '#a88820' },
        { key: 'npc_elder_thornkin',palette: RACE_PALETTE.thornkin, clothing: '#2a4a1a', hat: null       },
        { key: 'npc_druid',         palette: RACE_PALETTE.sylveni,  clothing: '#2a6a2a', hat: '#1a4a1a' },
        { key: 'npc_noble',         palette: RACE_PALETTE.varesh,   clothing: '#8a1a8a', hat: '#6a0a6a' },
        { key: 'npc_warrior',       palette: RACE_PALETTE.cindrak,  clothing: '#5a5a6a', hat: '#3a3a4a' },
        { key: 'npc_monk',          palette: RACE_PALETTE.varesh,   clothing: '#a0a0a0', hat: '#808080' },
    ];

    for (const npc of npcTypes) {
        const { canvas, ctx } = SpriteFactory.createCanvas(16 * 5, 16 * 4);
        drawNPCSheet(ctx, npc.palette, npc.clothing, npc.hat);
        SpriteFactory.register(scene, npc.key, canvas);
        addSheetFrames(scene, npc.key, 16, 16, 5, 4);
    }

    generateEnemySprites(scene);
    generateNPCPortraits(scene);
}

// ============================================================
//  NPC sheet: 5 frames × 4 directions
// ============================================================

function drawNPCSheet(ctx, palette, clothing, hat) {
    for (let dir = 0; dir < 4; dir++) {
        for (let frame = 0; frame < 5; frame++) {
            drawNPCFrame(ctx, palette, clothing, hat, dir, frame, frame * 16, dir * 16);
        }
    }
}

function drawNPCFrame(ctx, palette, clothing, hat, dir, frame, ox, oy) {
    ctx.clearRect(ox, oy, 16, 16);
    const bob = (frame === 1 || frame === 3) ? 1 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(ox + 5, oy + 15, 6, 1);

    // Legs
    const lly = oy + 12 + bob + ((frame === 1) ? -1 : 0);
    const rly = oy + 12 + bob + ((frame === 3) ? -1 : 0);
    ctx.fillStyle = clothing;
    ctx.fillRect(ox + 5, lly, 2, 3);
    ctx.fillRect(ox + 8, rly, 2, 3);
    ctx.fillStyle = palette.skinDark;
    ctx.fillRect(ox + 5, lly + 2, 2, 1);
    ctx.fillRect(ox + 8, rly + 2, 2, 1);

    // Torso
    ctx.fillStyle = clothing;
    ctx.fillRect(ox + 4, oy + 6 + bob, 8, 7);

    // Arms
    ctx.fillStyle = palette.skin;
    ctx.fillRect(ox + 2, oy + 7 + bob, 2, 4);
    ctx.fillRect(ox + 12, oy + 7 + bob, 2, 4);

    // Head
    ctx.fillStyle = palette.skin;
    ctx.fillRect(ox + 5, oy + 1 + bob, 6, 5);

    // Hair
    ctx.fillStyle = palette.hair;
    ctx.fillRect(ox + 5, oy + 1 + bob, 6, 2);

    // Hat if present
    if (hat) {
        ctx.fillStyle = hat;
        ctx.fillRect(ox + 4, oy + bob, 8, 2);
        ctx.fillRect(ox + 5, oy - 1 + bob, 6, 2);
    }

    // Eyes
    if (dir === 0) {
        ctx.fillStyle = palette.eye;
        ctx.fillRect(ox + 6, oy + 3 + bob, 1, 1);
        ctx.fillRect(ox + 9, oy + 3 + bob, 1, 1);
    } else if (dir === 2) {
        ctx.fillStyle = palette.eye;
        ctx.fillRect(ox + 5, oy + 3 + bob, 1, 1);
    } else if (dir === 3) {
        ctx.fillStyle = palette.eye;
        ctx.fillRect(ox + 10, oy + 3 + bob, 1, 1);
    }
}

// ============================================================
//  Enemy sprites
// ============================================================

function generateEnemySprites(scene) {
    const enemies = [
        { key: 'enemy_goblin',             size: 16, draw: drawGoblin },
        { key: 'enemy_skeleton',           size: 16, draw: drawSkeleton },
        { key: 'enemy_cave_spider',        size: 16, draw: drawCaveSpider },
        { key: 'enemy_stone_golem',        size: 16, draw: drawStoneGolem },
        { key: 'enemy_wraith',             size: 16, draw: drawWraith },
        { key: 'enemy_cult_zealot',        size: 16, draw: drawCultZealot },
        { key: 'enemy_bandit',             size: 16, draw: drawBandit },
        { key: 'enemy_swamp_crawler',      size: 16, draw: drawSwampCrawler },
        { key: 'enemy_lava_salamander',    size: 16, draw: drawLavaSalamander },
        { key: 'enemy_void_hound',         size: 16, draw: drawVoidHound },
        { key: 'enemy_kultist_acolyte',    size: 16, draw: drawKultistAcolyte },
        { key: 'enemy_hollow_prophet_boss',size: 24, draw: drawHollowProphet },
    ];

    for (const enemy of enemies) {
        const { canvas, ctx } = SpriteFactory.createCanvas(enemy.size * 2, enemy.size);
        enemy.draw(ctx, 0, 0, false);
        enemy.draw(ctx, enemy.size, 0, true);
        SpriteFactory.register(scene, enemy.key, canvas);
        addSheetFrames(scene, enemy.key, enemy.size, enemy.size, 2, 1);
    }
}

// -- GOBLIN: green rounded body, yellow eyes, pointy ears --
function drawGoblin(ctx, ox, oy, bobbed) {
    const by = bobbed ? 1 : 0;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(ox + 4, oy + 15, 8, 1);
    // Legs
    ctx.fillStyle = '#3a5a1a';
    ctx.fillRect(ox + 5, oy + 11 + by, 2, 4);
    ctx.fillRect(ox + 9, oy + 11 + by, 2, 4);
    // Body
    ctx.fillStyle = '#4a7a1a';
    ctx.fillRect(ox + 4, oy + 6 + by, 8, 6);
    // Arms
    ctx.fillStyle = '#4a7a1a';
    ctx.fillRect(ox + 1, oy + 7 + by, 3, 3);
    ctx.fillRect(ox + 12, oy + 7 + by, 3, 3);
    // Claws
    ctx.fillStyle = '#2a4a0a';
    ctx.fillRect(ox + 1, oy + 10 + by, 1, 1);
    ctx.fillRect(ox + 14, oy + 10 + by, 1, 1);
    // Head
    ctx.fillStyle = '#5a8a2a';
    ctx.fillRect(ox + 4, oy + 1 + by, 8, 6);
    // Ears (pointy)
    ctx.fillStyle = '#4a7a1a';
    ctx.fillRect(ox + 2, oy + 2 + by, 2, 3);
    ctx.fillRect(ox + 12, oy + 2 + by, 2, 3);
    ctx.fillRect(ox + 3, oy + 1 + by, 1, 1);
    ctx.fillRect(ox + 12, oy + 1 + by, 1, 1);
    // Eyes
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(ox + 6, oy + 3 + by, 2, 2);
    ctx.fillRect(ox + 10, oy + 3 + by, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(ox + 7, oy + 3 + by, 1, 2);
    ctx.fillRect(ox + 11, oy + 3 + by, 1, 2);
    // Mouth / teeth
    ctx.fillStyle = '#cc2200';
    ctx.fillRect(ox + 6, oy + 6 + by, 5, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 7, oy + 6 + by, 1, 1);
    ctx.fillRect(ox + 9, oy + 6 + by, 1, 1);
}

// -- SKELETON: white/cream humanoid, dark void eyes, ribs --
function drawSkeleton(ctx, ox, oy, bobbed) {
    const by = bobbed ? 1 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(ox + 4, oy + 15, 8, 1);
    // Legs (bones)
    ctx.fillStyle = '#d8d0c0';
    ctx.fillRect(ox + 5, oy + 11 + by, 2, 5);
    ctx.fillRect(ox + 9, oy + 11 + by, 2, 5);
    // Joints
    ctx.fillStyle = '#b8b0a0';
    ctx.fillRect(ox + 5, oy + 13 + by, 2, 1);
    ctx.fillRect(ox + 9, oy + 13 + by, 2, 1);
    // Torso (ribs)
    ctx.fillStyle = '#d8d0c0';
    ctx.fillRect(ox + 5, oy + 5 + by, 6, 7);
    // Rib details
    ctx.fillStyle = '#888070';
    ctx.fillRect(ox + 5, oy + 6 + by, 6, 1);
    ctx.fillRect(ox + 5, oy + 8 + by, 6, 1);
    ctx.fillRect(ox + 5, oy + 10 + by, 6, 1);
    // Arms
    ctx.fillStyle = '#d8d0c0';
    ctx.fillRect(ox + 2, oy + 5 + by, 3, 5);
    ctx.fillRect(ox + 11, oy + 5 + by, 3, 5);
    // Head (skull)
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(ox + 5, oy + 1 + by, 6, 5);
    // Eye sockets
    ctx.fillStyle = '#000000';
    ctx.fillRect(ox + 6, oy + 2 + by, 2, 2);
    ctx.fillRect(ox + 9, oy + 2 + by, 2, 2);
    // Teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 6, oy + 5 + by, 1, 1);
    ctx.fillRect(ox + 8, oy + 5 + by, 1, 1);
    ctx.fillRect(ox + 10, oy + 5 + by, 1, 1);
}

// -- CAVE SPIDER: grey-brown oval body, 6 leg stubs, multiple eyes --
function drawCaveSpider(ctx, ox, oy, bobbed) {
    const by = bobbed ? 1 : 0;
    // Legs (3 each side)
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(ox + 0, oy + 5 + by, 4, 1);
    ctx.fillRect(ox + 0, oy + 8 + by, 4, 1);
    ctx.fillRect(ox + 0, oy + 11 + by, 4, 1);
    ctx.fillRect(ox + 12, oy + 5 + by, 4, 1);
    ctx.fillRect(ox + 12, oy + 8 + by, 4, 1);
    ctx.fillRect(ox + 12, oy + 11 + by, 4, 1);
    // Body (oval)
    ctx.fillStyle = '#7a6a5a';
    ctx.fillRect(ox + 4, oy + 4 + by, 8, 10);
    ctx.fillRect(ox + 3, oy + 5 + by, 10, 8);
    // Abdomen darker
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(ox + 4, oy + 9 + by, 8, 5);
    // Eyes (multiple)
    ctx.fillStyle = '#ff2200';
    ctx.fillRect(ox + 5, oy + 5 + by, 1, 1);
    ctx.fillRect(ox + 7, oy + 4 + by, 1, 1);
    ctx.fillRect(ox + 9, oy + 5 + by, 1, 1);
    ctx.fillRect(ox + 6, oy + 6 + by, 1, 1);
    ctx.fillRect(ox + 8, oy + 6 + by, 1, 1);
    // Fangs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 7, oy + 7 + by, 1, 2);
    ctx.fillRect(ox + 9, oy + 7 + by, 1, 2);
}

// -- STONE GOLEM: blocky grey, teal crystal eye --
function drawStoneGolem(ctx, ox, oy, bobbed) {
    const by = bobbed ? 1 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(ox + 2, oy + 15, 12, 1);
    // Legs
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(ox + 3, oy + 11 + by, 4, 5);
    ctx.fillRect(ox + 9, oy + 11 + by, 4, 5);
    // Body (wide)
    ctx.fillStyle = '#7a7a8a';
    ctx.fillRect(ox + 2, oy + 4 + by, 12, 8);
    // Arms (thick)
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(ox + 0, oy + 4 + by, 2, 7);
    ctx.fillRect(ox + 14, oy + 4 + by, 2, 7);
    // Fist
    ctx.fillStyle = '#8a8a9a';
    ctx.fillRect(ox + 0, oy + 9 + by, 3, 3);
    ctx.fillRect(ox + 13, oy + 9 + by, 3, 3);
    // Head
    ctx.fillStyle = '#8a8a9a';
    ctx.fillRect(ox + 4, oy + 0 + by, 8, 5);
    // Cracks
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(ox + 4, oy + 5 + by, 1, 5);
    ctx.fillRect(ox + 9, oy + 7 + by, 4, 1);
    // Crystal eye
    ctx.fillStyle = '#00ccaa';
    ctx.fillRect(ox + 6, oy + 1 + by, 4, 3);
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(ox + 7, oy + 1 + by, 2, 2);
}

// -- WRAITH: dark purple oval, tendrils, translucent feel --
function drawWraith(ctx, ox, oy, bobbed) {
    const by = bobbed ? 1 : 0;
    // Tendrils
    ctx.fillStyle = 'rgba(80,0,120,0.6)';
    ctx.fillRect(ox + 4, oy + 10 + by, 2, 6);
    ctx.fillRect(ox + 7, oy + 11 + by, 2, 5);
    ctx.fillRect(ox + 10, oy + 10 + by, 2, 6);
    ctx.fillRect(ox + 2, oy + 8 + by, 2, 4);
    ctx.fillRect(ox + 12, oy + 8 + by, 2, 4);
    // Body (semi-transparent oval)
    ctx.fillStyle = 'rgba(100,0,160,0.85)';
    ctx.fillRect(ox + 3, oy + 2 + by, 10, 10);
    ctx.fillRect(ox + 2, oy + 4 + by, 12, 6);
    // Inner glow
    ctx.fillStyle = 'rgba(160,0,220,0.7)';
    ctx.fillRect(ox + 5, oy + 4 + by, 6, 6);
    // Face
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 5, oy + 4 + by, 2, 2);
    ctx.fillRect(ox + 9, oy + 4 + by, 2, 2);
    ctx.fillStyle = '#8800cc';
    ctx.fillRect(ox + 6, oy + 4 + by, 1, 2);
    ctx.fillRect(ox + 10, oy + 4 + by, 1, 2);
    // Mouth void
    ctx.fillStyle = '#000000';
    ctx.fillRect(ox + 6, oy + 7 + by, 4, 2);
}

// -- CULT ZEALOT: dark robe, white mask with X --
function drawCultZealot(ctx, ox, oy, bobbed) {
    const by = bobbed ? 1 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(ox + 3, oy + 15, 10, 1);
    // Robe (floor-length)
    ctx.fillStyle = '#1a0a2a';
    ctx.fillRect(ox + 4, oy + 5 + by, 8, 11);
    ctx.fillRect(ox + 3, oy + 8 + by, 10, 8);
    // Arms in robe
    ctx.fillStyle = '#1a0a2a';
    ctx.fillRect(ox + 1, oy + 6 + by, 3, 6);
    ctx.fillRect(ox + 12, oy + 6 + by, 3, 6);
    // Hood
    ctx.fillStyle = '#1a0a2a';
    ctx.fillRect(ox + 4, oy + 0 + by, 8, 6);
    ctx.fillRect(ox + 3, oy + 1 + by, 10, 4);
    // Mask (white circle face)
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(ox + 5, oy + 1 + by, 6, 5);
    // X pattern on mask
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(ox + 5, oy + 1 + by, 1, 1);
    ctx.fillRect(ox + 10, oy + 1 + by, 1, 1);
    ctx.fillRect(ox + 6, oy + 2 + by, 1, 1);
    ctx.fillRect(ox + 9, oy + 2 + by, 1, 1);
    ctx.fillRect(ox + 7, oy + 3 + by, 2, 1);
    ctx.fillRect(ox + 6, oy + 4 + by, 1, 1);
    ctx.fillRect(ox + 9, oy + 4 + by, 1, 1);
    ctx.fillRect(ox + 5, oy + 5 + by, 1, 1);
    ctx.fillRect(ox + 10, oy + 5 + by, 1, 1);
}

// -- BANDIT: rough humanoid, weapon visible --
function drawBandit(ctx, ox, oy, bobbed) {
    const by = bobbed ? 1 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(ox + 4, oy + 15, 8, 1);
    // Legs
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(ox + 5, oy + 12 + by, 2, 4);
    ctx.fillRect(ox + 9, oy + 12 + by, 2, 4);
    // Boots
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(ox + 5, oy + 14 + by, 2, 2);
    ctx.fillRect(ox + 9, oy + 14 + by, 2, 2);
    // Torso
    ctx.fillStyle = '#6a5a4a';
    ctx.fillRect(ox + 4, oy + 6 + by, 8, 7);
    // Leather straps
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(ox + 4, oy + 7 + by, 8, 1);
    ctx.fillRect(ox + 7, oy + 6 + by, 1, 7);
    // Arms
    ctx.fillStyle = '#7a6a5a';
    ctx.fillRect(ox + 1, oy + 7 + by, 3, 4);
    ctx.fillRect(ox + 12, oy + 7 + by, 3, 4);
    // Weapon (sword in right hand)
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(ox + 13, oy + 5 + by, 2, 7);
    ctx.fillStyle = '#8a6a3a';
    ctx.fillRect(ox + 12, oy + 9 + by, 4, 1);
    // Head
    ctx.fillStyle = '#d4a76a';
    ctx.fillRect(ox + 5, oy + 1 + by, 6, 5);
    // Bandana
    ctx.fillStyle = '#cc2200';
    ctx.fillRect(ox + 5, oy + 1 + by, 6, 2);
    // Eyes
    ctx.fillStyle = '#3a2a0a';
    ctx.fillRect(ox + 6, oy + 3 + by, 1, 1);
    ctx.fillRect(ox + 9, oy + 3 + by, 1, 1);
    // Stubble/scar
    ctx.fillStyle = '#b8855a';
    ctx.fillRect(ox + 6, oy + 5 + by, 4, 1);
}

// -- SWAMP CRAWLER: green-brown slug-like, multiple limbs --
function drawSwampCrawler(ctx, ox, oy, bobbed) {
    const by = bobbed ? 1 : 0;
    // Slime trail
    ctx.fillStyle = 'rgba(40,80,20,0.4)';
    ctx.fillRect(ox + 3, oy + 14, 10, 2);
    // Limbs (stubby)
    ctx.fillStyle = '#3a5a2a';
    ctx.fillRect(ox + 0, oy + 6 + by, 3, 2);
    ctx.fillRect(ox + 0, oy + 10 + by, 3, 2);
    ctx.fillRect(ox + 13, oy + 6 + by, 3, 2);
    ctx.fillRect(ox + 13, oy + 10 + by, 3, 2);
    ctx.fillRect(ox + 4, oy + 12 + by, 2, 3);
    ctx.fillRect(ox + 10, oy + 12 + by, 2, 3);
    // Body (slug oval)
    ctx.fillStyle = '#4a6a3a';
    ctx.fillRect(ox + 2, oy + 4 + by, 12, 10);
    ctx.fillRect(ox + 1, oy + 5 + by, 14, 8);
    // Underside
    ctx.fillStyle = '#7a9a5a';
    ctx.fillRect(ox + 3, oy + 11 + by, 10, 2);
    // Head
    ctx.fillStyle = '#5a7a4a';
    ctx.fillRect(ox + 4, oy + 2 + by, 8, 5);
    // Antennae
    ctx.fillStyle = '#3a5a2a';
    ctx.fillRect(ox + 5, oy + 0 + by, 1, 3);
    ctx.fillRect(ox + 10, oy + 0 + by, 1, 3);
    // Eyes
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(ox + 5, oy + 3 + by, 2, 2);
    ctx.fillRect(ox + 9, oy + 3 + by, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(ox + 6, oy + 3 + by, 1, 2);
    ctx.fillRect(ox + 10, oy + 3 + by, 1, 2);
}

// -- LAVA SALAMANDER: red-orange lizard, yellow underbelly --
function drawLavaSalamander(ctx, ox, oy, bobbed) {
    const by = bobbed ? 1 : 0;
    // Tail
    ctx.fillStyle = '#cc3300';
    ctx.fillRect(ox + 10, oy + 10 + by, 6, 3);
    ctx.fillRect(ox + 13, oy + 8 + by, 3, 2);
    // Legs
    ctx.fillStyle = '#aa2200';
    ctx.fillRect(ox + 2, oy + 8 + by, 2, 4);
    ctx.fillRect(ox + 5, oy + 10 + by, 2, 4);
    ctx.fillRect(ox + 8, oy + 10 + by, 2, 4);
    ctx.fillRect(ox + 11, oy + 10 + by, 2, 4);
    // Body
    ctx.fillStyle = '#dd4400';
    ctx.fillRect(ox + 2, oy + 6 + by, 12, 6);
    ctx.fillRect(ox + 1, oy + 7 + by, 14, 4);
    // Underbelly
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(ox + 3, oy + 9 + by, 8, 2);
    // Head
    ctx.fillStyle = '#ee5500';
    ctx.fillRect(ox + 1, oy + 3 + by, 8, 5);
    // Eyes
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(ox + 2, oy + 4 + by, 2, 2);
    ctx.fillRect(ox + 6, oy + 4 + by, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(ox + 3, oy + 4 + by, 1, 2);
    ctx.fillRect(ox + 7, oy + 4 + by, 1, 2);
    // Glow cracks on skin
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(ox + 4, oy + 7 + by, 6, 1);
    ctx.fillRect(ox + 3, oy + 5 + by, 1, 3);
}

// -- VOID HOUND: dark purple wolf-like, glowing eyes --
function drawVoidHound(ctx, ox, oy, bobbed) {
    const by = bobbed ? 1 : 0;
    // Shadow
    ctx.fillStyle = 'rgba(40,0,60,0.4)';
    ctx.fillRect(ox + 1, oy + 15, 14, 1);
    // Tail (raised)
    ctx.fillStyle = '#2a0a3a';
    ctx.fillRect(ox + 12, oy + 3 + by, 3, 6);
    ctx.fillRect(ox + 13, oy + 2 + by, 2, 3);
    // Legs
    ctx.fillStyle = '#2a0a3a';
    ctx.fillRect(ox + 2, oy + 9 + by, 2, 5);
    ctx.fillRect(ox + 5, oy + 10 + by, 2, 5);
    ctx.fillRect(ox + 8, oy + 10 + by, 2, 5);
    ctx.fillRect(ox + 11, oy + 9 + by, 2, 5);
    // Body
    ctx.fillStyle = '#3a0a4a';
    ctx.fillRect(ox + 2, oy + 6 + by, 12, 5);
    ctx.fillRect(ox + 1, oy + 7 + by, 14, 3);
    // Void smoke wisps
    ctx.fillStyle = 'rgba(80,0,100,0.6)';
    ctx.fillRect(ox + 0, oy + 5 + by, 2, 4);
    ctx.fillRect(ox + 14, oy + 5 + by, 2, 4);
    ctx.fillRect(ox + 4, oy + 4 + by, 2, 2);
    ctx.fillRect(ox + 10, oy + 4 + by, 2, 2);
    // Head
    ctx.fillStyle = '#4a0a5a';
    ctx.fillRect(ox + 1, oy + 3 + by, 8, 6);
    ctx.fillRect(ox + 0, oy + 4 + by, 5, 4);
    // Snout
    ctx.fillStyle = '#3a0a4a';
    ctx.fillRect(ox + 0, oy + 7 + by, 4, 3);
    // Glowing eyes
    ctx.fillStyle = '#cc00ff';
    ctx.fillRect(ox + 2, oy + 4 + by, 2, 2);
    ctx.fillRect(ox + 6, oy + 4 + by, 2, 2);
    ctx.fillStyle = '#ff44ff';
    ctx.fillRect(ox + 2, oy + 4 + by, 1, 1);
    ctx.fillRect(ox + 6, oy + 4 + by, 1, 1);
    // Teeth
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(ox + 0, oy + 9 + by, 1, 1);
    ctx.fillRect(ox + 2, oy + 9 + by, 1, 1);
}

// -- KULTIST ACOLYTE: robed, dark aura dots --
function drawKultistAcolyte(ctx, ox, oy, bobbed) {
    const by = bobbed ? 1 : 0;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(ox + 3, oy + 15, 10, 1);
    // Robe
    ctx.fillStyle = '#180820';
    ctx.fillRect(ox + 4, oy + 6 + by, 8, 10);
    ctx.fillRect(ox + 3, oy + 8 + by, 10, 8);
    // Arms
    ctx.fillStyle = '#180820';
    ctx.fillRect(ox + 1, oy + 6 + by, 3, 6);
    ctx.fillRect(ox + 12, oy + 6 + by, 3, 6);
    // Void orb in hands
    ctx.fillStyle = '#6600aa';
    ctx.fillRect(ox + 12, oy + 9 + by, 3, 3);
    ctx.fillStyle = '#cc00ff';
    ctx.fillRect(ox + 13, oy + 10 + by, 1, 1);
    // Hood
    ctx.fillStyle = '#180820';
    ctx.fillRect(ox + 4, oy + 0 + by, 8, 7);
    ctx.fillRect(ox + 3, oy + 1 + by, 10, 5);
    // Face (dark shadow inside hood)
    ctx.fillStyle = '#0a0010';
    ctx.fillRect(ox + 5, oy + 2 + by, 6, 4);
    // Glowing eyes
    ctx.fillStyle = '#aa00ee';
    ctx.fillRect(ox + 6, oy + 3 + by, 1, 1);
    ctx.fillRect(ox + 9, oy + 3 + by, 1, 1);
    // Aura dots
    ctx.fillStyle = 'rgba(100,0,180,0.5)';
    ctx.fillRect(ox + 1, oy + 3 + by, 1, 1);
    ctx.fillRect(ox + 14, oy + 5 + by, 1, 1);
    ctx.fillRect(ox + 2, oy + 10 + by, 1, 1);
    ctx.fillRect(ox + 13, oy + 12 + by, 1, 1);
    ctx.fillRect(ox + 0, oy + 7 + by, 1, 1);
}

// -- HOLLOW PROPHET BOSS: 24x24, imposing, void tendrils, crown --
function drawHollowProphet(ctx, ox, oy, bobbed) {
    const by = bobbed ? 1 : 0;
    // Void tendril aura
    ctx.fillStyle = 'rgba(60,0,100,0.4)';
    for (let i = 0; i < 8; i++) {
        const tx = ox + [0,3,6,18,21,0,20,10][i];
        const ty = oy + [5,1,0,2,6,15,15,18][i] + by;
        ctx.fillRect(tx, ty, 2 + (i % 3), 4 + (i % 4));
    }
    // Legs
    ctx.fillStyle = '#1a003a';
    ctx.fillRect(ox + 7, oy + 17 + by, 3, 7);
    ctx.fillRect(ox + 14, oy + 17 + by, 3, 7);
    // Body (wide imposing robe)
    ctx.fillStyle = '#0a0018';
    ctx.fillRect(ox + 4, oy + 9 + by, 16, 9);
    ctx.fillRect(ox + 3, oy + 10 + by, 18, 7);
    // Arms (outstretched)
    ctx.fillStyle = '#0a0018';
    ctx.fillRect(ox + 0, oy + 9 + by, 4, 5);
    ctx.fillRect(ox + 20, oy + 9 + by, 4, 5);
    // Void flame hands
    ctx.fillStyle = '#7700bb';
    ctx.fillRect(ox + 0, oy + 12 + by, 3, 3);
    ctx.fillRect(ox + 21, oy + 12 + by, 3, 3);
    ctx.fillStyle = '#cc44ff';
    ctx.fillRect(ox + 1, oy + 12 + by, 1, 2);
    ctx.fillRect(ox + 22, oy + 12 + by, 1, 2);
    // Head (large)
    ctx.fillStyle = '#1a0030';
    ctx.fillRect(ox + 6, oy + 1 + by, 12, 10);
    ctx.fillRect(ox + 5, oy + 2 + by, 14, 8);
    // Crown (jagged)
    ctx.fillStyle = '#440066';
    ctx.fillRect(ox + 6, oy + 0 + by, 2, 3);
    ctx.fillRect(ox + 10, oy + -1 + by, 2, 4);
    ctx.fillRect(ox + 14, oy + 0 + by, 2, 3);
    ctx.fillRect(ox + 18, oy + 0 + by, 2, 2);
    ctx.fillStyle = '#aa00ff';
    ctx.fillRect(ox + 11, oy + -1 + by, 2, 2); // centrepiece gem
    ctx.fillStyle = '#ff88ff';
    ctx.fillRect(ox + 11, oy + -1 + by, 1, 1);
    // Face — void hollow
    ctx.fillStyle = '#000000';
    ctx.fillRect(ox + 8, oy + 4 + by, 8, 5);
    // Glowing void eyes
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(ox + 8, oy + 5 + by, 3, 2);
    ctx.fillRect(ox + 13, oy + 5 + by, 3, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 9, oy + 5 + by, 1, 1);
    ctx.fillRect(ox + 14, oy + 5 + by, 1, 1);
    // Symbol on chest
    ctx.fillStyle = '#6600aa';
    ctx.fillRect(ox + 10, oy + 11 + by, 4, 1);
    ctx.fillRect(ox + 12, oy + 10 + by, 1, 4);
    ctx.fillStyle = '#cc00ff';
    ctx.fillRect(ox + 11, oy + 11 + by, 2, 1);
}

// ============================================================
//  NPC Portraits  32×40
// ============================================================

function generateNPCPortraits(scene) {
    const portraits = [
        { key: 'portrait_npc_scholar',       palette: RACE_PALETTE.varesh,   clothing: '#3a5a8a', hat: '#2a4a7a', desc: 'scholar'   },
        { key: 'portrait_npc_innkeeper',     palette: RACE_PALETTE.varesh,   clothing: '#8a5a3a', hat: '#6a4a2a', desc: 'innkeeper' },
        { key: 'portrait_npc_guard',         palette: RACE_PALETTE.varesh,   clothing: '#5a5a5a', hat: '#3a3a3a', desc: 'guard'     },
        { key: 'portrait_npc_merchant',      palette: RACE_PALETTE.varesh,   clothing: '#c8a830', hat: '#a88820', desc: 'merchant'  },
        { key: 'portrait_npc_elder_thornkin',palette: RACE_PALETTE.thornkin, clothing: '#2a4a1a', hat: null,      desc: 'elder'    },
        { key: 'portrait_npc_druid',         palette: RACE_PALETTE.sylveni,  clothing: '#2a6a2a', hat: '#1a4a1a', desc: 'druid'    },
        { key: 'portrait_npc_noble',         palette: RACE_PALETTE.varesh,   clothing: '#8a1a8a', hat: '#6a0a6a', desc: 'noble'    },
        { key: 'portrait_npc_warrior',       palette: RACE_PALETTE.cindrak,  clothing: '#5a5a6a', hat: '#3a3a4a', desc: 'warrior'  },
        { key: 'portrait_npc_monk',          palette: RACE_PALETTE.varesh,   clothing: '#a0a0a0', hat: '#808080', desc: 'monk'     },
    ];

    for (const p of portraits) {
        const { canvas, ctx } = SpriteFactory.createCanvas(32, 40);
        drawNPCPortrait(ctx, p.palette, p.clothing, p.hat, p.desc);
        SpriteFactory.register(scene, p.key, canvas);
    }
}

function drawNPCPortrait(ctx, palette, clothing, hat, desc) {
    // Background
    ctx.fillStyle = '#12121e';
    ctx.fillRect(0, 0, 32, 40);

    // Shoulders
    ctx.fillStyle = clothing;
    ctx.fillRect(2, 28, 28, 12);

    // Neck
    ctx.fillStyle = palette.skin;
    ctx.fillRect(13, 23, 6, 6);

    // Head
    ctx.fillStyle = palette.skin;
    ctx.fillRect(8, 9, 16, 15);

    // Hair
    ctx.fillStyle = palette.hair;
    ctx.fillRect(8, 8, 16, 5);
    ctx.fillRect(8, 13, 2, 6);
    ctx.fillRect(22, 13, 2, 6);

    // Hat if present
    if (hat) {
        ctx.fillStyle = hat;
        ctx.fillRect(6, 5, 20, 5);
        ctx.fillRect(8, 3, 16, 4);
    }

    // Eyes
    ctx.fillStyle = palette.eye;
    ctx.fillRect(11, 16, 3, 2);
    ctx.fillRect(18, 16, 3, 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(12, 16, 1, 2);
    ctx.fillRect(19, 16, 1, 2);

    // Nose
    ctx.fillStyle = palette.skinDark;
    ctx.fillRect(14, 19, 4, 2);

    // Mouth
    ctx.fillStyle = palette.skinDark;
    ctx.fillRect(12, 22, 8, 1);
    ctx.fillStyle = '#cc7766';
    ctx.fillRect(13, 22, 6, 1);

    // Special desc details
    if (desc === 'guard') {
        // Helmet visor
        ctx.fillStyle = hat || '#3a3a3a';
        ctx.fillRect(8, 9, 16, 8);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(10, 13, 12, 4);
        ctx.fillStyle = palette.skin;
        ctx.fillRect(11, 14, 10, 3);
    }
    if (desc === 'druid') {
        // Leaf crown
        ctx.fillStyle = '#2a7a1a';
        ctx.fillRect(7, 7, 18, 3);
        ctx.fillStyle = '#3a9a2a';
        ctx.fillRect(8, 5, 4, 3);
        ctx.fillRect(14, 4, 4, 4);
        ctx.fillRect(20, 5, 4, 3);
    }
    if (desc === 'elder') {
        // Bark face markings
        ctx.fillStyle = palette.skinDark;
        ctx.fillRect(8, 12, 3, 8);
        ctx.fillRect(21, 12, 3, 8);
        // Leaf sprouts from head
        ctx.fillStyle = '#3a7a1a';
        ctx.fillRect(10, 4, 3, 5);
        ctx.fillRect(19, 4, 3, 5);
        ctx.fillRect(14, 2, 4, 7);
    }
    if (desc === 'noble') {
        // Fancy collar
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8, 27, 16, 4);
        ctx.fillRect(10, 25, 12, 3);
        // Jewel
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(15, 26, 2, 2);
    }
    if (desc === 'warrior') {
        // Beard (cindrak)
        ctx.fillStyle = palette.hair;
        ctx.fillRect(9, 22, 14, 5);
        ctx.fillRect(10, 25, 12, 3);
        // Scar
        ctx.fillStyle = palette.skinDark;
        ctx.fillRect(19, 14, 1, 6);
    }
    if (desc === 'scholar') {
        // Spectacles
        ctx.fillStyle = '#8a8a5a';
        ctx.fillRect(10, 16, 5, 3);
        ctx.fillRect(17, 16, 5, 3);
        ctx.fillRect(15, 17, 2, 1);
    }
    if (desc === 'merchant') {
        // Gold earring
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(8, 18, 2, 2);
        ctx.fillRect(22, 18, 2, 2);
    }
    if (desc === 'monk') {
        // Shaved head (override hair)
        ctx.fillStyle = palette.skin;
        ctx.fillRect(8, 8, 16, 4);
        ctx.fillStyle = palette.skinDark;
        ctx.fillRect(8, 9, 16, 2);
        // Simple stripe on robe
        ctx.fillStyle = '#606060';
        ctx.fillRect(15, 28, 2, 12);
    }
    if (desc === 'innkeeper') {
        // Apron
        ctx.fillStyle = '#e8d8b8';
        ctx.fillRect(9, 28, 14, 12);
        ctx.fillRect(13, 26, 6, 4);
    }
}

// ============================================================
//  Utility
// ============================================================

export function addSheetFrames(scene, key, fw, fh, cols, rows) {
    const tex = scene.textures.get(key);
    if (!tex) return;
    tex.add('__BASE', 0, 0, 0, fw * cols, fh * rows);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            tex.add(r * cols + c, 0, c * fw, r * fh, fw, fh);
        }
    }
}
