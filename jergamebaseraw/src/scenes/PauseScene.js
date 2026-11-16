import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    create() {
        // Fondo semitransparente
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

        // Título
        this.add.text(400, 200, 'Game Paused', { fontSize: '64px' }).setOrigin(0.5);

        // Botón Resume
        const resumeBtn = this.add.text(400, 320, 'Resume', { fontSize: '32px', color: '#00ff00' }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => resumeBtn.setStyle({ color: '#ffff00' }))
            .on('pointerout', () => resumeBtn.setStyle({ color: '#00ff00' }))
            .on('pointerdown', () => {
                // Notificar a la FSM de GameScene para cambiar de estado limpiamente
                const gameScene = this.scene.get('GameScene');
                if (gameScene && gameScene.changeState) {
                    gameScene.changeState('PLAYING');
                } else {
                    this.scene.stop();
                    this.scene.resume('GameScene');
                }
            });

        // Botón Menu
        const menuBtn = this.add.text(400, 400, 'Menu', { fontSize: '32px', color: '#00ff00' }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => menuBtn.setStyle({ color: '#ffff00' }))
            .on('pointerout', () => menuBtn.setStyle({ color: '#00ff00' }))
            .on('pointerdown', () => {
                this.scene.stop('GameScene');
                this.scene.start('MenuScene');
            });

        // Capturar tecla ESC dentro de PauseScene para despausar también con teclado
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            const gameScene = this.scene.get('GameScene');
            if (gameScene && gameScene.changeState) {
                gameScene.changeState('PLAYING');
            }
        }
    }
}