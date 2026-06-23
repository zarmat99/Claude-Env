// ItemSprites.js — All item icons (12×12 pixels each)

import { SpriteFactory } from './SpriteFactory.js';

export function generateItemSprites(scene) {
    const items = [
        { key: 'item_iron_sword',      draw: drawSword },
        { key: 'item_steel_sword',     draw: drawSword2 },
        { key: 'item_rootstone_blade', draw: drawRootstoneSword },
        { key: 'item_iron_mace',       draw: drawMace },
        { key: 'item_wooden_bow',      draw: drawBow },
        { key: 'item_arrow',           draw: drawArrow },
        { key: 'item_staff',           draw: drawStaff },
        { key: 'item_dagger',          draw: drawDagger },
        { key: 'item_leather_chest',   draw: drawLeatherArmor },
        { key: 'item_iron_chest',      draw: drawIronArmor },
        { key: 'item_bark_chest',      draw: drawBarkArmor },
        { key: 'item_leather_helm',    draw: drawLeatherHelm },
        { key: 'item_iron_helm',       draw: drawIronHelm },
        { key: 'item_potion_red',      draw: (ctx) => drawPotion(ctx, '#cc2222') },
        { key: 'item_potion_blue',     draw: (ctx) => drawPotion(ctx, '#2244cc') },
        { key: 'item_potion_green',    draw: (ctx) => drawPotion(ctx, '#22aa44') },
        { key: 'item_potion_yellow',   draw: (ctx) => drawPotion(ctx, '#ccaa22') },
        { key: 'item_food',            draw: drawFood },
        { key: 'item_herb_red',        draw: (ctx) => drawHerb(ctx, '#cc4422') },
        { key: 'item_herb_green',      draw: (ctx) => drawHerb(ctx, '#44aa22') },
        { key: 'item_herb_purple',     draw: (ctx) => drawHerb(ctx, '#882288') },
        { key: 'item_herb_dark',       draw: (ctx) => drawHerb(ctx, '#221144') },
        { key: 'item_ore_iron',        draw: drawOre },
        { key: 'item_ingot',           draw: drawIngot },
        { key: 'item_leather',         draw: drawLeather },
        { key: 'item_rootstone',       draw: drawRootstoneItem },
        { key: 'item_quest',           draw: drawQuestItem },
        { key: 'item_scroll',          draw: drawScroll },
        { key: 'item_gold',            draw: drawGold },
        { key: 'item_key',             draw: drawKey },
        { key: 'item_torch',           draw: drawTorch },
    ];

    for (const item of items) {
        const { canvas, ctx } = SpriteFactory.createCanvas(12, 12);
        item.draw(ctx);
        SpriteFactory.register(scene, item.key, canvas);
    }
}

// ============================================================
//  Draw functions — each draws in a 12×12 canvas
// ============================================================

// Iron sword: grey blade, brown hilt, silver guard
function drawSword(ctx) {
    // Blade
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(5, 0, 2, 8);
    ctx.fillStyle = '#c8c8c8';
    ctx.fillRect(5, 0, 1, 7);
    // Tip
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(6, 1, 1, 1);
    // Guard
    ctx.fillStyle = '#6a4a1a';
    ctx.fillRect(3, 8, 6, 2);
    // Grip
    ctx.fillStyle = '#4a2a0a';
    ctx.fillRect(5, 10, 2, 2);
}

// Steel sword: brighter blade with blue sheen
function drawSword2(ctx) {
    ctx.fillStyle = '#c0c8d0';
    ctx.fillRect(5, 0, 2, 8);
    ctx.fillStyle = '#e0e8f0';
    ctx.fillRect(5, 0, 1, 6);
    ctx.fillStyle = '#8090a0';
    ctx.fillRect(6, 1, 1, 6);
    // Guard (gold)
    ctx.fillStyle = '#d4aa00';
    ctx.fillRect(3, 8, 6, 2);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(3, 8, 6, 1);
    // Grip
    ctx.fillStyle = '#3a2a0a';
    ctx.fillRect(5, 10, 2, 2);
}

// Rootstone blade: teal veined blade
function drawRootstoneSword(ctx) {
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(5, 0, 2, 8);
    ctx.fillStyle = '#00ccaa';
    ctx.fillRect(5, 1, 1, 6);
    ctx.fillRect(5, 3, 2, 1);
    ctx.fillRect(6, 5, 1, 1);
    // Guard
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(3, 8, 6, 2);
    ctx.fillStyle = '#004a3a';
    ctx.fillRect(5, 10, 2, 2);
}

