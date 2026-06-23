// PlayerSprite.js — Player sprite sheets for all 5 races
// Layout: 5 frames wide × 4 directions tall = 80×64 px per sheet

import { SpriteFactory } from './SpriteFactory.js';
import { RACE_PALETTE } from '../data/races.js';

const FRAME_W = 16;
const FRAME_H = 16;
const DIRS    = 4;  // 0=down, 1=up, 2=left, 3=right
const FRAMES  = 5;  // 0=idle, 1-4=walk cycle

export function generatePlayerSprites(scene) {
    const races = ['varesh', 'cindrak', 'sylveni', 'vorrkai', 'thornkin'];

    for (const race of races) {
        if (scene.textures.exists(`player_${race}`)) continue;
        const { canvas, ctx } = SpriteFactory.createCanvas(FRAME_W * FRAMES, FRAME_H * DIRS);
        const palette = RACE_PALETTE[race];

        drawPlayerSheet(ctx, palette, race);
        SpriteFactory.register(scene, `player_${race}`, canvas);

        const tex = scene.textures.get(`player_${race}`);
        tex.add('__BASE', 0, 0, 0, FRAME_W * FRAMES, FRAME_H * DIRS);

        for (let dir = 0; dir < DIRS; dir++) {
            for (let frame = 0; frame < FRAMES; frame++) {
                tex.add(
                    dir * FRAMES + frame, 0,
                    frame * FRAME_W, dir * FRAME_H,
                    FRAME_W, FRAME_H
                );
            }
        }
    }

    generateRacePortraits(scene);
}

// ============================================================
//  Sheet drawing
// ============================================================

function drawPlayerSheet(ctx, palette, race) {
    for (let dir = 0; dir < DIRS; dir++) {
        for (let frame = 0; frame < FRAMES; frame++) {
            drawPlayerFrame(ctx, palette, race, dir, frame, frame * FRAME_W, dir * FRAME_H);
        }
    }
}

function drawPlayerFrame(ctx, palette, race, dir, frame, ox, oy) {
    // Clear slot
    ctx.clearRect(ox, oy, FRAME_W, FRAME_H);

    // Walk offsets
    const walkBob   = (frame === 1 || frame === 3) ? 1 : 0;
    const legSwing  = frame; // 0=idle,1=Lforward,2=center,3=Rforward,4=center

    // === Body proportions ===
    const isStocky = (race === 'cindrak');
    const bodyTop  = isStocky ? 5 : 4;
    const bodyH    = isStocky ? 8 : 7;
    const bodyW    = isStocky ? 6 : 5;
    const bodyX    = ox + 5;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(ox + 5, oy + 15, 6, 1);

    // -- Legs --
    drawLegs(ctx, palette, ox, oy, legSwing, isStocky, walkBob);

    // -- Torso --
    ctx.fillStyle = palette.cloth;
    ctx.fillRect(bodyX, oy + bodyTop + walkBob, bodyW, bodyH);

    // -- Arms --
    drawArms(ctx, palette, ox, oy, dir, frame, bodyTop, bodyW, bodyX, walkBob, race);

    // -- Head --
    drawHead(ctx, palette, race, dir, ox, oy, walkBob);

    // -- Race-specific details --
    if (race === 'vorrkai') {
        // Glowing eyes
        ctx.fillStyle = palette.eye;
        if (dir === 0) {
            ctx.fillRect(ox + 6, oy + 3 + walkBob, 1, 1);
            ctx.fillRect(ox + 9, oy + 3 + walkBob, 1, 1);
        }
    }
    if (race === 'thornkin') {
        // Bark texture lines on torso
        ctx.fillStyle = palette.skinDark;
        ctx.fillRect(bodyX + 1, oy + bodyTop + 1 + walkBob, 1, bodyH - 2);
        ctx.fillRect(bodyX + 3, oy + bodyTop + 2 + walkBob, 1, bodyH - 3);
        // Leaf on head (top only visible from down)
        if (dir === 0 || dir === 2 || dir === 3) {
            ctx.fillStyle = '#3a8a1a';
            ctx.fillRect(ox + 6, oy + 1 + walkBob, 4, 1);
        }
    }
    if (race === 'sylveni') {
        // Slightly taller, silver hair
        ctx.fillStyle = palette.hair;
        if (dir === 0) {
            ctx.fillRect(ox + 5, oy + 1 + walkBob, 6, 2);
        } else if (dir === 1) {
            ctx.fillRect(ox + 5, oy + 1 + walkBob, 6, 1);
        }
    }
}

