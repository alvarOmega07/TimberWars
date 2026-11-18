import Phaser from 'phaser';

export class OptionsScene extends Phaser.Scene {
    constructor() {
        super('OptionsScene');
    }

    create(data = {}) {
        this.musicVolume = this.readVolume('musicVolume', 0.6);
        this.effectsVolume = this.readVolume('effectsVolume', 0.8);
        this.fullscreen = localStorage.getItem('fullscreen') === 'true';
        this.returnScene = data.returnScene || 'MenuScene';
        this.selectedIndex = 0;

        this.add.rectangle(400, 320, 800, 640, 0x0f172a, 0.88);
        this.add.rectangle(400, 320, 640, 540, 0x172033).setStrokeStyle(2, 0x334155);

        this.add.text(400, 70, 'AJUSTES', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.createSettingRow(0, 210, 'Música');
        this.createSettingRow(1, 280, 'Efectos');
        this.fullscreenText = this.add.text(520, 350, this.fullscreen ? 'Sí' : 'No', {
            fontSize: '28px',
            color: '#f59e0b'
        }).setOrigin(0.5);
        this.fullscreenLabel = this.add.text(290, 350, 'Pantalla completa', {
            fontSize: '28px',
            color: '#cbd5e1'
        }).setOrigin(0.5);

        this.resetButton = this.createTextButton(400, 430, 'RESTABLECER', () => this.resetSettings());
        this.backButton = this.createTextButton(400, 500, 'VOLVER', () => this.goBack());
        this.optionItems = [this.fullscreenLabel, this.resetButton, this.backButton];
        this.selectionMarker = this.add.rectangle(400, 210, 360, 52, 0xfacc15, 0.12).setStrokeStyle(2, 0xfacc15);

        this.keys = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            enter: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
            escape: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        };

        this.applyAudioSettings();
        this.updateSelection();
    }

    readVolume(key, fallback) {
        const value = localStorage.getItem(key);
        return value === null ? fallback : Math.max(0, Math.min(1, parseFloat(value) || 0));
    }

    createSettingRow(index, y, label) {
        const labelText = this.add.text(290, y, label, {
            fontSize: '28px',
            color: '#cbd5e1'
        }).setOrigin(0.5);

        const minus = this.createTextButton(430, y, '-', () => this.changeVolume(index, -0.1));
        const plus = this.createTextButton(610, y, '+', () => this.changeVolume(index, 0.1));
        const valueText = this.add.text(520, y, '', {
            fontSize: '28px',
            color: '#f59e0b'
        }).setOrigin(0.5);

        const row = { index, labelText, minus, plus, valueText };
        if (!this.settingRows) this.settingRows = [];
        this.settingRows.push(row);
        this.updateRowValue(row);
    }

    createTextButton(x, y, label, callback) {
        const button = this.add.text(x, y, label, {
            fontSize: '28px',
            color: '#22c55e',
            backgroundColor: '#111827',
            padding: { x: 14, y: 8 }
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', callback)
            .on('pointerover', () => button.setAlpha(0.75))
            .on('pointerout', () => button.setAlpha(1))
        return button;
    }

    changeVolume(index, amount) {
        if (index === 0) {
            this.musicVolume = Math.max(0, Math.min(1, parseFloat((this.musicVolume + amount).toFixed(1))));
        } else {
            this.effectsVolume = Math.max(0, Math.min(1, parseFloat((this.effectsVolume + amount).toFixed(1))));
        }
        this.updateRowValue(this.settingRows[index]);
        this.applyAudioSettings();
        this.saveSettings();
    }

    updateRowValue(row) {
        const value = row.index === 0 ? this.musicVolume : this.effectsVolume;
        row.valueText.setText(`${Math.round(value * 100)}%`);
    }

    toggleFullscreen() {
        this.fullscreen = !this.fullscreen;
        this.fullscreenText.setText(this.fullscreen ? 'Sí' : 'No');
        if (this.fullscreen) {
            if (!this.scale.isFullscreen) this.scale.startFullscreen();
        } else if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        }
        this.saveSettings();
    }

    resetSettings() {
        this.musicVolume = 0.6;
        this.effectsVolume = 0.8;
        this.fullscreen = false;
        this.settingRows.forEach(row => this.updateRowValue(row));
        this.fullscreenText.setText('No');
        if (this.scale.isFullscreen) this.scale.stopFullscreen();
        this.saveSettings();
        this.applyAudioSettings();
    }

    saveSettings() {
        localStorage.setItem('musicVolume', this.musicVolume);
        localStorage.setItem('effectsVolume', this.effectsVolume);
        localStorage.setItem('fullscreen', this.fullscreen);
    }

    applyAudioSettings() {
        if (this.sound) this.sound.volume = this.effectsVolume;
        this.sound?.setMute(this.effectsVolume === 0);
    }

    updateSelection() {
        if (!this.selectionMarker || !this.settingRows) return;

        const yPositions = [210, 280, 350, 430, 500];
        this.selectionMarker.setPosition(400, yPositions[this.selectedIndex]);
        this.selectionMarker.setSize(this.selectedIndex < 2 ? 360 : 300, 52);
    }

    goBack() {
        this.saveSettings();
        if (this.returnScene === 'PauseScene') {
            this.scene.stop();
            this.scene.wake('PauseScene');
        } else {
            this.scene.start('MenuScene');
        }
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keys.escape)) {
            this.goBack();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.up)) {
            this.selectedIndex = (this.selectedIndex - 1 + 5) % 5;
            this.updateSelection();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.down)) {
            this.selectedIndex = (this.selectedIndex + 1) % 5;
            this.updateSelection();
        }
        if (this.selectedIndex < 2) {
            if (Phaser.Input.Keyboard.JustDown(this.keys.left)) this.changeVolume(this.selectedIndex, -0.1);
            if (Phaser.Input.Keyboard.JustDown(this.keys.right)) this.changeVolume(this.selectedIndex, 0.1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.enter)) {
            if (this.selectedIndex === 2) this.toggleFullscreen();
            if (this.selectedIndex === 3) this.resetSettings();
            if (this.selectedIndex === 4) this.goBack();
        }
    }
}
