import Phaser from 'phaser';

export class ControlsScene extends Phaser.Scene {
    constructor() {
        super('ControlsScene');
    }

    create(data = {}) {
        this.returnScene = data.returnScene || 'MenuScene';
        this.add.rectangle(400, 320, 800, 640, 0x0f172a, 0.9);
        this.add.rectangle(400, 320, 660, 540, 0x172033).setStrokeStyle(2, 0x334155);

        this.add.text(400, 105, 'CONTROLES', {
            fontSize: '42px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(400, 295, [
            'JUGADOR 1  (azul)',
            'A / D mover     W saltar',
            'E recoger     ESPACIO disparar     G soltar',
            '',
            'JUGADOR 2  (rojo)',
            '← / → mover     ↑ saltar',
            'K recoger     J disparar     L soltar',
            '',
            'Mejor de 5 rondas: gana quien llegue a 3 puntos.',
            'ESC pausar o volver  ·  ENTER confirmar  ·  Ratón seleccionar'
        ].join('\n'), {
            fontSize: '19px',
            color: '#cbd5e1',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);

        const back = this.add.text(400, 555, 'VOLVER', {
            fontSize: '26px',
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
