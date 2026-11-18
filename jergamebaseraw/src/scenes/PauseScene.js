import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    create() {
        // Fondo semitransparente
        this.add.rectangle(400, 320, 800, 640, 0x0f172a, 0.92);
        this.add.rectangle(400, 320, 420, 460, 0x172033, 1).setStrokeStyle(2, 0x334155);
        this.selectedIndex = 0;

        // Título
        this.add.text(400, 150, 'JUEGO EN PAUSA', {
            fontSize: '44px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Botón Resume
        const resumeBtn = this.createMenuButton(400, 300, 'CONTINUAR', () => this.resumeGame());
        const optionsBtn = this.createMenuButton(400, 370, 'AJUSTES', () => {
            this.openOptions();
        });

        // Botón Menu
        const menuBtn = this.createMenuButton(400, 440, 'MENÚ PRINCIPAL', () => {
            this.scene.stop('GameScene');
            this.scene.stop();
            this.scene.start('MenuScene');
        });

        this.menuItems = [resumeBtn, optionsBtn, menuBtn];
        this.updateSelection();

        // Capturar tecla ESC dentro de PauseScene para despausar también con teclado
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.cursorUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.cursorDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.cursorEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    update() {
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
            this.menuItems[this.selectedIndex].getData('menuAction')();
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
            .on('pointerdown', callback);
        return button;
    }

    updateSelection() {
        if (!this.menuItems) return;
        this.menuItems.forEach((item, index) => {
            item.setText(index === this.selectedIndex ? `> ${item.text.replace(/^> /, '')}` : item.text.replace(/^> /, ''));
            item.setColor(index === this.selectedIndex ? '#ffff00' : '#00ff00');
        });
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
}