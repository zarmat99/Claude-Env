// EffectSprites.js — Combat/magic effect sprites for particles

import { SpriteFactory } from './SpriteFactory.js';

export function generateEffectSprites(scene) {
    generateHitSpark(scene);
    generateMagicSpark(scene);
    generateHealEffect(scene);
    generateDeathEffect(scene);
    generateFireEffect(scene);
    generatePoisonEffect(scene);
    generateLevelUpEffect(scene);
    generateRootstoneEffect(scene);
    generateVoidEffect(scene);
}

// ============================================================
//  Hit Spark: 8×8, 3 frames — yellow/white burst
//  Frame 0: bright centre
//  Frame 1: expanding ring, dimmer centre
//  Frame 2: fading ring
// ============================================================

function generateHitSpark(scene) {
    // 3 frames wide, 8px tall = 24×8
    const { canvas, ctx } = SpriteFactory.createCanvas(24, 8);

    // Frame 0: bright burst
    const f0 = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(f0 + 3, 3, 2, 2);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(f0 + 2, 2, 4, 4);
    ctx.fillRect(f0 + 1, 3, 6, 2);
    ctx.fillRect(f0 + 3, 1, 2, 6);
    ctx.fillStyle = '#ff9900';
    ctx.fillRect(f0 + 0, 3, 2, 2);
    ctx.fillRect(f0 + 6, 3, 2, 2);
    ctx.fillRect(f0 + 3, 0, 2, 2);
    ctx.fillRect(f0 + 3, 6, 2, 2);
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(f0 + 1, 1, 1, 1);
    ctx.fillRect(f0 + 6, 1, 1, 1);
    ctx.fillRect(f0 + 1, 6, 1, 1);
    ctx.fillRect(f0 + 6, 6, 1, 1);

    // Frame 1: expanding ring
    const f1 = 8;
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(f1 + 0, 3, 2, 2);
    ctx.fillRect(f1 + 6, 3, 2, 2);
    ctx.fillRect(f1 + 3, 0, 2, 2);
    ctx.fillRect(f1 + 3, 6, 2, 2);
    ctx.fillRect(f1 + 1, 1, 2, 2);
    ctx.fillRect(f1 + 5, 1, 2, 2);
    ctx.fillRect(f1 + 1, 5, 2, 2);
    ctx.fillRect(f1 + 5, 5, 2, 2);
    ctx.fillStyle = '#ff9900';
    ctx.fillRect(f1 + 3, 3, 2, 2); // dim centre
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(f1 + 0, 0, 1, 1);
    ctx.fillRect(f1 + 7, 0, 1, 1);
    ctx.fillRect(f1 + 0, 7, 1, 1);
    ctx.fillRect(f1 + 7, 7, 1, 1);

    // Frame 2: fading ring
    const f2 = 16;
    ctx.fillStyle = 'rgba(255,180,0,0.7)';
    ctx.fillRect(f2 + 0, 3, 1, 2);
    ctx.fillRect(f2 + 7, 3, 1, 2);
    ctx.fillRect(f2 + 3, 0, 2, 1);
    ctx.fillRect(f2 + 3, 7, 2, 1);
    ctx.fillStyle = 'rgba(255,100,0,0.5)';
    ctx.fillRect(f2 + 1, 1, 1, 1);
    ctx.fillRect(f2 + 6, 1, 1, 1);
    ctx.fillRect(f2 + 1, 6, 1, 1);
    ctx.fillRect(f2 + 6, 6, 1, 1);

    SpriteFactory.register(scene, 'effect_hit_spark', canvas);
    addEffectFrames(scene, 'effect_hit_spark', 8, 8, 3);
}

// ============================================================
//  Magic Spark: 8×8, 3 frames — teal/blue burst
// ============================================================