function drawHead(ctx, palette, race, dir, ox, oy, walkBob) {
    const headX = ox + 5;
    const headY = oy + 1 + walkBob;
    const headW = 6;
    const headH = 5;

    // Head
    ctx.fillStyle = palette.skin;
    ctx.fillRect(headX, headY, headW, headH);

    // Hair
    ctx.fillStyle = palette.hair;
    ctx.fillRect(headX, headY, headW, 2); // hair top
    if (dir !== 1) { // sides visible unless facing away
        ctx.fillRect(headX, headY + 2, 1, 3);
        ctx.fillRect(headX + headW - 1, headY + 2, 1, 3);
    }

    // Eyes (visible when facing down/sides)
    if (dir === 0) {
        ctx.fillStyle = palette.eye;
        ctx.fillRect(headX + 1, headY + 2, 1, 1);
        ctx.fillRect(headX + 4, headY + 2, 1, 1);
    } else if (dir === 2) {
        ctx.fillStyle = palette.eye;
        ctx.fillRect(headX, headY + 2, 1, 1);
    } else if (dir === 3) {
        ctx.fillStyle = palette.eye;
        ctx.fillRect(headX + headW - 1, headY + 2, 1, 1);
    }

    // Nose hint (down-facing)
    if (dir === 0) {
        ctx.fillStyle = palette.skinDark;
        ctx.fillRect(headX + 2, headY + 3, 2, 1);
    }
}

function drawLegs(ctx, palette, ox, oy, legSwing, isStocky, walkBob) {
    const legY   = oy + 13 + walkBob;
    const legH   = 3;
    const legCol = palette.cloth;
    const bootCol = palette.skinDark;

    // Left leg
    let lly = legY;
    let rly = legY;
    if (legSwing === 1) { lly -= 1; } // L forward
    if (legSwing === 3) { rly -= 1; } // R forward

    // Left leg
    ctx.fillStyle = legCol;
    ctx.fillRect(ox + 5, lly, 2, legH);
    ctx.fillStyle = bootCol;
    ctx.fillRect(ox + 5, lly + legH - 1, 2, 1);

    // Right leg
    ctx.fillStyle = legCol;
    ctx.fillRect(ox + 8, rly, 2, legH);
    ctx.fillStyle = bootCol;
    ctx.fillRect(ox + 8, rly + legH - 1, 2, 1);
}

function drawArms(ctx, palette, ox, oy, dir, frame, bodyTop, bodyW, bodyX, walkBob, race) {
    const armY = oy + bodyTop + 1 + walkBob;
    const armH = 4;

    // Arm swing: opposite to legs
    const lSwing = (frame === 1 || frame === 3) ? 0 : 0; // keep simple
    const weaponColor = '#8a8a8a'; // metallic

    // Left arm
    ctx.fillStyle = palette.skin;
    ctx.fillRect(bodyX - 2, armY, 2, armH);

    // Right arm (weapon-side)
    ctx.fillStyle = palette.skin;
    ctx.fillRect(bodyX + bodyW, armY, 2, armH);

    // Simple weapon stub on right arm for down-facing
    if (dir === 0 || dir === 3) {
        ctx.fillStyle = weaponColor;
        ctx.fillRect(bodyX + bodyW + 1, armY + armH - 1, 1, 3);
    }
}

// ============================================================
//  Race portraits  32×40
// ============================================================

function generateRacePortraits(scene) {
    const races = ['varesh', 'cindrak', 'sylveni', 'vorrkai', 'thornkin'];
    for (const race of races) {
        const { canvas, ctx } = SpriteFactory.createCanvas(32, 40);
        const palette = RACE_PALETTE[race];
        drawRacePortrait(ctx, palette, race);
        SpriteFactory.register(scene, `portrait_race_${race}`, canvas);
    }
}

