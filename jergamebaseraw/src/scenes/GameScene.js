import Phaser from 'phaser';
import { SceneManager } from '../scenes/SceneManager.js';
import { Player } from '../entities/Player.js';
import { Pistola } from '../entities/Pistola.js';

export const GAME_STATES = {
    INIT: 'INIT',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
};

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.currentState = GAME_STATES.INIT;
    }

    preload() {
        this.load.image('tiles_key', 'assets/images/tileset1.png');
        this.load.tilemapTiledJSON('mapa1_key', 'assets/images/Mapa.tmj');
    }

    create() {
        this.createDummyTextures();

        this.mapManager = new SceneManager(this, 'mapa1_key', 'tiles_key', 'tileset1');
        this.capaAire = this.mapManager.createLayer('Aire', false);
        this.capaSuelo = this.mapManager.createLayer('Suelo', true);

        this.player = new Player(this, 32, 64);
        this.pistola = new Pistola(this, 300, 400); // Pistola en (300, 400)

        this.physics.add.collider(this.player, this.capaSuelo);
        this.physics.add.collider(this.pistola, this.capaSuelo);

        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.changeState(GAME_STATES.PLAYING);
    }

    changeState(newState) {
        if (this.currentState === newState) return;

        console.log(`[FSM] Transición: ${this.currentState} -> ${newState}`);
        this.currentState = newState;

        switch (newState) {
            case GAME_STATES.PLAYING:
                this.physics.resume();
                if (this.scene.isActive('PauseScene')) {
                    this.scene.stop('PauseScene');
                }
                break;

            case GAME_STATES.PAUSED:
                this.physics.pause();
                if (this.player) this.player.setVelocity(0, 0);
                this.scene.launch('PauseScene');
                break;

            case GAME_STATES.GAME_OVER:
                this.physics.pause();
                if (this.player) this.player.setVelocity(0, 0);
                break;
        }
    }

    update(time, delta) {
        // Al pulsar ESC durante el gameplay pasa a PAUSED
        if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
            if (this.currentState === GAME_STATES.PLAYING) {
                this.changeState(GAME_STATES.PAUSED);
            }
        }

        if (this.currentState === GAME_STATES.PLAYING) {
            // Comprobar solapamiento entre el jugador y la pistola
            let nearbyItem = null;
            if (this.physics.overlap(this.player, this.pistola)) {
                nearbyItem = this.pistola;
            }

            // Actualizar la lógica del jugador pasando el objeto interactuable
            if (this.player) {
                this.player.update(nearbyItem);
            }
        }
    }

    createDummyTextures() {
        if (!this.textures.exists('player_dummy')) {
            const gPj = this.make.graphics({ width: 32, height: 48, add: false });
            gPj.fillStyle(0x1e88e5);
            gPj.fillRect(0, 0, 32, 48);
            gPj.generateTexture('player_dummy', 32, 48);
        }

        if (!this.textures.exists('pistol_dummy')) {
            const gPistola = this.make.graphics({ width: 16, height: 10, add: false });
            gPistola.fillStyle(0x4caf50);
            gPistola.fillRect(0, 0, 16, 10);
            gPistola.generateTexture('pistol_dummy', 16, 10);
        }
    }
}