function generateMagicSpark(scene) {
    const { canvas, ctx } = SpriteFactory.createCanvas(24, 8);

    // Frame 0
    const f0 = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(f0 + 3, 3, 2, 2);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(f0 + 2, 2, 4, 4);
    ctx.fillRect(f0 + 1, 3, 6, 2);
    ctx.fillRect(f0 + 3, 1, 2, 6);
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(f0 + 0, 3, 2, 2);
    ctx.fillRect(f0 + 6, 3, 2, 2);
    ctx.fillRect(f0 + 3, 0, 2, 2);
    ctx.fillRect(f0 + 3, 6, 2, 2);
    ctx.fillStyle = '#6644ff';
    ctx.fillRect(f0 + 1, 1, 1, 1);
    ctx.fillRect(f0 + 6, 1, 1, 1);
    ctx.fillRect(f0 + 1, 6, 1, 1);
    ctx.fillRect(f0 + 6, 6, 1, 1);

    // Frame 1
    const f1 = 8;
    ctx.fillStyle = '#00ccff';
    ctx.fillRect(f1 + 0, 3, 2, 2);
    ctx.fillRect(f1 + 6, 3, 2, 2);
    ctx.fillRect(f1 + 3, 0, 2, 2);
    ctx.fillRect(f1 + 3, 6, 2, 2);
    ctx.fillRect(f1 + 1, 1, 2, 2);
    ctx.fillRect(f1 + 5, 1, 2, 2);
    ctx.fillRect(f1 + 1, 5, 2, 2);
    ctx.fillRect(f1 + 5, 5, 2, 2);
    ctx.fillStyle = '#4466ff';
    ctx.fillRect(f1 + 3, 3, 2, 2);
    ctx.fillStyle = '#aaeeff';
    ctx.fillRect(f1 + 0, 0, 1, 1);
    ctx.fillRect(f1 + 7, 0, 1, 1);
    ctx.fillRect(f1 + 0, 7, 1, 1);
    ctx.fillRect(f1 + 7, 7, 1, 1);

    // Frame 2
    const f2 = 16;
    ctx.fillStyle = 'rgba(0,180,255,0.6)';
    ctx.fillRect(f2 + 0, 3, 1, 2);
    ctx.fillRect(f2 + 7, 3, 1, 2);
    ctx.fillRect(f2 + 3, 0, 2, 1);
    ctx.fillRect(f2 + 3, 7, 2, 1);
    ctx.fillStyle = 'rgba(80,80,255,0.4)';
    ctx.fillRect(f2 + 1, 1, 1, 1);
    ctx.fillRect(f2 + 6, 1, 1, 1);
    ctx.fillRect(f2 + 1, 6, 1, 1);
    ctx.fillRect(f2 + 6, 6, 1, 1);

    SpriteFactory.register(scene, 'effect_magic_spark', canvas);
    addEffectFrames(scene, 'effect_magic_spark', 8, 8, 3);
}

// ============================================================
//  Heal Effect: 8×8, 3 frames — green growing circle
// ============================================================

function generateHealEffect(scene) {
    const { canvas, ctx } = SpriteFactory.createCanvas(24, 8);

    // Frame 0: small green plus
    const f0 = 0;
    ctx.fillStyle = '#00ff44';
    ctx.fillRect(f0 + 3, 2, 2, 4);
    ctx.fillRect(f0 + 2, 3, 4, 2);
    ctx.fillStyle = '#88ff88';
    ctx.fillRect(f0 + 3, 3, 2, 2);

    // Frame 1: expanding circle + cross
    const f1 = 8;
    ctx.fillStyle = '#00cc44';
    ctx.fillRect(f1 + 2, 0, 4, 2);
    ctx.fillRect(f1 + 2, 6, 4, 2);
    ctx.fillRect(f1 + 0, 2, 2, 4);
    ctx.fillRect(f1 + 6, 2, 2, 4);
    ctx.fillStyle = '#00ff66';
    ctx.fillRect(f1 + 3, 2, 2, 4);
    ctx.fillRect(f1 + 2, 3, 4, 2);
    ctx.fillStyle = '#aaffaa';
    ctx.fillRect(f1 + 3, 3, 2, 2);

    // Frame 2: large fading ring
    const f2 = 16;
    ctx.fillStyle = 'rgba(0,180,50,0.5)';
    ctx.fillRect(f2 + 0, 3, 2, 2);
    ctx.fillRect(f2 + 6, 3, 2, 2);
    ctx.fillRect(f2 + 3, 0, 2, 2);
    ctx.fillRect(f2 + 3, 6, 2, 2);
    ctx.fillRect(f2 + 1, 1, 2, 2);
    ctx.fillRect(f2 + 5, 1, 2, 2);
    ctx.fillRect(f2 + 1, 5, 2, 2);
    ctx.fillRect(f2 + 5, 5, 2, 2);

    SpriteFactory.register(scene, 'effect_heal', canvas);
    addEffectFrames(scene, 'effect_heal', 8, 8, 3);
}

// ============================================================
//  Death Effect: 12×12, 4 frames — grey smoke puff
// ============================================================

