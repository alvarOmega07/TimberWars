import Phaser from 'phaser';

export class TutorialScene extends Phaser.Scene {
    constructor() {
        super('TutorialScene');
    }

    create() {
        this.add.rectangle(400, 320, 800, 640, 0x080e1a, 0.92).setInteractive();
        this.add.rectangle(400, 320, 680, 540, 0x111c2f).setStrokeStyle(2, 0x475569);
        this.add.rectangle(400, 52, 680, 4, 0xf59e0b);

        this.add.text(400, 98, '¡COMIENZA LA AVENTURA!', {
            fontSize: '32px',
            color: '#f8fafc',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(400, 140, 'Controles rápidos para empezar a jugar', {
            fontSize: '15px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        this.add.rectangle(230, 300, 280, 260, 0x17263b).setStrokeStyle(1, 0x334155);
        this.add.rectangle(570, 300, 280, 260, 0x17263b).setStrokeStyle(1, 0x334155);
        this.add.rectangle(230, 183, 280, 3, 0x3b82f6);
        this.add.rectangle(570, 183, 280, 3, 0xef4444);

        this.add.text(230, 215, 'JUGADOR 1 · AZUL', {
            fontSize: '17px',
            color: '#93c5fd',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(570, 215, 'JUGADOR 2 · ROJO', {
            fontSize: '17px',
            color: '#fca5a5',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(230, 305, [
            'Mover       A / D',
            'Saltar      W',
            'Recoger     E',
            'Disparar    ESPACIO',
            'Soltar      Q'
        ].join('\n'), {
            fontSize: '15px',
            color: '#cbd5e1',
            lineSpacing: 8
        }).setOrigin(0.5);
        this.add.text(570, 305, [
            'Mover       ← / →',
            'Saltar      ↑',
            'Recoger     K',
            'Disparar    J',
            'Soltar      L'
        ].join('\n'), {
            fontSize: '15px',
            color: '#cbd5e1',
            lineSpacing: 8
        }).setOrigin(0.5);

        this.add.text(400, 465, 'MEJOR DE 5 RONDAS · GANA QUIEN LLEGUE A 3 PUNTOS', {
            fontSize: '14px',
            color: '#fbbf24',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const start = this.add.text(400, 520, 'EMPEZAR PARTIDA', {
            fontSize: '21px',
            color: '#e2e8f0',
            backgroundColor: '#1e293b',
            padding: { x: 24, y: 10 },
            fontStyle: 'bold'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => start.setColor('#facc15'))
            .on('pointerout', () => start.setColor('#e2e8f0'))
            .on('pointerdown', () => this.finishTutorial());
        this.add.text(400, 568, 'ENTER / ESPACIO PARA CONTINUAR', {
            fontSize: '11px',
            color: '#94a3b8'
        }).setOrigin(0.5);

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
        const gameScene = this.scene.get('GameScene');
        this.scene.stop();
        gameScene.changeState('COUNTDOWN');
    }
}
