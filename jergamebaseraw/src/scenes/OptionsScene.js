import Phaser from 'phaser';

export class OptionsScene extends Phaser.Scene {
    constructor() {
        super('OptionsScene');
    }

    create() {
        // Cargar valores guardados o usar valores por defecto
        this.soundVolume = parseFloat(localStorage.getItem('soundVolume')) || 0.8;

        // Título
        this.add.text(400, 80, 'AJUSTES', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // --- CONTROL DE EFECTOS (SFX) ---
        this.add.text(250, 270, 'Sonido', { fontSize: '28px', color: '#ffffff' });
        const soundText = this.add.text(550, 280, `${Math.round(this.soundVolume * 100)}%`, { fontSize: '28px', color: '#ffff00' }).setOrigin(0.5);

        const soundDown = this.createButton(480, 280, '-', () => {
            this.soundVolume = Math.max(0, parseFloat((this.soundVolume - 0.1).toFixed(1)));
            soundText.setText(`${Math.round(this.soundVolume * 100)}%`);
            this.updateAudioSettings();
        });

        const soundUp = this.createButton(620, 280, '+', () => {
            this.soundVolume = Math.min(1, parseFloat((this.soundVolume + 0.1).toFixed(1)));
            soundText.setText(`${Math.round(this.soundVolume * 100)}%`);
            this.updateAudioSettings();
        });

        // --- BOTÓN VOLVER ---
        const back = this.add.text(400, 500, 'Volver al Menú', {
            fontSize: '32px',
            color: '#00ff00'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => back.setStyle({ color: '#ffff00' }))
        .on('pointerout', () => back.setStyle({ color: '#00ff00' }))
        .on('pointerdown', () => {
            this.saveSettings();
            this.scene.start('MenuScene');
        });
    }

    // Botones de incremento/decremento
    createButton(x, y, text, callback) {
        const btn = this.add.text(x, y, text, {
            fontSize: '32px',
            color: '#00ff00',
            backgroundColor: '#333333',
            padding: { x: 12, y: 4 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => btn.setStyle({ color: '#ffff00' }))
        .on('pointerout', () => btn.setStyle({ color: '#00ff00' }))
        .on('pointerdown', callback);

        return btn;
    }

    // Ociones de audio
    saveSettings() {
        localStorage.setItem('soundVolume', this.soundVolume);
    }

    updateAudioSettings() {
        if (this.sound) {
            this.sound.volume = this.soundVolume;
        }
    }
}