function generateDeathEffect(scene) {
    const { canvas, ctx } = SpriteFactory.createCanvas(48, 12);

    const frames = [0, 12, 24, 36];
    const alphas = [0.9, 0.7, 0.5, 0.2];
    const sizes  = [3, 5, 7, 9];

    for (let fi = 0; fi < 4; fi++) {
        const fx = frames[fi];
        const a  = alphas[fi];
        const s  = sizes[fi];
        const cx = 6;
        const cy = 6;

        // Multiple smoke blobs
        ctx.fillStyle = `rgba(150,150,150,${a})`;
        ctx.fillRect(fx + cx - s / 2, cy - s / 2, s, s);
        ctx.fillRect(fx + cx - s / 4, cy - s * 0.7, s * 0.7, s * 0.7);
        ctx.fillRect(fx + cx + s * 0.2, cy - s * 0.5, s * 0.6, s * 0.6);

        ctx.fillStyle = `rgba(180,180,180,${a * 0.6})`;
        ctx.fillRect(fx + cx - s, cy, s, s * 0.8);
        ctx.fillRect(fx + cx + s * 0.3, cy + s * 0.1, s * 0.8, s * 0.8);

        ctx.fillStyle = `rgba(220,220,220,${a * 0.4})`;
        ctx.fillRect(fx + cx - s * 0.3, cy - s * 0.9, s * 0.5, s * 0.5);
    }

    SpriteFactory.register(scene, 'effect_death', canvas);
    addEffectFrames(scene, 'effect_death', 12, 12, 4);
}

// ============================================================
//  Fire Particle: 6×8, 4 frames — orange flame
// ============================================================

function generateFireEffect(scene) {
    const { canvas, ctx } = SpriteFactory.createCanvas(24, 8);

    // Draw 4 flame frames evolving upward
    for (let fi = 0; fi < 4; fi++) {
        const fx = fi * 6;
        const shift = fi; // flame tip shifts left/right

        // Base
        ctx.fillStyle = '#cc3300';
        ctx.fillRect(fx + 1, 5, 4, 3);
        ctx.fillRect(fx, 6, 6, 2);
        // Mid
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(fx + 1, 3, 4, 4);
        ctx.fillRect(fx + 0 + (shift % 2), 4, 5, 3);
        // Upper
        ctx.fillStyle = '#ff9900';
        ctx.fillRect(fx + 1 + (shift % 2), 1, 3, 4);
        ctx.fillRect(fx + 2, 0, 2, 3);
        // Tip
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(fx + 2 + (fi % 2 === 0 ? 0 : 1), 0, 1, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fx + 2, 0, 1, 1);
    }

    SpriteFactory.register(scene, 'effect_fire', canvas);
    addEffectFrames(scene, 'effect_fire', 6, 8, 4);
}

// ============================================================
//  Poison Drip: 6×6, 3 frames — purple drops
// ============================================================

function generatePoisonEffect(scene) {
    const { canvas, ctx } = SpriteFactory.createCanvas(18, 6);

    // Frame 0: small drop
    ctx.fillStyle = '#8822aa';
    ctx.fillRect(2, 3, 2, 3);
    ctx.fillRect(1, 4, 4, 2);
    ctx.fillStyle = '#cc44dd';
    ctx.fillRect(2, 0, 2, 4);
    ctx.fillRect(1, 1, 4, 2);
    ctx.fillStyle = '#ee88ff';
    ctx.fillRect(2, 1, 1, 1);

    // Frame 1: mid drop
    const f1 = 6;
    ctx.fillStyle = '#6611aa';
    ctx.fillRect(f1 + 2, 4, 2, 2);
    ctx.fillRect(f1 + 1, 5, 4, 1);
    ctx.fillStyle = '#aa33cc';
    ctx.fillRect(f1 + 2, 1, 2, 4);
    ctx.fillRect(f1 + 1, 2, 4, 3);
    ctx.fillStyle = '#dd77ff';
    ctx.fillRect(f1 + 2, 1, 1, 2);

    // Frame 2: splash
    const f2 = 12;
    ctx.fillStyle = 'rgba(120,30,160,0.5)';
    ctx.fillRect(f2 + 0, 3, 2, 2);
    ctx.fillRect(f2 + 4, 3, 2, 2);
    ctx.fillStyle = 'rgba(180,60,220,0.6)';
    ctx.fillRect(f2 + 1, 4, 4, 2);
    ctx.fillRect(f2 + 2, 3, 2, 3);

    SpriteFactory.register(scene, 'effect_poison', canvas);
    addEffectFrames(scene, 'effect_poison', 6, 6, 3);
}

// ============================================================
//  Level Up Effect: 16×16, 4 frames — golden glow ring
// ============================================================

