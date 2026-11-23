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
        this.load.image('madera_key', 'assets/images/Tileset2.png');
        this.load.image('tierra_key', 'assets/images/Tileset1.png');
        this.load.image('agua_key', 'assets/images/Agua.png');
        this.load.tilemapTiledJSON('mapa1_key', 'assets/images/MapaTimber.tmj');
        this.load.image('pistol', 'assets/images/pistol.png');
        this.load.image('shotgun', 'assets/images/shotgun.png');
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

        this.player = new Player(this, 100, 400, 'player_dummy', {
            moveKeys: {
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D,
                jump: Phaser.Input.Keyboard.KeyCodes.W
            },
            pickupKey: Phaser.Input.Keyboard.KeyCodes.E,
            shootKey: Phaser.Input.Keyboard.KeyCodes.SPACE,
            dropKey: Phaser.Input.Keyboard.KeyCodes.Q
        });
        
        this.player2 = new Player(this, anchoMapa - 100, 400, 'player2_dummy', {
            moveKeys: {
                left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                jump: Phaser.Input.Keyboard.KeyCodes.UP
            },
            pickupKey: Phaser.Input.Keyboard.KeyCodes.K,
            shootKey: Phaser.Input.Keyboard.KeyCodes.J,
            dropKey: Phaser.Input.Keyboard.KeyCodes.L
        });

        this.grupoPistolas = this.physics.add.group();
        const pistola1 = new Pistola(this, 174, 336, 'pistol');
        const pistola2 = new Pistola(this, 622, 334, 'pistol');

        this.escopeta = new Escopeta(this, 400, 270, 'shotgun');
        this.weapons = [pistola1, pistola2, this.escopeta];
        this.weaponSpawnPositions = [[174, 336], [622, 334], [400, 270]];

        this.grupoPistolas.add(pistola1);
        this.grupoPistolas.add(pistola2);

        this.physics.add.collider(this.player, this.capaSuelo);
        this.physics.add.collider(this.player2, this.capaSuelo);
        this.physics.add.collider(this.grupoPistolas, this.capaSuelo);
        this.physics.add.collider(this.escopeta, this.capaSuelo);

        this.weapons.forEach(weapon => {
            [this.player, this.player2].forEach(target => {
                this.physics.add.overlap(weapon.bulletsGroup, target, (objectA, objectB) => {
                    const bullet = objectA === target ? objectB : objectA;
                    if (!bullet.active || bullet.getData('shooter') === target || this.roundResolving) return;
                    bullet.destroy();
                    target.die();
                });
            });
        });

        this.scoreText = this.add.text(400, 18, '', {
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#0f172acc',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5, 0);
        this.roundMessage = this.add.text(400, 58, '', {
            fontSize: '20px',
            color: '#facc15',
            fontStyle: 'bold',
            backgroundColor: '#0f172acc',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5, 0);
        this.updateScoreText();

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
                [this.player, this.player2].forEach(player => {
                    if (player) player.setVelocity(0, 0);
                });
                if (this.audioManager) {
                    this.audioManager.pauseMusic();
                }
                this.scene.launch('PauseScene');
                break;

            case GAME_STATES.TUTORIAL:
                this.physics.pause();
                [this.player, this.player2].forEach(player => {
                    if (player) player.setVelocity(0, 0);
                });
                break;

            case GAME_STATES.ROUND_OVER:
                this.physics.pause();
                [this.player, this.player2].forEach(player => {
                    if (player) player.setVelocity(0, 0);
                });
                this.time.delayedCall(1500, () => this.resetRound());
                break;

            case GAME_STATES.GAME_OVER:
                this.physics.pause();
                [this.player, this.player2].forEach(player => {
                    if (player) player.setVelocity(0, 0);
                });
                if (this.audioManager) {
                    this.audioManager.pauseMusic();
                }

                this.time.delayedCall(3000, () => {
                    this.scene.restart();
                });
                break;
        }
    }

    update(time, delta) {
        if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
            if (this.currentState === GAME_STATES.PLAYING) {
                this.changeState(GAME_STATES.PAUSED);
            }
        }

        if (this.currentState === GAME_STATES.PLAYING && !this.roundResolving) {
            [this.player, this.player2].forEach(player => {
                let nearbyItem = null;

                this.physics.overlap(player, this.grupoPistolas, (overlappingPlayer, pistola) => {
                    nearbyItem = pistola;
                });

                this.physics.overlap(player, this.escopeta, (overlappingPlayer, escopeta) => {
                    nearbyItem = escopeta;
                });

                player.update(nearbyItem);
            });
        }
    }

    playerDied(loser) {
        if (this.currentState !== GAME_STATES.PLAYING || this.roundResolving) return;

        this.roundResolving = true;
        const winnerIndex = loser === this.player ? 1 : 0;
        this.scores[winnerIndex]++;
        const winnerName = winnerIndex === 0 ? 'Jugador 1' : 'Jugador 2';
        this.updateScoreText();
        loser.setVelocity(0, 0);
        loser.body.enable = false;

        if (this.scores[winnerIndex] === 3) {
            this.roundMessage.setText(`¡${winnerName} gana la partida!`);
            this.changeState(GAME_STATES.GAME_OVER);
            return;
        }

        this.roundMessage.setText(`¡Punto para ${winnerName}!`);
        this.changeState(GAME_STATES.ROUND_OVER);
    }

    updateScoreText() {
        if (this.scoreText) {
            this.scoreText.setText(`JUGADOR 1  ${this.scores[0]}  -  ${this.scores[1]}  JUGADOR 2  |  PRIMERO A 3`);
        }
    }

    resetRound() {
        this.weapons.forEach((weapon, index) => {
            const [x, y] = this.weaponSpawnPositions[index];
            weapon.resetTo(x, y);
        });

        [
            [this.player, 100, 400],
            [this.player2, this.mapManager.map.widthInPixels - 100, 400]
        ].forEach(([player, x, y]) => {
            player.isDead = false;
            player.setActive(true);
            player.setVisible(true);
            player.body.enable = true;
            player.body.reset(x, y);
            player.setVelocity(0, 0);
        });

        this.roundResolving = false;
        this.roundMessage.setText('');
        this.changeState(GAME_STATES.PLAYING);
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