import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.audio('background_music', 'assets/audio/music.mp3');
        this.load.audio('hit_sfx', 'assets/audio/hit.mp3');
    }

    create() {
        this.cameras.main.setBackgroundColor('#111827');
        this.selectedIndex = 0;

        this.add.rectangle(400, 320, 800, 640, 0x0f172a);
        this.add.rectangle(400, 320, 760, 600, 0x172033, 0.0).setStrokeStyle(2, 0x334155);
        this.add.rectangle(460, 320, 8, 520, 0xf59e0b).setOrigin(0.5);

        this.add.text(40, 72, 'TIMBER', {
            fontSize: '68px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.add.text(40, 132, 'WARS', {
            fontSize: '68px',
            color: '#f59e0b',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.add.text(40, 190, 'Aventura local', {
            fontSize: '18px',
            color: '#94a3b8'
        }).setOrigin(0, 0.5);

        this.add.text(40, 430, 'CONTROLES', {
            fontSize: '20px',
            color: '#f59e0b',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.add.text(40, 470, '← / →   Mover\n↑         Saltar\nESC      Pausar', {
            fontSize: '18px',
            color: '#cbd5e1',
            lineSpacing: 10
        }).setOrigin(0, 0.5);

        this.add.text(40, 570, 'CRÉDITOS', {
            fontSize: '16px',
            color: '#64748b',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.add.text(40, 600, 'Hugo Martínez · Leo Lin\nÁlvaro Ruiz · Raúl Núñez', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        const playBtn = this.createMenuButton(620, 270, 'JUGAR', () => this.scene.start('GameScene'));
        const optionsBtn = this.createMenuButton(620, 345, 'AJUSTES', () => this.scene.start('OptionsScene', { returnScene: 'MenuScene' }));
        const controlsBtn = this.createMenuButton(620, 420, 'CONTROLES', () => this.scene.start('ControlsScene', { returnScene: 'MenuScene' }));
        this.menuItems = [playBtn, optionsBtn, controlsBtn];
        this.add.text(620, 515, '↑ / ↓ Seleccionar · ENTER Confirmar', {
            fontSize: '16px',
            color: '#94a3b8'
        }).setOrigin(0.5);
        this.updateSelection();

        this.cursorUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.cursorDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.cursorEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
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
        const effectsVolume = Number(localStorage.getItem('effectsVolume') ?? 0.8);
        if (this.cache.audio.exists('hit_sfx') && effectsVolume > 0) {
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

    update() {
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
}