function generateLevelUpEffect(scene) {
    const { canvas, ctx } = SpriteFactory.createCanvas(64, 16);

    const colors = ['#ffcc00', '#ffaa00', '#ff8800', 'rgba(255,180,0,0.3)'];
    const rings  = [3, 5, 7, 9];

    for (let fi = 0; fi < 4; fi++) {
        const fx = fi * 16;
        const r  = rings[fi];
        const c  = colors[fi];

        ctx.fillStyle = c;
        // Ring of squares
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            const px = Math.round(8 + r * Math.cos(angle));
            const py = Math.round(8 + r * Math.sin(angle));
            ctx.fillRect(fx + px, py, 2, 2);
        }

        if (fi === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(fx + 7, 7, 2, 2);
        }
    }

    SpriteFactory.register(scene, 'effect_level_up', canvas);
    addEffectFrames(scene, 'effect_level_up', 16, 16, 4);
}

// ============================================================
//  Rootstone Effect: 8×8, 3 frames — teal vein pulse
// ============================================================

function generateRootstoneEffect(scene) {
    const { canvas, ctx } = SpriteFactory.createCanvas(24, 8);

    // Frame 0: small teal cross
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(3, 1, 2, 6);
    ctx.fillRect(1, 3, 6, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 3, 2, 2);

    // Frame 1: expanding
    const f1 = 8;
    ctx.fillStyle = '#00ccaa';
    ctx.fillRect(f1 + 3, 0, 2, 8);
    ctx.fillRect(f1 + 0, 3, 8, 2);
    ctx.fillRect(f1 + 1, 1, 1, 1);
    ctx.fillRect(f1 + 6, 1, 1, 1);
    ctx.fillRect(f1 + 1, 6, 1, 1);
    ctx.fillRect(f1 + 6, 6, 1, 1);
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(f1 + 3, 3, 2, 2);

    // Frame 2: fading
    const f2 = 16;
    ctx.fillStyle = 'rgba(0,180,150,0.4)';
    ctx.fillRect(f2 + 3, 0, 2, 8);
    ctx.fillRect(f2 + 0, 3, 8, 2);
    ctx.fillRect(f2 + 0, 0, 2, 2);
    ctx.fillRect(f2 + 6, 0, 2, 2);
    ctx.fillRect(f2 + 0, 6, 2, 2);
    ctx.fillRect(f2 + 6, 6, 2, 2);

    SpriteFactory.register(scene, 'effect_rootstone', canvas);
    addEffectFrames(scene, 'effect_rootstone', 8, 8, 3);
}

// ============================================================
//  Void Effect: 8×8, 3 frames — dark purple implode
// ============================================================

function generateVoidEffect(scene) {
    const { canvas, ctx } = SpriteFactory.createCanvas(24, 8);

    // Frame 0: spreading void points
    ctx.fillStyle = '#cc00ff';
    ctx.fillRect(0, 3, 2, 2);
    ctx.fillRect(6, 3, 2, 2);
    ctx.fillRect(3, 0, 2, 2);
    ctx.fillRect(3, 6, 2, 2);
    ctx.fillStyle = '#440066';
    ctx.fillRect(1, 1, 1, 1);
    ctx.fillRect(6, 1, 1, 1);
    ctx.fillRect(1, 6, 1, 1);
    ctx.fillRect(6, 6, 1, 1);

    // Frame 1: contracting
    const f1 = 8;
    ctx.fillStyle = '#8800cc';
    ctx.fillRect(f1 + 1, 3, 2, 2);
    ctx.fillRect(f1 + 5, 3, 2, 2);
    ctx.fillRect(f1 + 3, 1, 2, 2);
    ctx.fillRect(f1 + 3, 5, 2, 2);
    ctx.fillStyle = '#440066';
    ctx.fillRect(f1 + 2, 2, 4, 4);
    ctx.fillStyle = '#cc00ff';
    ctx.fillRect(f1 + 3, 3, 2, 2);

    // Frame 2: collapse to centre
    const f2 = 16;
    ctx.fillStyle = '#660099';
    ctx.fillRect(f2 + 2, 2, 4, 4);
    ctx.fillStyle = '#9900cc';
    ctx.fillRect(f2 + 3, 3, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(f2 + 3, 3, 1, 1);

    SpriteFactory.register(scene, 'effect_void', canvas);
    addEffectFrames(scene, 'effect_void', 8, 8, 3);
}

// ============================================================
//  Utility
// ============================================================

function addEffectFrames(scene, key, fw, fh, frames) {
    const tex = scene.textures.get(key);
    if (!tex) return;
    tex.add('__BASE', 0, 0, 0, fw * frames, fh);
    for (let i = 0; i < frames; i++) {
        tex.add(i, 0, i * fw, 0, fw, fh);
    }
}
