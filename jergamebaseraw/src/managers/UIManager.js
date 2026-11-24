export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.scoreText = null;
        this.roundMessage = null;
        this.countdownText = null;
    }

    createUI() {
        this.scoreText = this.scene.add.text(400, 18, '', {
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#0f172acc',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5, 0);

        this.roundMessage = this.scene.add.text(400, 58, '', {
            fontSize: '20px',
            color: '#facc15',
            fontStyle: 'bold',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5, 0);

        this.countdownText = this.scene.add.text(400, 300, '', {
            fontSize: '84px',
            color: '#facc15',
            fontStyle: '900',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(100);
    }

    startCountdown(onComplete) {
        const steps = ['3', '2', '1', '¡LUCHAR!'];
        let stepIndex = 0;

        const showNextStep = () => {
            if (stepIndex >= steps.length) {
                this.countdownText.setText('');
                if (onComplete) onComplete();
                return;
            }

            const currentText = steps[stepIndex];
            this.countdownText.setText(currentText);
            this.countdownText.setScale(0.5);
            this.countdownText.setAlpha(1);

            // Animación
            this.scene.tweens.add({
                targets: this.countdownText,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 600,
                ease: 'Back.easeOut',
                onComplete: () => {
                    stepIndex++;
                    const delay = (currentText === '¡LUCHAR!') ? 300 : 200;
                    this.scene.time.delayedCall(delay, showNextStep);
                }
            });
        };

        showNextStep();
    }

    updateScore(scores) {
        if (this.scoreText) {
            this.scoreText.setText(`JUGADOR 1  ${scores[0]}  -  ${scores[1]}  JUGADOR 2`);
        }
    }

    setMessage(text) {
        if (this.roundMessage) {    
            this.roundMessage.setText(text);
        }
    }

    clearMessage() {
        if (this.roundMessage) {
            this.roundMessage.setText('');
        }
    }

    showGameOver(winnerName, onReplay, onMenu) {
        this.clearMessage();
        this.selectedGameOverIndex = 0;
        this.gameOverButtons = [
            this.createGameOverButton(290, 370, 'VOLVER A JUGAR', onReplay),
            this.createGameOverButton(510, 370, 'MENÚ PRINCIPAL', onMenu)
        ];

        this.scene.add.rectangle(400, 320, 800, 640, 0x020617, 0.86)
            .setDepth(200)
            .setInteractive();
        this.scene.add.rectangle(400, 320, 560, 300, 0x172033, 1)
            .setDepth(201)
            .setStrokeStyle(2, 0xf59e0b);
        this.scene.add.text(400, 235, '¡VICTORIA!', {
            fontSize: '46px',
            color: '#facc15',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(202);
        this.scene.add.text(400, 295, `¡${winnerName} gana la partida!`, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(202);
        this.scene.add.text(400, 435, '← / → Seleccionar · ENTER Confirmar', {
            fontSize: '16px',
            color: '#cbd5e1'
        }).setOrigin(0.5).setDepth(202);

        this.gameOverKeys = {
            left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            enter: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
        };
        this.updateGameOverSelection();
    }

    createGameOverButton(x, y, label, action) {
        const button = this.scene.add.text(x, y, label, {
            fontSize: '20px',
            color: '#22c55e',
            backgroundColor: '#0f172a',
            padding: { x: 14, y: 10 }
        }).setOrigin(0.5)
            .setDepth(203)
            .setInteractive({ useHandCursor: true })
            .setData('gameOverAction', action)
            .on('pointerover', () => {
                this.selectedGameOverIndex = this.gameOverButtons.indexOf(button);
                this.updateGameOverSelection();
            })
            .on('pointerdown', () => this.activateGameOverButton(button));
        return button;
    }

    updateGameOver() {
        const { left, right, up, down, enter } = this.gameOverKeys;
        if (Phaser.Input.Keyboard.JustDown(left) ||
            Phaser.Input.Keyboard.JustDown(right) ||
            Phaser.Input.Keyboard.JustDown(up) ||
            Phaser.Input.Keyboard.JustDown(down)) {
            this.selectedGameOverIndex = 1 - this.selectedGameOverIndex;
            this.updateGameOverSelection();
        }

        if (Phaser.Input.Keyboard.JustDown(enter)) {
            this.activateGameOverButton(this.gameOverButtons[this.selectedGameOverIndex]);
        }
    }

    updateGameOverSelection() {
        this.gameOverButtons.forEach((button, index) => {
            const selected = index === this.selectedGameOverIndex;
            button.setColor(selected ? '#facc15' : '#22c55e');
            button.setScale(selected ? 1.08 : 1);
        });
    }

    activateGameOverButton(button) {
        if (this.scene.audioManager) {
            this.scene.audioManager.playSFX('hit_sfx', { volume: 0.25 });
        }
        button.getData('gameOverAction')();
    }
}