export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.playerHudTexts = null;
        this.reloadBars = null;
        this.scores = [0, 0];
        this.players = [];
        this.roundMessage = null;
        this.countdownText = null;
    }

    createUI() {
        const hudStyle = {
            fontSize: '16px',
            fontStyle: 'bold',
            backgroundColor: '#0f172acc',
            padding: { x: 12, y: 8 },
            lineSpacing: 4
        };
        this.playerHudTexts = [
            this.scene.add.text(16, 624, '', {
                ...hudStyle,
                color: '#bfdbfe'
            }).setOrigin(0, 1).setDepth(50),
            this.scene.add.text(784, 624, '', {
                ...hudStyle,
                color: '#fecaca',
                align: 'right'
            }).setOrigin(1, 1).setDepth(50)
        ];
        const reloadBarWidth = 210;
        this.reloadBars = [
            { x: 16, color: 0x60a5fa },
            { x: 574, color: 0xf87171 }
        ].map(({ x, color }) => {
            const background = this.scene.add.rectangle(x, 566, reloadBarWidth, 6, 0x334155)
                .setOrigin(0, 0.5)
                .setDepth(49)
                .setVisible(false);
            const fill = this.scene.add.rectangle(x, 566, reloadBarWidth, 6, color)
                .setOrigin(0, 0.5)
                .setDepth(50)
                .setScale(0, 1)
                .setVisible(false);
            return { background, fill };
        });

        this.roundMessage = this.scene.add.text(400, 88, '', {
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
        this.updatePlayerHud();
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
        this.scores = [...scores];
        this.updatePlayerHud();
    }

    updateAmmo(players) {
        if (!players) return;
        this.players = players;
        this.updatePlayerHud();
        this.updateReloadProgress(players);
    }

    updateReloadProgress(players) {
        if (!this.reloadBars || !players) return;

        this.reloadBars.forEach(({ background, fill }, index) => {
            const weapon = players[index]?.weapon;
            if (!weapon || !weapon.isReloading || weapon.reloadStartedAt === null) {
                background.setVisible(false);
                fill.setVisible(false);
                fill.setScale(0, 1);
                return;
            }

            const progress = Math.max(0, Math.min(1,
                (this.scene.time.now - weapon.reloadStartedAt) / weapon.reloadTime));
            background.setVisible(true);
            fill.setVisible(true);
            fill.setScale(progress, 1);
        });
    }

    updatePlayerHud() {
        if (!this.playerHudTexts) return;

        this.playerHudTexts.forEach((hud, index) => {
            const player = this.players[index];
            let ammo = '—';
            if (player && player.weapon) {
                ammo = player.weapon.isReloading
                    ? 'RECARGANDO'
                    : `${player.weapon.currentAmmo}/${player.weapon.maxAmmoInMag}`;
            }
            hud.setText(`JUGADOR ${index + 1}\nPUNTOS: ${this.scores[index]}   MUNICIÓN: ${ammo}`);
        });
    }

    setMessage(text) {
        if (this.roundMessage) {
            this.scene.tweens.killTweensOf(this.roundMessage);
            this.roundMessage.setText(text);
            this.roundMessage.setScale(0.7);
            this.roundMessage.setAlpha(1);
            this.scene.tweens.add({
                targets: this.roundMessage,
                scaleX: 1,
                scaleY: 1,
                duration: 300,
                ease: 'Back.easeOut'
            });
        }
    }

    clearMessage() {
        if (this.roundMessage) {
            this.scene.tweens.killTweensOf(this.roundMessage);
            this.roundMessage.setText('');
            this.roundMessage.setScale(1);
            this.roundMessage.setAlpha(1);
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
        this.scene.add.rectangle(400, 172, 560, 4, 0xf59e0b).setDepth(202);
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
            color: '#e2e8f0',
            backgroundColor: '#1e293b',
            padding: { x: 16, y: 10 },
            fontStyle: 'bold'
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
            button.setColor(selected ? '#facc15' : '#e2e8f0');
            button.setStroke('#f59e0b', selected ? 2 : 0);
            button.setScale(selected ? 1.05 : 1);
        });
    }

    activateGameOverButton(button) {
        if (this.scene.audioManager) {
            this.scene.audioManager.playSFX('hit_sfx', { volume: 0.25 });
        }
        button.getData('gameOverAction')();
    }
}