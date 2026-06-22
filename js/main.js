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

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    parent: 'game-container',
    backgroundColor: '#000000',
    pixelArt: true,
    roundPixels: true,
    scene: [BootScene, PreloadScene, MainMenuScene, CharacterCreateScene, GameScene, CombatScene, InventoryScene, DialogueScene, WorldMapScene, CraftingScene],
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    }
};

const game = new Phaser.Game(config);
export default game;
