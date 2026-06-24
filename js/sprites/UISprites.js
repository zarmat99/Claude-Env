// UISprites.js — UI chrome elements

import { SpriteFactory } from './SpriteFactory.js';

export function generateUISprites(scene) {
    generatePanel(scene, 'ui_panel',          200, 150);
    generatePanel(scene, 'ui_panel_small',    120, 80);
    generatePanel(scene, 'ui_panel_dialogue', 600, 120);

    generateOrb(scene, 'ui_orb_health',  40, '#cc2222', '#880000');
    generateOrb(scene, 'ui_orb_mana',    40, '#2244cc', '#001488');
    generateOrb(scene, 'ui_orb_stamina', 40, '#22aa44', '#006622');

    generateButton(scene, 'ui_button',       80, 24);
    generateButton(scene, 'ui_button_hover', 80, 24, true);

    generateItemSlot(scene, 'ui_item_slot',       14);
    generateItemSlot(scene, 'ui_item_slot_hover', 14, true);
    generateItemSlot(scene, 'ui_equip_slot',      20);
    generateItemSlot(scene, 'ui_equip_slot_hover',20, true);

    generateCursor(scene);
    generateXPBar(scene);
    generateMinimapBorder(scene);
    generateHealthBar(scene);
    generateTooltip(scene);
    generateDialoguePortraitFrame(scene);
}

// ============================================================
//  Panel: dark bg, 1px border, subtle inner glow
// ============================================================

function generatePanel(scene, key, w, h) {
    const { canvas, ctx } = SpriteFactory.createCanvas(w, h);

    // Base fill
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, w, h);

    // Border (1px)
    ctx.strokeStyle = '#3a3a6a';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

    // Inner glow top-left (1px offset)
    ctx.fillStyle = 'rgba(80,80,160,0.15)';
    ctx.fillRect(1, 1, w - 2, 3);
    ctx.fillRect(1, 1, 3, h - 2);

    // Corner highlights
    ctx.fillStyle = '#5a5a9a';
    ctx.fillRect(0, 0, 2, 2);
    ctx.fillRect(w - 2, 0, 2, 2);
    ctx.fillRect(0, h - 2, 2, 2);
    ctx.fillRect(w - 2, h - 2, 2, 2);

    // Subtle inner border
    ctx.strokeStyle = 'rgba(60,60,120,0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(2.5, 2.5, w - 5, h - 5);

    SpriteFactory.register(scene, key, canvas);
}

// ============================================================
//  Orb: concentric circles simulating radial gradient
// ============================================================

function generateOrb(scene, key, size, colorBright, colorDark) {
    const { canvas, ctx } = SpriteFactory.createCanvas(size, size);
    const cx = size / 2;
    const cy = size / 2;
    const r  = size / 2;

    // Layered rings from outside in (brightest)
    const steps = 8;
    for (let i = steps; i >= 0; i--) {
        const t    = i / steps;
        const rad  = r * (i / steps);
        const col  = lerpColor(colorDark, colorBright, 1 - t);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
    }

    // Specular highlight (top-left)
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.25, cy - r * 0.3, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.25, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Rim shadow (bottom-right)
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.arc(cx + r * 0.2, cy + r * 0.2, r * 0.45, 0, Math.PI * 2);
    ctx.fill();

    SpriteFactory.register(scene, key, canvas);
}

// ============================================================
//  Button: bevelled rect
// ============================================================

function generateButton(scene, key, w, h, hovered = false) {
    const { canvas, ctx } = SpriteFactory.createCanvas(w, h);

    const base   = hovered ? '#2a2a5a' : '#1a1a3a';
    const topEdge  = hovered ? '#5a5a9a' : '#3a3a6a';
    const botEdge  = hovered ? '#0a0a2a' : '#0a0a1a';
    const textEdge = hovered ? '#7a7aaa' : '#5a5a8a';

    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // Top bevel
    ctx.fillStyle = topEdge;
    ctx.fillRect(0, 0, w, 2);
    ctx.fillRect(0, 0, 2, h);

    // Bottom bevel
    ctx.fillStyle = botEdge;
    ctx.fillRect(0, h - 2, w, 2);
    ctx.fillRect(w - 2, 0, 2, h);

    // Text face line
    ctx.fillStyle = textEdge;
    ctx.fillRect(1, 1, w - 2, 1);
    ctx.fillRect(1, 1, 1, h - 2);

    if (hovered) {
        ctx.fillStyle = 'rgba(100,100,200,0.1)';
        ctx.fillRect(2, 2, w - 4, h - 4);
    }

    SpriteFactory.register(scene, key, canvas);
}

// ============================================================
//  Item slot: dark recessed square
// ============================================================

function generateItemSlot(scene, key, size, hovered = false) {
    const { canvas, ctx } = SpriteFactory.createCanvas(size, size);

    ctx.fillStyle = hovered ? '#181828' : '#0a0a1a';
    ctx.fillRect(0, 0, size, size);

    // Inset shadow (top + left)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, 1);
    ctx.fillRect(0, 0, 1, size);

    // Inset highlight (bottom + right)
    ctx.fillStyle = hovered ? '#3a3a6a' : '#1a1a3a';
    ctx.fillRect(0, size - 1, size, 1);
    ctx.fillRect(size - 1, 0, 1, size);

    if (hovered) {
        ctx.fillStyle = 'rgba(80,80,200,0.15)';
        ctx.fillRect(1, 1, size - 2, size - 2);
    }

    SpriteFactory.register(scene, key, canvas);
}

