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
        this.settingRows = [];

        this.add.rectangle(400, 320, 800, 640, 0x080e1a, 0.94);
        this.add.rectangle(400, 320, 640, 560, 0x111c2f).setStrokeStyle(2, 0x475569);
        this.add.rectangle(400, 42, 640, 4, 0xf59e0b);

        this.add.text(400, 88, 'AJUSTES', {
            fontSize: '42px',
            color: '#f8fafc',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(400, 125, 'Personaliza tu experiencia de juego', {
            fontSize: '15px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        this.createSettingRow(0, 220, 'Música');
        this.createSettingRow(1, 295, 'Efectos');
        this.fullscreenText = this.add.text(560, 370, this.fullscreen ? 'ACTIVADA' : 'DESACTIVADA', {
            fontSize: '16px',
            color: '#e2e8f0',
            backgroundColor: '#1e293b',
            padding: { x: 16, y: 9 },
            fontStyle: 'bold'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.toggleFullscreen())
            .on('pointerover', () => this.fullscreenText.setColor('#facc15'))
            .on('pointerout', () => this.fullscreenText.setColor('#e2e8f0'));
        this.fullscreenLabel = this.add.text(220, 370, 'Pantalla completa', {
            fontSize: '20px',
            color: '#cbd5e1'
        }).setOrigin(0.5);

        this.resetButton = this.createTextButton(400, 455, 'RESTABLECER', () => this.resetSettings());
        this.backButton = this.createTextButton(400, 520, 'VOLVER', () => this.goBack());
        this.add.text(400, 575, '↑ / ↓ ELEGIR    ← / → AJUSTAR    ENTER CONFIRMAR    ESC VOLVER', {
            fontSize: '12px',
            color: '#94a3b8'
        }).setOrigin(0.5);
        this.optionItems = [this.fullscreenLabel, this.resetButton, this.backButton];
        this.selectionMarker = this.add.rectangle(400, 220, 530, 62, 0xf59e0b, 0.06)
            .setStrokeStyle(2, 0xf59e0b);

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

    createTextButton(x, y, label, callback) {
        const button = this.add.text(x, y, label, {
            fontSize: '19px',
            color: '#e2e8f0',
            backgroundColor: '#1e293b',
            padding: { x: 20, y: 9 },
            fontStyle: 'bold'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', callback)
            .on('pointerover', () => button.setColor('#facc15'))
            .on('pointerout', () => button.setColor('#e2e8f0'));
        return button;
    }

    createSettingRow(index, y, label) {
        this.add.rectangle(400, y, 530, 58, 0x1e293b).setStrokeStyle(1, 0x334155);
        this.add.text(190, y, label, {
            fontSize: '20px',
            color: '#cbd5e1',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.createTextButton(420, y, '−', () => this.changeVolume(index, -0.1));
        this.createTextButton(620, y, '+', () => this.changeVolume(index, 0.1));

        const initialVolume = index === 0 ? this.musicVolume : this.effectsVolume;
        const valueText = this.add.text(520, y, `${Math.round(initialVolume * 100)}%`, {
            fontSize: '20px',
            color: '#fbbf24',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const row = { index, valueText };
        if (!this.settingRows) this.settingRows = [];
        this.settingRows.push(row);
    }

    changeVolume(index, amount) {
        if (!this.settingRows || !this.settingRows[index]) return;

        // Actualizar los valores numéricos
        if (index === 0) {
            this.musicVolume = Math.max(0, Math.min(1, parseFloat((this.musicVolume + amount).toFixed(1))));
        } else {
            this.effectsVolume = Math.max(0, Math.min(1, parseFloat((this.effectsVolume + amount).toFixed(1))));
        }
        
        // Actualizar el texto en pantalla en vivo
        this.updateRowValue(this.settingRows[index]);
        
        // Notificar cambios al sistema de audio y guardar en localStorage
        this.applyAudioSettings();
        this.saveSettings();

        // Reproducir feedback de sonido si se ajustan los efectos
        if (index === 1 && this.effectsVolume > 0 && this.cache.audio.exists('hit_sfx')) {
            this.sound.play('hit_sfx', { volume: this.effectsVolume });
        }
    }

    updateRowValue(row) {
        if (!row || !row.valueText) return;

        const value = row.index === 0 ? this.musicVolume : this.effectsVolume;
        // Forzar la actualización del texto en vivo
        row.valueText.setText(`${Math.round(value * 100)}%`);
    }

    toggleFullscreen() {
        this.fullscreen = !this.fullscreen;
        this.fullscreenText.setText(this.fullscreen ? 'ACTIVADA' : 'DESACTIVADA');
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
    
    // Actualizar en vivo las etiquetas del porcentaje
    if (this.settingRows) {
        this.settingRows.forEach(row => this.updateRowValue(row));
    }
    
    this.fullscreenText.setText('DESACTIVADA');
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
        this.game.events.emit('audio-settings-changed', {
            musicVolume: this.musicVolume,
            effectsVolume: this.effectsVolume
        });
    }

    updateSelection() {
        if (!this.selectionMarker || !this.settingRows) return;

        const yPositions = [220, 295, 370, 455, 520];
        this.selectionMarker.setPosition(400, yPositions[this.selectedIndex]);
        this.selectionMarker.setSize(this.selectedIndex < 3 ? 530 : 300, this.selectedIndex < 3 ? 62 : 54);
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
