// TileMap.js — Camera-culled tile renderer using Canvas 2D API

import { TILE } from './Biomes.js';
import { getTile, isPassable, WORLD_SIZE } from './WorldGen.js';

const TILE_SIZE = 16;

export class TileMap {
    constructor(scene, tiles, biomeMap) {
        this.scene    = scene;
        this.tiles    = tiles;
        this.biomeMap = biomeMap;
        this.tileSize = TILE_SIZE;
        this.worldW   = WORLD_SIZE.width;
        this.worldH   = WORLD_SIZE.height;

        const gw = scene.scale.width;
        const gh = scene.scale.height;
        this._gw = gw;
        this._gh = gh;

        this.visColCount = Math.ceil(gw / TILE_SIZE) + 2;
        this.visRowCount = Math.ceil(gh / TILE_SIZE) + 2;

        // Use a unique key per scene to survive scene restarts
        const texKey = 'tilemap_canvas_' + scene.sys.scene.key;
        if (scene.textures.exists(texKey)) scene.textures.remove(texKey);
        this._texKey = texKey;

        // CanvasTexture: draw tiles with native Canvas2D, then refresh() uploads once to GPU.
        // ~10-20x faster than RenderTexture.stamp() for bulk tile rendering.
        this.canvasTex = scene.textures.createCanvas(texKey, gw, gh);
        this.ctx       = this.canvasTex.context;
        this.img       = scene.add.image(0, 0, texKey)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(0);

        this.lastCamTileX = -9999;
        this.lastCamTileY = -9999;
        this.tilesAtlas   = null; // lazy-loaded on first redraw
    }

    /**
     * Called each frame. Redraws visible tiles only when camera crosses a tile boundary.
     */
    redrawVisible(camX, camY) {
        const tileX = Math.floor(camX / TILE_SIZE);
        const tileY = Math.floor(camY / TILE_SIZE);

        if (tileX === this.lastCamTileX && tileY === this.lastCamTileY) return;

        this.lastCamTileX = tileX;
        this.lastCamTileY = tileY;

        if (!this.tilesAtlas) {
            this.tilesAtlas = this.scene.textures.get('tiles').getSourceImage();
        }

        // Sub-tile pixel offset keeps rendering perfectly aligned between tile boundaries
        const subX = camX - tileX * TILE_SIZE;
        const subY = camY - tileY * TILE_SIZE;

        this.ctx.clearRect(0, 0, this._gw, this._gh);

        for (let row = 0; row < this.visRowCount; row++) {
            for (let col = 0; col < this.visColCount; col++) {
                const worldTileX = tileX + col - 1;
                const worldTileY = tileY + row - 1;
                const tileId     = getTile(this.tiles, worldTileX, worldTileY);
                const screenX    = (col - 1) * TILE_SIZE - subX;
                const screenY    = (row - 1) * TILE_SIZE - subY;

                // Atlas layout: 25 tiles × 16px wide in a single row — srcX = tileId * 16
                this.ctx.drawImage(
                    this.tilesAtlas,
                    tileId * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE,
                    screenX, screenY, TILE_SIZE, TILE_SIZE
                );
            }
        }

        // Single GPU upload per redraw (replaces ~2600 individual stamp() calls)
        this.canvasTex.refresh();
    }

    isWalkable(tileX, tileY) {
        const tileId = getTile(this.tiles, tileX, tileY);
        return isPassable(tileId);
    }

    getTileAt(tileX, tileY) {
        return getTile(this.tiles, tileX, tileY);
    }

    pixelToTile(px, py) {
        return { x: Math.floor(px / TILE_SIZE), y: Math.floor(py / TILE_SIZE) };
    }

    tileToPixel(tx, ty) {
        return { x: tx * TILE_SIZE, y: ty * TILE_SIZE };
    }

    tileCenterPixel(tx, ty) {
        return { x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2 };
    }

    setTiles(tiles) {
        this.tiles = tiles;
        this.lastCamTileX = -9999;
        this.lastCamTileY = -9999;
    }

    destroy() {
        if (this.img)       this.img.destroy();
        if (this.canvasTex) this.canvasTex.destroy();
    }

    static get TILE_SIZE() { return TILE_SIZE; }
}
