import Phaser from 'phaser';
import { SceneManager } from '../managers/SceneManager.js';
import { Player } from '../entities/Player.js';
import { AudioManager } from '../managers/AudioManager.js';
import { WeaponManager } from '../managers/WeaponManager.js';
import { UIManager } from '../managers/UIManager.js';
import { AnimManager } from '../managers/AnimManager.js';

export const GAME_STATES = {
    INIT: 'INIT',
    COUNTDOWN: 'COUNTDOWN',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    TUTORIAL: 'TUTORIAL',
    ROUND_OVER: 'ROUND_OVER',
    GAME_OVER: 'GAME_OVER'
};

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.currentState = GAME_STATES.INIT;
        this.scores = [0, 0];
        this.roundResolving = false;
    }

    preload() {
        this.load.image('tierra_key', 'assets/images/Tileset1.png');
        this.load.image('agua_key', 'assets/images/Agua.png');
        this.load.tilemapTiledJSON('mapa1_key', 'assets/images/MapaTimber.tmj');

        this.load.image('pistol', 'assets/images/pistol.png');
        this.load.image('shotgun', 'assets/images/shotgun.png');
        this.load.image('Display', 'assets/images/Display.png');

        this.load.spritesheet('player_sheet1', 'assets/images/CastorAzul.png', {
        frameWidth: 32,
        frameHeight: 64
        });
        this.load.spritesheet('player_sheet2', 'assets/images/CastorRojo.png', {
        frameWidth: 32,
        frameHeight: 64
        });
    }

    create() {
        this.currentState = GAME_STATES.INIT;
        this.scores = [0, 0];
        this.roundResolving = false;
        this.createDummyTextures();

        this.mapManager = new SceneManager(this, 'mapa1_key');
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

        //Animaciones
        this.animManager = new AnimManager(this);
        this.animManager.createPlayerAnimations();

        // Jugadores
        this.InitPosY = 430;

        this.player = new Player(this, 100, this.InitPosY, 'player_sheet1', {
            moveKeys: { left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D, jump: Phaser.Input.Keyboard.KeyCodes.W },
            pickupKey: Phaser.Input.Keyboard.KeyCodes.E,
            shootKey: Phaser.Input.Keyboard.KeyCodes.SPACE,
            dropKey: Phaser.Input.Keyboard.KeyCodes.Q
        });
        this.player.setFlipX(true);

        this.player2 = new Player(this, anchoMapa - 100, this.InitPosY, 'player_sheet2', {
            moveKeys: { left: Phaser.Input.Keyboard.KeyCodes.LEFT, right: Phaser.Input.Keyboard.KeyCodes.RIGHT, jump: Phaser.Input.Keyboard.KeyCodes.UP },
            pickupKey: Phaser.Input.Keyboard.KeyCodes.K,
            shootKey: Phaser.Input.Keyboard.KeyCodes.J,
            dropKey: Phaser.Input.Keyboard.KeyCodes.L
        });

        this.players = [this.player, this.player2];
        this.players.forEach(p => this.physics.add.collider(p, this.capaSuelo));

        this.weaponManager = new WeaponManager(this);
        this.weaponManager.createWeapons();
        this.weaponManager.setupBulletCollisions(this.players);

        this.uiManager = new UIManager(this);
        this.uiManager.createUI();
        this.uiManager.updateScore(this.scores);
        this.uiManager.updateAmmo(this.players);

        this.audioManager = new AudioManager(this, 'background_music');
        this.audioManager.playMusic();

        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        this.changeState(GAME_STATES.TUTORIAL);
        this.scene.launch('TutorialScene');
        this.scene.bringToTop('TutorialScene');
    }

    changeState(newState) {
        if (this.currentState === newState) return;

        console.log(`[FSM] Transición: ${this.currentState} -> ${newState}`);
        this.currentState = newState;

        switch (newState) {
            case GAME_STATES.COUNTDOWN:
                this.physics.pause();
                this.freezePlayers();
                this.uiManager.startCountdown(() => {
                    this.changeState(GAME_STATES.PLAYING);
                });
                break;

            case GAME_STATES.PLAYING:
                this.physics.resume();
                if (this.audioManager) this.audioManager.playMusic();
                if (this.scene.isActive('PauseScene')) this.scene.stop('PauseScene');
                break;

            case GAME_STATES.PAUSED:
                this.physics.pause();
                this.freezePlayers();
                if (this.audioManager) this.audioManager.pauseMusic();
                this.scene.launch('PauseScene');
                break;

            case GAME_STATES.TUTORIAL:
                this.physics.pause();
                this.freezePlayers();
                break;

            case GAME_STATES.ROUND_OVER:
                this.freezePlayers();

                this.time.delayedCall(1500, () => this.resetRound());
                break;

            case GAME_STATES.GAME_OVER:
                this.physics.pause();
                this.freezePlayers();
                if (this.audioManager) this.audioManager.pauseMusic();
                break;
        }
    }

    freezePlayers() {
        this.players.forEach(p => {
            if (!p.isDead) {
                p.setVelocity(0, 0);
                p.anims.play(`${p.texture.key}_idle`, true);
            }
        });
    }

    update(time, delta) {
        if (this.currentState === GAME_STATES.GAME_OVER) {
            this.uiManager.updateGameOver();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.pauseKey) && this.currentState === GAME_STATES.PLAYING) {
            this.changeState(GAME_STATES.PAUSED);
        }

        if (this.currentState === GAME_STATES.PLAYING && !this.roundResolving) {
            this.players.forEach(player => {
                const nearbyItem = this.weaponManager.checkNearbyWeapon(player);
                player.update(nearbyItem);
            });
        }
    }

    playerDied(loser) {
        if (this.currentState !== GAME_STATES.PLAYING || this.roundResolving) return;

        this.roundResolving = true;
        this.audioManager.playSFX('hit_sfx', { volume: 0.8 });
        this.cameras.main.shake(180, 0.006);
        const winnerIndex = loser === this.player ? 1 : 0;
        this.scores[winnerIndex]++;
        const winnerName = winnerIndex === 0 ? 'Jugador 1' : 'Jugador 2';

        this.uiManager.updateScore(this.scores);
        loser.setVelocity(0, 0);
        loser.body.enable = false;

        if (this.scores[winnerIndex] === 3) {
            this.changeState(GAME_STATES.GAME_OVER);
            this.uiManager.showGameOver(winnerName, () => {
                this.scene.restart();
            }, () => this.scene.start('MenuScene'));
            return;
        }

        this.uiManager.setMessage(`¡Punto para ${winnerName}!`);
        this.changeState(GAME_STATES.ROUND_OVER);
    }

    resetRound() {
        this.weaponManager.resetAll();

        const spawnPositions = [
            [100, this.InitPosY],
            [this.mapManager.map.widthInPixels - 100, this.InitPosY]
        ];

        this.players.forEach((player, index) => {
            const [x, y] = spawnPositions[index];
            player.isDead = false;
            player.setActive(true);
            player.setVisible(true);
            player.body.enable = true;
            player.body.reset(x, y);
            player.setVelocity(0, 0);
        });

        this.roundResolving = false;
        this.uiManager.clearMessage();
        this.changeState(GAME_STATES.COUNTDOWN);
    }

    createDummyTextures() {
        if (!this.textures.exists('player_dummy')) {
            const gPj = this.make.graphics({ width: 32, height: 48, add: false });
            gPj.fillStyle(0x1e88e5);
            gPj.fillRect(0, 0, 32, 48);
            gPj.generateTexture('player_dummy', 32, 48);
        }

        if (!this.textures.exists('player2_dummy')) {
            const gPj2 = this.make.graphics({ width: 32, height: 48, add: false });
            gPj2.fillStyle(0xe53935);
            gPj2.fillRect(0, 0, 32, 48);
            gPj2.generateTexture('player2_dummy', 32, 48);
        }

        if (!this.textures.exists('bullet_dummy')) {
            const gBala = this.make.graphics({ width: 6, height: 6, add: false });
            gBala.fillStyle(0xfacc15);
            gBala.fillCircle(3, 3, 3);
            gBala.generateTexture('bullet_dummy', 6, 6);
        }
    }
}