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
}