// Iron mace: round head, short handle
function drawMace(ctx) {
    // Grip
    ctx.fillStyle = '#6a4a1a';
    ctx.fillRect(5, 7, 2, 5);
    // Guard ring
    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(4, 6, 4, 2);
    // Head (flanged circle)
    ctx.fillStyle = '#7a7a7a';
    ctx.fillRect(3, 2, 6, 5);
    ctx.fillRect(2, 3, 8, 3);
    // Flanges
    ctx.fillStyle = '#9a9a9a';
    ctx.fillRect(2, 2, 2, 2);
    ctx.fillRect(8, 2, 2, 2);
    ctx.fillRect(2, 5, 2, 2);
    ctx.fillRect(8, 5, 2, 2);
    // Spike top
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(5, 0, 2, 3);
}

// Wooden bow: curved brown shape
function drawBow(ctx) {
    ctx.fillStyle = '#8a5a2a';
    // Bow limbs
    ctx.fillRect(1, 0, 2, 3);
    ctx.fillRect(0, 2, 3, 3);
    ctx.fillRect(1, 9, 2, 3);
    ctx.fillRect(0, 7, 3, 3);
    // Handle
    ctx.fillRect(1, 5, 2, 2);
    ctx.fillStyle = '#6a3a0a';
    ctx.fillRect(1, 4, 2, 4);
    // Bowstring
    ctx.fillStyle = '#c8c8a8';
    ctx.fillRect(3, 0, 1, 12);
    // Nock
    ctx.fillStyle = '#aa8840';
    ctx.fillRect(2, 0, 2, 1);
    ctx.fillRect(2, 11, 2, 1);
}

// Arrow: feathered shaft
function drawArrow(ctx) {
    // Shaft
    ctx.fillStyle = '#8a6a3a';
    ctx.fillRect(5, 2, 1, 8);
    // Head
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(4, 0, 3, 3);
    ctx.fillRect(5, 0, 1, 4);
    // Feathers
    ctx.fillStyle = '#d8c8a8';
    ctx.fillRect(3, 9, 3, 2);
    ctx.fillRect(6, 9, 3, 2);
    ctx.fillStyle = '#c8b898';
    ctx.fillRect(3, 10, 2, 1);
    ctx.fillRect(7, 10, 2, 1);
}

// Staff: long wooden rod with glowing tip
function drawStaff(ctx) {
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(5, 2, 2, 10);
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(5, 3, 1, 8);
    // Crystal tip
    ctx.fillStyle = '#4488cc';
    ctx.fillRect(4, 0, 4, 3);
    ctx.fillRect(5, 0, 2, 4);
    ctx.fillStyle = '#88bbff';
    ctx.fillRect(5, 0, 1, 2);
    // Ferrule
    ctx.fillStyle = '#8a8a6a';
    ctx.fillRect(4, 10, 4, 2);
}

// Dagger: short blade, simple
function drawDagger(ctx) {
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(5, 1, 2, 6);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(5, 1, 1, 5);
    // Tip point
    ctx.fillStyle = '#b0b0b0';
    ctx.fillRect(6, 2, 1, 1);
    // Guard
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(3, 7, 6, 1);
    // Grip
    ctx.fillStyle = '#3a1a0a';
    ctx.fillRect(5, 8, 2, 4);
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(4, 9, 4, 1);
    ctx.fillRect(4, 11, 4, 1);
}

// Leather armor: brown chest silhouette
function drawLeatherArmor(ctx) {
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(2, 3, 8, 9);
    ctx.fillRect(1, 5, 10, 5);
    // Shoulder pads
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(1, 3, 3, 3);
    ctx.fillRect(8, 3, 3, 3);
    // Collar
    ctx.fillStyle = '#8a6a4a';
    ctx.fillRect(4, 2, 4, 2);
    // Straps
    ctx.fillStyle = '#4a2a0a';
    ctx.fillRect(5, 3, 2, 9);
    ctx.fillRect(2, 6, 8, 1);
    // Buckle
    ctx.fillStyle = '#c8a840';
    ctx.fillRect(5, 7, 2, 1);
}