// ============================================================
//  Cursor / Pointer
// ============================================================

function generateCursor(scene) {
    const { canvas, ctx } = SpriteFactory.createCanvas(12, 16);

    // Arrow cursor pixel art
    // Black outline
    const bk = '#000000';
    const wh = '#ffffff';
    const rows = [
        [1],
        [1,1],
        [1,'w',1],
        [1,'w','w',1],
        [1,'w','w','w',1],
        [1,'w','w','w','w',1],
        [1,'w','w','w','w','w',1],
        [1,'w','w','w','w','w','w',1],
        [1,'w','w','w','w','w','w','w',1],
        [1,'w','w','w','w','w',1,1,1],
        [1,'w','w',1,'w','w',1],
        [1,'w',1,0,1,'w','w',1],
        [1,1,0,0,0,1,'w','w',1],
        [0,0,0,0,0,0,1,'w',1],
        [0,0,0,0,0,0,0,1,1],
        [0,0,0,0,0,0,0,0,0],
    ];

    for (let y = 0; y < rows.length; y++) {
        for (let x = 0; x < rows[y].length; x++) {
            const v = rows[y][x];
            if (v === 1) { ctx.fillStyle = bk; ctx.fillRect(x, y, 1, 1); }
            else if (v === 'w') { ctx.fillStyle = wh; ctx.fillRect(x, y, 1, 1); }
        }
    }

    SpriteFactory.register(scene, 'ui_cursor', canvas);
}

// ============================================================
//  XP Bar fill: 100×6 gradient
// ============================================================

function generateXPBar(scene) {
    const { canvas, ctx } = SpriteFactory.createCanvas(100, 6);

    // Teal-to-gold gradient simulated in steps
    for (let x = 0; x < 100; x++) {
        const t = x / 99;
        const r = Math.round(0  + t * 220);
        const g = Math.round(200 + t * 30);
        const b = Math.round(200 - t * 170);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, 0, 1, 6);
    }

    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(0, 0, 100, 2);

    // Bottom shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 4, 100, 2);

    SpriteFactory.register(scene, 'ui_xp_bar', canvas);
}

// ============================================================
//  Minimap border: 82×82 frame
// ============================================================

function generateMinimapBorder(scene) {
    const size = 82;
    const { canvas, ctx } = SpriteFactory.createCanvas(size, size);

    // Outer frame
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#3a3a6a';
    ctx.fillRect(1, 1, size - 2, size - 2);
    // Inner transparent area
    ctx.clearRect(3, 3, size - 6, size - 6);
    // Corners
    ctx.fillStyle = '#6a6aaa';
    ctx.fillRect(0, 0, 3, 3);
    ctx.fillRect(size - 3, 0, 3, 3);
    ctx.fillRect(0, size - 3, 3, 3);
    ctx.fillRect(size - 3, size - 3, 3, 3);

    SpriteFactory.register(scene, 'ui_minimap_border', canvas);
}

// ============================================================
//  Health/mana bar background track: 80×8
// ============================================================

function generateHealthBar(scene) {
    const { canvas, ctx } = SpriteFactory.createCanvas(80, 8);

    // Track (sunken)
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, 80, 8);
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, 80, 1);
    ctx.fillRect(0, 0, 1, 8);
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(0, 7, 80, 1);
    ctx.fillRect(79, 0, 1, 8);

    SpriteFactory.register(scene, 'ui_bar_track', canvas);
}

// ============================================================
//  Tooltip background: 120×40
// ============================================================

function generateTooltip(scene) {
    const { canvas, ctx } = SpriteFactory.createCanvas(120, 40);

    ctx.fillStyle = '#080814';
    ctx.fillRect(0, 0, 120, 40);
    ctx.strokeStyle = '#5a5a9a';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, 119, 39);
    ctx.fillStyle = 'rgba(60,60,120,0.2)';
    ctx.fillRect(1, 1, 118, 38);

    SpriteFactory.register(scene, 'ui_tooltip', canvas);
}

// ============================================================
//  Dialogue portrait frame: 36×44
// ============================================================

function generateDialoguePortraitFrame(scene) {
    const w = 36, h = 44;
    const { canvas, ctx } = SpriteFactory.createCanvas(w, h);

    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#5a5a8a';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);
    // Corner ornaments
    ctx.fillStyle = '#8a8aaa';
    ctx.fillRect(0, 0, 4, 4);
    ctx.fillRect(w - 4, 0, 4, 4);
    ctx.fillRect(0, h - 4, 4, 4);
    ctx.fillRect(w - 4, h - 4, 4, 4);
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(1, 1, 3, 3);
    ctx.fillRect(w - 4, 1, 3, 3);
    ctx.fillRect(1, h - 4, 3, 3);
    ctx.fillRect(w - 4, h - 4, 3, 3);
    // Inner area
    ctx.clearRect(3, 3, w - 6, h - 6);

    SpriteFactory.register(scene, 'ui_portrait_frame', canvas);
}

// ============================================================
//  Helpers
// ============================================================

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

function lerpColor(hex1, hex2, t) {
    const [r1, g1, b1] = hexToRgb(hex1);
    const [r2, g2, b2] = hexToRgb(hex2);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r},${g},${b})`;
}
