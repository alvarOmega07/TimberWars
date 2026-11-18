import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    create() {
        this.add.rectangle(400, 320, 800, 640, 0x0f172a, 0.92);
        this.add.rectangle(400, 320, 440, 520, 0x172033, 1).setStrokeStyle(2, 0x334155);
        this.selectedIndex = 0;
        this.confirmActive = false;

        this.add.text(400, 135, 'JUEGO EN PAUSA', {
            fontSize: '44px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const resumeBtn = this.createMenuButton(400, 245, 'CONTINUAR', () => this.resumeGame());
        const optionsBtn = this.createMenuButton(400, 315, 'AJUSTES', () => this.openOptions());
        const controlsBtn = this.createMenuButton(400, 385, 'CONTROLES', () => this.openControls());
        const menuBtn = this.createMenuButton(400, 455, 'MENÚ PRINCIPAL', () => this.showExitConfirmation());
        this.menuItems = [resumeBtn, optionsBtn, controlsBtn, menuBtn];
        this.updateSelection();
        this.createExitConfirmation();

        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.cursorUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.cursorDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.cursorLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.cursorRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.cursorEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
        if (this.confirmActive) {
            this.updateExitConfirmation();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.resumeGame();
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursorUp)) {
            this.selectedIndex = (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length;
            this.updateSelection();
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursorDown)) {
            this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
            this.updateSelection();
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursorEnter)) {
            this.activateButton(this.menuItems[this.selectedIndex]);
        }
    }

    createMenuButton(x, y, label, callback) {
        const button = this.add.text(x, y, label, {
            fontSize: '32px',
            color: '#00ff00'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setData('menuAction', callback)
            .on('pointerover', () => {
                this.selectedIndex = this.menuItems.indexOf(button);
                this.updateSelection();
            })
            .on('pointerdown', () => this.activateButton(button));
        return button;
    }

    activateButton(button) {
        this.playUiSound();
        button.getData('menuAction')();
    }

    playUiSound() {
        const storedVolume = localStorage.getItem('effectsVolume');
        const effectsVolume = storedVolume === null ? 0.8 : Number(storedVolume);
        if (effectsVolume > 0 && this.cache.audio.exists('hit_sfx')) {
            this.sound.play('hit_sfx', { volume: effectsVolume * 0.25 });
        }
    }

    updateSelection() {
        if (!this.menuItems) return;
        this.menuItems.forEach((item, index) => {
            item.setText(index === this.selectedIndex ? `> ${item.text.replace(/^> /, '')}` : item.text.replace(/^> /, ''));
            item.setColor(index === this.selectedIndex ? '#ffff00' : '#00ff00');
        });
    }

    createExitConfirmation() {
        this.exitOverlay = this.add.rectangle(400, 320, 800, 640, 0x020617, 0.78)
            .setInteractive()
            .setVisible(false);
        this.exitPanel = this.add.rectangle(400, 320, 500, 250, 0x172033, 1)
            .setStrokeStyle(2, 0xf59e0b)
            .setVisible(false);
        this.exitTitle = this.add.text(400, 260, '¿Volver al menú?', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false);
        this.exitMessage = this.add.text(400, 310, 'La partida actual se cerrará.', {
            fontSize: '20px',
            color: '#cbd5e1'
        }).setOrigin(0.5).setVisible(false);

        this.confirmButtons = [
            this.createConfirmButton(300, 385, 'SALIR', () => this.leaveToMenu()),
            this.createConfirmButton(500, 385, 'SEGUIR', () => this.hideExitConfirmation())
        ];
        this.confirmButtons.forEach(button => button.setVisible(false));
        this.confirmSelection = 1;
    }

    createConfirmButton(x, y, label, callback) {
        const button = this.add.text(x, y, label, {
            fontSize: '24px',
            color: '#22c55e',
            backgroundColor: '#0f172a',
            padding: { x: 14, y: 8 }
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setData('confirmAction', callback)
            .on('pointerover', () => {
                this.confirmSelection = this.confirmButtons.indexOf(button);
                this.updateConfirmSelection();
            })
            .on('pointerdown', () => button.getData('confirmAction')());
        return button;
    }

    showExitConfirmation() {
        this.confirmActive = true;
        [this.exitOverlay, this.exitPanel, this.exitTitle, this.exitMessage, ...this.confirmButtons]
            .forEach(item => item.setVisible(true));
        this.updateConfirmSelection();
    }

    hideExitConfirmation() {
        this.confirmActive = false;
        [this.exitOverlay, this.exitPanel, this.exitTitle, this.exitMessage, ...this.confirmButtons]
            .forEach(item => item.setVisible(false));
    }

    updateConfirmSelection() {
        this.confirmButtons.forEach((button, index) => {
            button.setColor(index === this.confirmSelection ? '#facc15' : '#22c55e');
            button.setScale(index === this.confirmSelection ? 1.08 : 1);
        });
    }

    updateExitConfirmation() {
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.hideExitConfirmation();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursorLeft) ||
            Phaser.Input.Keyboard.JustDown(this.cursorRight) ||
            Phaser.Input.Keyboard.JustDown(this.cursorUp) ||
            Phaser.Input.Keyboard.JustDown(this.cursorDown)) {
            this.confirmSelection = 1 - this.confirmSelection;
            this.updateConfirmSelection();
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursorEnter)) {
            this.confirmButtons[this.confirmSelection].getData('confirmAction')();
        }
    }

    resumeGame() {
        const gameScene = this.scene.get('GameScene');
        if (gameScene && gameScene.changeState) {
            gameScene.changeState('PLAYING');
        } else {
            this.scene.stop();
            this.scene.resume('GameScene');
        }
    }

    openOptions() {
        this.scene.launch('OptionsScene', { returnScene: 'PauseScene' });
        this.scene.sleep();
        this.scene.bringToTop('OptionsScene');
    }

    openControls() {
        this.scene.launch('ControlsScene', { returnScene: 'PauseScene' });
        this.scene.sleep();
        this.scene.bringToTop('ControlsScene');
    }

    leaveToMenu() {
        this.scene.stop('GameScene');
        this.scene.stop();
        this.scene.start('MenuScene');
    }
}