// Iron armor: grey metallic chest
function drawIronArmor(ctx) {
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(2, 3, 8, 9);
    ctx.fillRect(1, 5, 10, 5);
    // Pauldrons
    ctx.fillStyle = '#7a7a8a';
    ctx.fillRect(1, 2, 3, 4);
    ctx.fillRect(8, 2, 3, 4);
    // Highlight
    ctx.fillStyle = '#9a9aaa';
    ctx.fillRect(3, 4, 6, 1);
    ctx.fillRect(2, 3, 1, 8);
    // Dark lines
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(2, 7, 8, 1);
    ctx.fillRect(5, 3, 2, 9);
    // Collar
    ctx.fillStyle = '#8a8a9a';
    ctx.fillRect(4, 2, 4, 2);
}

// Bark armor: dark green wood-like
function drawBarkArmor(ctx) {
    ctx.fillStyle = '#4a6a2a';
    ctx.fillRect(2, 3, 8, 9);
    ctx.fillRect(1, 5, 10, 5);
    ctx.fillStyle = '#3a5a1a';
    ctx.fillRect(1, 2, 3, 4);
    ctx.fillRect(8, 2, 3, 4);
    // Bark lines
    ctx.fillStyle = '#2a4a0a';
    ctx.fillRect(2, 4, 8, 1);
    ctx.fillRect(2, 6, 8, 1);
    ctx.fillRect(2, 8, 8, 1);
    ctx.fillRect(2, 10, 8, 1);
    ctx.fillStyle = '#6a9a4a';
    ctx.fillRect(3, 3, 1, 9);
    // Leaf detail
    ctx.fillStyle = '#2a8a1a';
    ctx.fillRect(9, 3, 2, 2);
    ctx.fillRect(1, 9, 2, 2);
}

// Leather helm: round cap
function drawLeatherHelm(ctx) {
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(2, 3, 8, 7);
    ctx.fillRect(1, 5, 10, 3);
    // Curved top
    ctx.fillRect(3, 2, 6, 2);
    ctx.fillRect(4, 1, 4, 2);
    // Brim
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(1, 9, 10, 2);
    // Highlight
    ctx.fillStyle = '#9a7a5a';
    ctx.fillRect(3, 3, 4, 1);
    // Strap
    ctx.fillStyle = '#4a2a0a';
    ctx.fillRect(2, 9, 8, 1);
}

// Iron helm: metal bucket helm
function drawIronHelm(ctx) {
    ctx.fillStyle = '#7a7a8a';
    ctx.fillRect(2, 2, 8, 8);
    ctx.fillRect(1, 4, 10, 4);
    // Top dome
    ctx.fillRect(3, 1, 6, 2);
    ctx.fillRect(4, 0, 4, 2);
    // Visor slot
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(2, 6, 8, 2);
    // Brim
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(1, 10, 10, 2);
    // Highlights
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(3, 2, 5, 1);
    ctx.fillRect(2, 4, 1, 5);
    // Rivets
    ctx.fillStyle = '#9a9aaa';
    ctx.fillRect(2, 3, 1, 1);
    ctx.fillRect(9, 3, 1, 1);
}

// Potion: round flask with colored liquid
function drawPotion(ctx, color) {
    // Neck
    ctx.fillStyle = '#8aaabb';
    ctx.fillRect(4, 0, 4, 3);
    ctx.fillStyle = '#ccddee';
    ctx.fillRect(5, 0, 2, 2);
    // Cork
    ctx.fillStyle = '#aa8855';
    ctx.fillRect(4, 1, 4, 2);
    // Flask body
    ctx.fillStyle = '#88aacc';
    ctx.fillRect(2, 3, 8, 8);
    ctx.fillRect(1, 5, 10, 4);
    // Liquid fill
    ctx.fillStyle = color;
    ctx.fillRect(2, 5, 8, 6);
    ctx.fillRect(3, 4, 6, 7);
    // Highlight on glass
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(2, 4, 2, 4);
    ctx.fillRect(3, 3, 1, 3);
    // Shadow edge
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(8, 4, 2, 6);
    ctx.fillRect(9, 5, 1, 4);
    // Shine on liquid
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(3, 6, 2, 2);
}

