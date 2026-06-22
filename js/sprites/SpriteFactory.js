// SpriteFactory.js — Central sprite generation orchestrator

import { generateTileAtlas }    from './TileSprites.js';
import { generatePlayerSprites } from './PlayerSprite.js';
import { generateNPCSprites }   from './NPCSprites.js';
import { generateItemSprites }  from './ItemSprites.js';
import { generateUISprites }    from './UISprites.js';
import { generateEffectSprites } from './EffectSprites.js';

export class SpriteFactory {
    static generateAll(scene) {
        generateTileAtlas(scene);
        generatePlayerSprites(scene);
        generateNPCSprites(scene);
        generateItemSprites(scene);
        generateUISprites(scene);
        generateEffectSprites(scene);
        console.log('SpriteFactory: all textures generated');
    }

    /**
     * Create an off-screen canvas with anti-aliasing disabled.
     */
    static createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return { canvas, ctx };
    }

    /**
     * Register a canvas as a Phaser texture (skip if key already exists).
     */
    static register(scene, key, canvas) {
        if (scene.textures.exists(key)) return;
        scene.textures.addCanvas(key, canvas);
    }
}
