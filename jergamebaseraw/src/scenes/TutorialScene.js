import Phaser from 'phaser';

export class TutorialScene extends Phaser.Scene {
    constructor() {
        super('TutorialScene');
    }

    create() {
        this.add.rectangle(400, 320, 800, 640, 0x0f172a, 0.82).setInteractive();
        this.add.rectangle(400, 320, 580, 410, 0x172033).setStrokeStyle(2, 0x334155);

        this.add.text(400, 185, '¡COMIENZA LA AVENTURA!', {
            fontSize: '34px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 300, 'Explora el mapa y prueba el movimiento.\n\n← / →  Moverse\n↑  Saltar\nESC  Abrir el menú de pausa', {
            fontSize: '23px',
            color: '#cbd5e1',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        const start = this.add.text(400, 465, 'EMPEZAR', {
            fontSize: '30px',
            color: '#22c55e'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => start.setColor('#facc15'))
            .on('pointerout', () => start.setColor('#22c55e'))
            .on('pointerdown', () => this.finishTutorial());

        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
            Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
            Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
            this.finishTutorial();
        }
    }

    finishTutorial() {
        localStorage.setItem('tutorialSeen', 'true');
        const gameScene = this.scene.get('GameScene');
        this.scene.stop();
        gameScene.changeState('PLAYING');
    }
}