// Food: bread loaf
function drawFood(ctx) {
    ctx.fillStyle = '#c8883a';
    ctx.fillRect(1, 4, 10, 7);
    ctx.fillRect(2, 3, 8, 8);
    // Top crust
    ctx.fillStyle = '#d89a4a';
    ctx.fillRect(3, 2, 6, 3);
    ctx.fillRect(2, 3, 8, 2);
    ctx.fillStyle = '#e0aa5a';
    ctx.fillRect(4, 2, 4, 2);
    // Bottom
    ctx.fillStyle = '#a86a2a';
    ctx.fillRect(2, 9, 8, 2);
    // Score marks
    ctx.fillStyle = '#b87a3a';
    ctx.fillRect(4, 5, 1, 4);
    ctx.fillRect(7, 5, 1, 4);
    // Highlight
    ctx.fillStyle = '#f0bb6a';
    ctx.fillRect(3, 3, 3, 1);
}

// Herb: small leaf/flower
function drawHerb(ctx, color) {
    // Stem
    ctx.fillStyle = '#3a7a1a';
    ctx.fillRect(5, 6, 2, 6);
    ctx.fillRect(4, 8, 4, 1);
    // Leaves
    ctx.fillStyle = '#4a9a2a';
    ctx.fillRect(2, 5, 4, 3);
    ctx.fillRect(6, 5, 4, 3);
    ctx.fillRect(3, 6, 2, 4);
    ctx.fillRect(7, 6, 2, 4);
    // Flower / herb top
    ctx.fillStyle = color;
    ctx.fillRect(4, 0, 4, 4);
    ctx.fillRect(3, 1, 6, 2);
    // Petals detail
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 1, 2, 1);
    // Center
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(5, 2, 2, 1);
}

// Ore chunk: grey angular with metallic flecks
function drawOre(ctx) {
    ctx.fillStyle = '#5a5a6a';
    ctx.fillRect(1, 3, 10, 7);
    ctx.fillRect(2, 2, 8, 9);
    ctx.fillRect(3, 1, 6, 10);
    // Dark facets
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(1, 3, 3, 3);
    ctx.fillRect(7, 8, 3, 2);
    // Metal flecks
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(4, 4, 2, 2);
    ctx.fillRect(7, 5, 1, 2);
    ctx.fillRect(3, 7, 2, 1);
    ctx.fillRect(8, 3, 1, 1);
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(5, 5, 1, 1);
    ctx.fillRect(6, 7, 1, 1);
}

// Metal ingot: rectangular bar
function drawIngot(ctx) {
    ctx.fillStyle = '#8a8a9a';
    ctx.fillRect(1, 4, 10, 6);
    // Top face
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(2, 3, 8, 2);
    ctx.fillRect(1, 4, 10, 1);
    // Right face
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(9, 4, 2, 6);
    // Highlight
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(2, 3, 4, 1);
    ctx.fillRect(2, 4, 1, 4);
    // Brand mark
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(4, 6, 4, 2);
}

// Leather: rolled hide
function drawLeather(ctx) {
    ctx.fillStyle = '#8a5a3a';
    ctx.fillRect(1, 3, 10, 7);
    ctx.fillRect(2, 2, 8, 9);
    // Roll texture
    ctx.fillStyle = '#7a4a2a';
    ctx.fillRect(2, 4, 8, 1);
    ctx.fillRect(2, 6, 8, 1);
    ctx.fillRect(2, 8, 8, 1);
    // Edge
    ctx.fillStyle = '#aa7a5a';
    ctx.fillRect(2, 3, 1, 6);
    ctx.fillRect(9, 3, 1, 6);
    // Tie
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(5, 2, 2, 9);
    ctx.fillRect(4, 5, 4, 2);
}

// Rootstone fragment: dark with teal veins
function drawRootstoneItem(ctx) {
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(1, 2, 10, 8);
    ctx.fillRect(2, 1, 8, 10);
    // Teal veins
    ctx.fillStyle = '#00ccaa';
    ctx.fillRect(3, 3, 6, 1);
    ctx.fillRect(5, 1, 1, 8);
    ctx.fillRect(2, 6, 8, 1);
    ctx.fillRect(3, 4, 1, 3);
    // Bright nodes
    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(5, 3, 1, 1);
    ctx.fillRect(5, 6, 1, 1);
    ctx.fillRect(3, 6, 1, 1);
    ctx.fillStyle = '#80ffee';
    ctx.fillRect(5, 3, 1, 1);
}

