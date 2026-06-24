import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import CharacterCreateScene from './scenes/CharacterCreateScene.js';
import GameScene from './scenes/GameScene.js';
import CombatScene from './scenes/CombatScene.js';
import InventoryScene from './scenes/InventoryScene.js';
import DialogueScene from './scenes/DialogueScene.js';
import WorldMapScene from './scenes/MapScene.js';
import CraftingScene from './scenes/CraftingScene.js';
import StoryScene from './scenes/StoryScene.js';
import EndingScene from './scenes/EndingScene.js';
import { installGameAPI } from './api/GameAPI.js';

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    parent: 'game-container',
    backgroundColor: '#000000',
    pixelArt: true,
    roundPixels: true,
    // Keep the simulation alive when the browser window/tab is covered while live-testing.
    disableVisibilityChange: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, PreloadScene, MainMenuScene, CharacterCreateScene, GameScene, CombatScene, InventoryScene, DialogueScene, WorldMapScene, CraftingScene, StoryScene, EndingScene],
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    }
};

const game = new Phaser.Game(config);

// Expose the automation/inspection API as window.GameAPI (browser console + Playwright)
installGameAPI(game);

export default game;