function drawRacePortrait(ctx, palette, race) {
    // Background
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(0, 0, 32, 40);

    // Shoulders / body
    ctx.fillStyle = palette.cloth;
    ctx.fillRect(4, 26, 24, 14);

    // Neck
    ctx.fillStyle = palette.skin;
    ctx.fillRect(13, 22, 6, 5);

    // Head
    ctx.fillStyle = palette.skin;
    ctx.fillRect(8, 8, 16, 16);

    // Hair
    ctx.fillStyle = palette.hair;
    ctx.fillRect(8, 7, 16, 5);
    ctx.fillRect(8, 12, 2, 6);
    ctx.fillRect(22, 12, 2, 6);

    // Eyes
    ctx.fillStyle = palette.eye;
    ctx.fillRect(11, 15, 3, 2);
    ctx.fillRect(18, 15, 3, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(12, 15, 1, 2);
    ctx.fillRect(19, 15, 1, 2);

    // Eyebrows
    ctx.fillStyle = palette.hair;
    ctx.fillRect(11, 13, 3, 1);
    ctx.fillRect(18, 13, 3, 1);

    // Nose
    ctx.fillStyle = palette.skinDark;
    ctx.fillRect(14, 18, 4, 2);

    // Mouth
    ctx.fillStyle = palette.skinDark;
    ctx.fillRect(12, 21, 8, 1);
    ctx.fillStyle = '#cc7766';
    ctx.fillRect(13, 21, 6, 1);

    // Race-specific portrait details
    if (race === 'vorrkai') {
        // Glowing eye highlight
        ctx.fillStyle = palette.eye;
        ctx.fillRect(10, 14, 5, 4);
        ctx.fillRect(17, 14, 5, 4);
        ctx.fillStyle = '#00ddff';
        ctx.fillRect(11, 15, 3, 2);
        ctx.fillRect(18, 15, 3, 2);
        // Dark blue skin tone
        ctx.fillStyle = palette.skinDark;
        ctx.fillRect(8, 8, 2, 16);
        ctx.fillRect(22, 8, 2, 16);
    }

    if (race === 'thornkin') {
        // Bark texture on cheeks
        ctx.fillStyle = palette.skinDark;
        ctx.fillRect(8, 12, 3, 2);
        ctx.fillRect(21, 12, 3, 2);
        ctx.fillRect(9, 16, 2, 4);
        ctx.fillRect(21, 16, 2, 4);
        // Leaf crown
        ctx.fillStyle = '#3a8a1a';
        ctx.fillRect(7, 5, 4, 3);
        ctx.fillRect(13, 3, 6, 4);
        ctx.fillRect(21, 5, 4, 3);
        ctx.fillStyle = '#2a6a0a';
        ctx.fillRect(8, 6, 2, 2);
        ctx.fillRect(22, 6, 2, 2);
        ctx.fillRect(14, 4, 4, 2);
    }

    if (race === 'sylveni') {
        // Silver/white long hair
        ctx.fillStyle = palette.hair;
        ctx.fillRect(8, 7, 16, 7);
        ctx.fillRect(6, 14, 3, 10);
        ctx.fillRect(23, 14, 3, 10);
        // Pointed ear hints
        ctx.fillStyle = palette.skin;
        ctx.fillRect(6, 12, 3, 4);
        ctx.fillRect(23, 12, 3, 4);
        ctx.fillStyle = palette.skinDark;
        ctx.fillRect(6, 12, 1, 1);
        ctx.fillRect(25, 12, 1, 1);
    }

    if (race === 'cindrak') {
        // Stockier, shorter — shift head down, wider
        ctx.fillStyle = palette.skin;
        ctx.fillRect(7, 10, 18, 14);
        ctx.fillStyle = palette.hair;
        ctx.fillRect(7, 10, 18, 4);
        // Beard
        ctx.fillStyle = palette.hair;
        ctx.fillRect(8, 22, 16, 4);
        ctx.fillRect(9, 24, 14, 3);
        // Forge soot marks
        ctx.fillStyle = '#2a1a0a';
        ctx.fillRect(8, 18, 2, 2);
        ctx.fillRect(19, 17, 2, 2);
    }

    if (race === 'varesh') {
        // Strong brow
        ctx.fillStyle = palette.hair;
        ctx.fillRect(10, 13, 4, 1);
        ctx.fillRect(18, 13, 4, 1);
    }
}