// Quest item: glowing orb / mysterious artifact
function drawQuestItem(ctx) {
    // Outer glow
    ctx.fillStyle = '#441100';
    ctx.fillRect(0, 0, 12, 12);
    ctx.fillStyle = '#882200';
    ctx.fillRect(1, 1, 10, 10);
    ctx.fillStyle = '#cc4400';
    ctx.fillRect(2, 2, 8, 8);
    ctx.fillStyle = '#ff8800';
    ctx.fillRect(3, 3, 6, 6);
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(4, 4, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 5, 2, 2);
    // Ornament marks
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(2, 5, 2, 2);
    ctx.fillRect(8, 5, 2, 2);
    ctx.fillRect(5, 2, 2, 2);
    ctx.fillRect(5, 8, 2, 2);
}

// Scroll: rolled parchment
function drawScroll(ctx) {
    // Scroll body
    ctx.fillStyle = '#e8d8a8';
    ctx.fillRect(2, 2, 8, 8);
    // Rolled ends
    ctx.fillStyle = '#d8c898';
    ctx.fillRect(1, 2, 2, 8);
    ctx.fillRect(9, 2, 2, 8);
    ctx.fillStyle = '#f0e8c8';
    ctx.fillRect(1, 3, 1, 6);
    ctx.fillRect(10, 3, 1, 6);
    // Text lines
    ctx.fillStyle = '#888878';
    ctx.fillRect(3, 4, 6, 1);
    ctx.fillRect(3, 6, 6, 1);
    ctx.fillRect(3, 8, 4, 1);
    // Seal (red wax)
    ctx.fillStyle = '#cc2200';
    ctx.fillRect(5, 5, 2, 2);
    ctx.fillStyle = '#ff4422';
    ctx.fillRect(5, 5, 1, 1);
    // Ribbon
    ctx.fillStyle = '#cc2200';
    ctx.fillRect(4, 2, 4, 1);
    ctx.fillRect(4, 9, 4, 1);
}

// Gold coins: pile of coins
function drawGold(ctx) {
    // Back coins
    ctx.fillStyle = '#aa8800';
    ctx.fillRect(5, 2, 6, 4);
    ctx.fillRect(4, 3, 8, 2);
    // Mid coin
    ctx.fillStyle = '#cc9900';
    ctx.fillRect(3, 5, 6, 4);
    ctx.fillRect(2, 6, 8, 2);
    // Front coin
    ctx.fillStyle = '#d4aa00';
    ctx.fillRect(1, 7, 7, 4);
    ctx.fillRect(0, 8, 9, 2);
    // Highlights
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(6, 2, 3, 1);
    ctx.fillRect(4, 5, 3, 1);
    ctx.fillRect(2, 7, 3, 1);
    // Shine
    ctx.fillStyle = '#ffe040';
    ctx.fillRect(7, 2, 1, 1);
    ctx.fillRect(5, 5, 1, 1);
    ctx.fillRect(3, 7, 1, 1);
}

// Key: old iron key
function drawKey(ctx) {
    // Head (ring)
    ctx.fillStyle = '#8a8a6a';
    ctx.fillRect(3, 1, 6, 6);
    ctx.fillRect(2, 2, 8, 4);
    // Key hole in head
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(5, 3, 2, 2);
    ctx.fillRect(6, 2, 1, 4);
    // Shaft
    ctx.fillStyle = '#7a7a5a';
    ctx.fillRect(6, 6, 2, 6);
    // Bits (teeth)
    ctx.fillStyle = '#8a8a6a';
    ctx.fillRect(8, 8, 2, 1);
    ctx.fillRect(8, 10, 2, 1);
    ctx.fillRect(8, 7, 1, 1);
    // Highlight
    ctx.fillStyle = '#aaaa8a';
    ctx.fillRect(3, 2, 3, 2);
}

// Torch: wooden handle with flame
function drawTorch(ctx) {
    // Handle
    ctx.fillStyle = '#7a5a2a';
    ctx.fillRect(5, 5, 2, 7);
    // Wrap
    ctx.fillStyle = '#6a4a1a';
    ctx.fillRect(4, 6, 4, 1);
    ctx.fillRect(4, 8, 4, 1);
    ctx.fillRect(4, 10, 4, 1);
    // Head / wick bundle
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(4, 3, 4, 3);
    ctx.fillStyle = '#8a5a2a';
    ctx.fillRect(3, 4, 6, 2);
    // Flame (outer)
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(4, 0, 4, 4);
    ctx.fillRect(3, 1, 6, 2);
    // Flame (mid)
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(4, 0, 3, 3);
    ctx.fillRect(5, 0, 2, 4);
    // Flame (core)
    ctx.fillStyle = '#ffff88';
    ctx.fillRect(5, 1, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 1, 1, 1);
}
