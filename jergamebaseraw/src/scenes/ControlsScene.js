import Phaser from 'phaser';

export class ControlsScene extends Phaser.Scene {
    constructor() {
        super('ControlsScene');
    }

    create(data = {}) {
        this.returnScene = data.returnScene || 'MenuScene';
        this.add.rectangle(400, 320, 800, 640, 0x0f172a, 0.9);
        this.add.rectangle(400, 320, 600, 500, 0x172033).setStrokeStyle(2, 0x334155);

        this.add.text(400, 115, 'CONTROLES', {
            fontSize: '46px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 265, [
            '← / →     Mover al jugador',
            '↑             Saltar',
            'ESC         Pausar o volver',
            'ENTER     Confirmar selección',
            'Ratón      Seleccionar botones'
        ].join('\n\n'), {
            fontSize: '24px',
            color: '#cbd5e1',
            lineSpacing: 8
        }).setOrigin(0.5);

        const back = this.add.text(400, 485, 'VOLVER', {
            fontSize: '30px',
            color: '#22c55e'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => back.setColor('#facc15'))
            .on('pointerout', () => back.setColor('#22c55e'))
            .on('pointerdown', () => this.goBack());

        this.backKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.backKey) ||
            Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.goBack();
        }
    }

    goBack() {
        if (this.returnScene === 'PauseScene') {
            this.scene.stop();
            this.scene.wake('PauseScene');
        } else {
            this.scene.start('MenuScene');
        }
    }
}
