import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { OptionsScene } from './scenes/OptionsScene.js';
import { ControlsScene } from './scenes/ControlsScene.js';
import { TutorialScene } from './scenes/TutorialScene.js';


const config = {
    type: Phaser.AUTO,      // WebGL si está disponible; si no, Canvas
    width: 800,
    height: 640,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 }
        }
    },
    scene: [MenuScene, GameScene, PauseScene, OptionsScene, ControlsScene, TutorialScene]
};

const game = new Phaser.Game(config);
