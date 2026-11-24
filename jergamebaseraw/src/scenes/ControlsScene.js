import Phaser from 'phaser';

export class ControlsScene extends Phaser.Scene {
    constructor() {
        super('ControlsScene');
    }

    create(data = {}) {
        this.returnScene = data.returnScene || 'MenuScene';
        this.add.rectangle(400, 320, 800, 640, 0x080e1a, 0.96);
        this.add.rectangle(400, 320, 680, 540, 0x111c2f).setStrokeStyle(2, 0x475569);
        this.add.rectangle(400, 52, 680, 4, 0xf59e0b);

        this.add.text(400, 100, 'CONTROLES', {
            fontSize: '40px',
            color: '#f8fafc',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(400, 140, 'Dos jugadores · Teclado compartido', {
            fontSize: '15px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        this.add.rectangle(230, 310, 270, 270, 0x17263b).setStrokeStyle(1, 0x334155);
        this.add.rectangle(570, 310, 270, 270, 0x17263b).setStrokeStyle(1, 0x334155);
        this.add.rectangle(230, 190, 270, 3, 0x3b82f6);
        this.add.rectangle(570, 190, 270, 3, 0xef4444);

        this.add.text(230, 220, 'JUGADOR 1 · AZUL', {
            fontSize: '18px',
            color: '#93c5fd',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(570, 220, 'JUGADOR 2 · ROJO', {
            fontSize: '18px',
            color: '#fca5a5',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(230, 320, [
            'MOVER     A / D',
            'SALTAR    W',
            'RECOGER   E',
            'DISPARAR  ESPACIO',
            'RECARGAR  R',
            'SOLTAR    G'
        ].join('\n'), {
            fontSize: '16px',
            color: '#cbd5e1',
            lineSpacing: 8
        }).setOrigin(0.5);
        this.add.text(570, 320, [
            'MOVER     ← / →',
            'SALTAR    ↑',
            'RECOGER   K',
            'DISPARAR  J',
            'RECARGAR  I',
            'SOLTAR    L'
        ].join('\n'), {
            fontSize: '16px',
            color: '#cbd5e1',
            lineSpacing: 8
        }).setOrigin(0.5);

        this.add.text(400, 500, 'Mejor de 5 rondas · Gana quien llegue a 3 puntos', {
            fontSize: '16px',
            color: '#fbbf24',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const back = this.add.text(400, 555, 'VOLVER', {
            fontSize: '20px',
            color: '#e2e8f0',
            backgroundColor: '#1e293b',
            padding: { x: 24, y: 9 },
            fontStyle: 'bold'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => back.setColor('#facc15'))
            .on('pointerout', () => back.setColor('#e2e8f0'))
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
