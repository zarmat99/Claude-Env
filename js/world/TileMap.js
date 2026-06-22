// TileMap.js — Camera-culled tile renderer using Phaser RenderTexture

import { TILE } from './Biomes.js';
import { getTile, isPassable, WORLD_SIZE } from './WorldGen.js';

const TILE_SIZE = 16; // pixels per tile

export class TileMap {
    constructor(scene, tiles, biomeMap) {
        this.scene    = scene;
        this.tiles    = tiles;
        this.biomeMap = biomeMap;
        this.tileSize = TILE_SIZE;
        this.worldW   = WORLD_SIZE.width;
        this.worldH   = WORLD_SIZE.height;

        // Compute how many tiles fit on screen (add 2 tile buffer each side)
        const gw = scene.scale.width;
        const gh = scene.scale.height;
        this.visColCount = Math.ceil(gw / TILE_SIZE) + 2;
        this.visRowCount = Math.ceil(gh / TILE_SIZE) + 2;

        // RenderTexture covers the full game canvas
        this.rt = scene.add.renderTexture(0, 0, gw, gh);
        this.rt.setOrigin(0, 0);
        this.rt.setScrollFactor(0);
        this.rt.setDepth(0);

        // Track last drawn camera tile offset so we only redraw on move
        this.lastCamTileX = -9999;
        this.lastCamTileY = -9999;

        // Pre-build a reusable Phaser Image for stamping
        // We stamp from the 'tiles' atlas using frame = tileId
        this._stampImg = scene.add.image(0, 0, 'tiles', 0);
        this._stampImg.setVisible(false);
        this._stampImg.setOrigin(0, 0);
    }

    /**
     * Called each frame. If camera tile offset changed, re-stamp visible region.
     * camX/camY are the camera scroll position in world-pixel coordinates.
     */
    redrawVisible(camX, camY) {
        const tileX = Math.floor(camX / TILE_SIZE);
        const tileY = Math.floor(camY / TILE_SIZE);

        if (tileX === this.lastCamTileX && tileY === this.lastCamTileY) return;

        this.lastCamTileX = tileX;
        this.lastCamTileY = tileY;

        // Sub-tile pixel offset so rendering stays perfectly aligned
        const subX = camX - tileX * TILE_SIZE;
        const subY = camY - tileY * TILE_SIZE;

        this.rt.clear();

        for (let row = 0; row < this.visRowCount; row++) {
            for (let col = 0; col < this.visColCount; col++) {
                const worldTileX = tileX + col - 1;
                const worldTileY = tileY + row - 1;

                const tileId = getTile(this.tiles, worldTileX, worldTileY);

                const screenX = (col - 1) * TILE_SIZE - subX;
                const screenY = (row - 1) * TILE_SIZE - subY;

                this.stampTile(tileId, screenX, screenY);
            }
        }
    }

    /**
     * Stamp a single tile frame onto the RenderTexture at screen position.
     */
    stampTile(tileId, screenX, screenY) {
        // Use the frame index equal to tileId
        this.rt.stamp('tiles', tileId, screenX, screenY);
    }

    /**
     * Check whether a world-tile position is walkable.
     */
    isWalkable(tileX, tileY) {
        const tileId = getTile(this.tiles, tileX, tileY);
        return isPassable(tileId);
    }

    /**
     * Convert world-pixel coordinates to tile coordinates.
     */
    pixelToTile(px, py) {
        return {
            x: Math.floor(px / TILE_SIZE),
            y: Math.floor(py / TILE_SIZE)
        };
    }

    /**
     * Convert tile coordinates to the top-left world-pixel position of that tile.
     */
    tileToPixel(tx, ty) {
        return {
            x: tx * TILE_SIZE,
            y: ty * TILE_SIZE
        };
    }

    /**
     * World-pixel center of a tile.
     */
    tileCenterPixel(tx, ty) {
        return {
            x: tx * TILE_SIZE + TILE_SIZE / 2,
            y: ty * TILE_SIZE + TILE_SIZE / 2
        };
    }

    /**
     * Set the tiles data array (useful when entering a new area).
     */
    setTiles(tiles) {
        this.tiles = tiles;
        this.lastCamTileX = -9999;
        this.lastCamTileY = -9999;
    }

    destroy() {
        if (this._stampImg) this._stampImg.destroy();
        if (this.rt) this.rt.destroy();
    }

    static get TILE_SIZE() { return TILE_SIZE; }
}
