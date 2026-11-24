import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.audio('background_music', 'assets/audio/music.mp3');
        this.load.audio('hit_sfx', 'assets/audio/hit.mp3');
        this.load.audio('pistol_sfx', 'assets/audio/pistol_sfx.wav');
        this.load.audio('shotgun_sfx', 'assets/audio/shotgun_sfx.wav');
    }

    create() {
        this.cameras.main.setBackgroundColor('#080e1a');
        this.selectedIndex = 0;

        this.add.rectangle(400, 320, 800, 640, 0x080e1a);
        this.add.rectangle(400, 320, 748, 568, 0x111c2f).setStrokeStyle(2, 0x334155);
        this.add.rectangle(400, 37, 748, 4, 0xf59e0b);
        this.add.rectangle(414, 320, 2, 470, 0x334155);

        this.add.text(84, 220, 'TIMBER', {
            fontSize: '64px',
            color: '#f8fafc',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.add.text(84, 286, 'WARS', {
            fontSize: '64px',
            color: '#f59e0b',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.add.rectangle(84, 347, 235, 3, 0xf59e0b).setOrigin(0, 0.5);
        this.add.text(84, 382, 'DUELO LOCAL · 2 JUGADORES', {
            fontSize: '16px',
            color: '#cbd5e1',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.add.text(84, 500, 'DESARROLLADO POR', {
            fontSize: '13px',
            color: '#94a3b8',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        this.add.text(84, 528, 'Hugo Martínez · Leo Lin\nÁlvaro Ruiz · Raúl Núñez', {
            fontSize: '14px',
            color: '#e2e8f0',
            lineSpacing: 4
        }).setOrigin(0, 0.5);

        this.add.text(592, 153, 'MENÚ PRINCIPAL', {
            fontSize: '24px',
            color: '#f8fafc',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(592, 184, 'Elige una opción para continuar', {
            fontSize: '14px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        const playBtn = this.createMenuButton(592, 260, 'JUGAR', () => this.scene.start('GameScene'));
        const optionsBtn = this.createMenuButton(592, 340, 'AJUSTES', () => this.scene.start('OptionsScene', { returnScene: 'MenuScene' }));
        const controlsBtn = this.createMenuButton(592, 420, 'CONTROLES', () => this.scene.start('ControlsScene', { returnScene: 'MenuScene' }));
        this.menuItems = [playBtn, optionsBtn, controlsBtn];
        this.add.text(592, 505, '↑ / ↓ ELEGIR    ENTER CONFIRMAR', {
            fontSize: '13px',
            color: '#94a3b8'
        }).setOrigin(0.5);
        this.updateSelection();

        this.cursorUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.cursorDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.cursorEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    createMenuButton(x, y, label, callback) {
        const button = this.add.text(x, y, label, {
            fontSize: '25px',
            color: '#e2e8f0',
            backgroundColor: '#1e293b',
            padding: { x: 24, y: 12 },
            fontStyle: 'bold'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setData('menuAction', callback)
            .setData('menuLabel', label)
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
            const selected = index === this.selectedIndex;
            item.setText(`${selected ? '› ' : ''}${item.getData('menuLabel')}`);
            item.setColor(selected ? '#facc15' : '#e2e8f0');
            item.setStroke('#f59e0b', selected ? 2 : 0);
            item.setScale(selected ? 1.05 : 1);
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
