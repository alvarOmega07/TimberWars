import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { OptionsScene } from './scenes/OptionsScene.js';


const config = {
    type: Phaser.AUTO,      // WebGL si está disponible; si no, Canvas
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [MenuScene, OptionsScene, GameScene, PauseScene]      // La primera escena se inicia automáticamente
};

const game = new Phaser.Game(config);
