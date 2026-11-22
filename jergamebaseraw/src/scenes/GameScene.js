import Phaser from 'phaser';
import { SceneManager } from '../managers/SceneManager.js';
import { Player } from '../entities/Player.js';
import { Pistola } from '../entities/Pistola.js';
import { Escopeta } from '../entities/Escopeta.js';
import { AudioManager } from '../managers/AudioManager.js';

export const GAME_STATES = {
    INIT: 'INIT',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    TUTORIAL: 'TUTORIAL',
    GAME_OVER: 'GAME_OVER'
};

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.currentState = GAME_STATES.INIT;
    }

    preload() {
        this.load.image('madera_key', 'assets/images/Tileset2.png');
        this.load.image('tierra_key', 'assets/images/Tileset1.png');
        this.load.image('agua_key', 'assets/images/Agua.png');
        this.load.tilemapTiledJSON('mapa1_key', 'assets/images/MapaTimber.tmj');
    }

    create() {
        this.createDummyTextures();

        this.mapManager = new SceneManager(this, 'mapa1_key');
        this.mapManager.addTileset('Madera', 'madera_key');
        this.mapManager.addTileset('Tierra', 'tierra_key');
        this.mapManager.addTileset('Agua', 'agua_key');

        this.capaAgua = this.mapManager.createLayer('Agua', false);
        this.capaFondo = this.mapManager.createLayer('Fondo', false);
        this.capaSuelo = this.mapManager.createLayer('Suelo', true);
        this.capaDeco = this.mapManager.createLayer('Deco', false);
        this.capaArmas = this.mapManager.createLayer('Armas', false);

        const anchoMapa = this.mapManager.map.widthInPixels;
        const altoMapa = this.mapManager.map.heightInPixels; 
        this.physics.world.setBounds(0, 0, anchoMapa, altoMapa + 100);
        this.physics.world.setBoundsCollision(false, false, false, false);

        this.player = new Player(this, 100, 465);

        this.grupoPistolas = this.physics.add.group();
        const pistola1 = new Pistola(this, 174, 336);
        const pistola2 = new Pistola(this, 622, 334);

        this.escopeta = new Escopeta(this, 400, 270);

        this.grupoPistolas.add(pistola1);
        this.grupoPistolas.add(pistola2);

        this.physics.add.collider(this.player, this.capaSuelo);
        this.physics.add.collider(this.grupoPistolas, this.capaSuelo);
        this.physics.add.collider(this.escopeta, this.capaSuelo);

        // Instanciar gestor de audio e iniciar la música
        this.audioManager = new AudioManager(this, 'background_music');
        this.audioManager.playMusic();

        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        if (localStorage.getItem('tutorialSeen') === 'true') {
            this.changeState(GAME_STATES.PLAYING);
        } else {
            this.changeState(GAME_STATES.TUTORIAL);
            this.scene.launch('TutorialScene');
            this.scene.bringToTop('TutorialScene');
        }
    }

    changeState(newState) {
        if (this.currentState === newState) return;

        console.log(`[FSM] Transición: ${this.currentState} -> ${newState}`);
        this.currentState = newState;

        switch (newState) {
            case GAME_STATES.PLAYING:
                this.physics.resume();
                if (this.audioManager) {
                    this.audioManager.playMusic();
                }
                if (this.scene.isActive('PauseScene')) {
                    this.scene.stop('PauseScene');
                }
                break;

            case GAME_STATES.PAUSED:
                this.physics.pause();
                if (this.player) this.player.setVelocity(0, 0);
                if (this.audioManager) {
                    this.audioManager.pauseMusic();
                }
                this.scene.launch('PauseScene');
                break;

            case GAME_STATES.TUTORIAL:
                this.physics.pause();
                if (this.player) this.player.setVelocity(0, 0);
                break;

            case GAME_STATES.GAME_OVER:
                this.physics.pause();
                if (this.player) this.player.setVelocity(0, 0);
                if (this.audioManager) {
                    this.audioManager.pauseMusic();
                }

                this.time.delayedCall(2000, () => {
                    this.scene.restart();
                });
                break;
        }
    }

    update(time, delta) {
        if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
            console.log(this.player.x, this.player.y);
            if (this.currentState === GAME_STATES.PLAYING) {
                this.changeState(GAME_STATES.PAUSED);
            }
        }

        if (this.currentState === GAME_STATES.PLAYING) {
            let nearbyItem = null;

            this.physics.overlap(this.player, this.grupoPistolas, (player, pistola) => {
                nearbyItem = pistola;
            });

            this.physics.overlap(this.player, this.escopeta, (player, escopeta) => {
                nearbyItem = escopeta;
            });

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
            gPistola.fillStyle(0xF2F527);
            gPistola.fillRect(0, 0, 10, 10);
            gPistola.generateTexture('pistol_dummy', 16, 10);
        }

        if (!this.textures.exists('shotgun_dummy')) {
            const gEscopeta = this.make.graphics({ width: 16, height: 10, add: false });
            gEscopeta.fillStyle(0x4caf50);
            gEscopeta.fillRect(0, 0, 16, 10);
            gEscopeta.generateTexture('shotgun_dummy', 16, 10);
        }

        if (!this.textures.exists('bullet_dummy')) {
            const gBala = this.make.graphics({ width: 6, height: 6, add: false });
            gBala.fillStyle(0xfacc15);
            gBala.fillCircle(3, 3, 3);
            gBala.generateTexture('bullet_dummy', 6, 6);
        }
    }
}