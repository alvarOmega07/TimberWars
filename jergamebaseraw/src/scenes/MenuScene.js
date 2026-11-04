import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.add.text(20, 100, 'TimberWars', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0);

        this.add.text(50, 320, 'Creditos:', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        this.add.text(100, 400, 'Hugo Martínez\nLeo Lin\nÁlvaro Ruiz\nRaúl Nuñez', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        const localBtn = this.add.text(600, 320, 'Local Play', {
            fontSize: '32px',
            color: '#00ff00'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => localBtn.setStyle({ color: '#ffff00' }))
            .on('pointerout', () => localBtn.setStyle({ color: '#00ff00' }))
            .on('pointerdown', () => this.scene.start('GameScene'));

        const options = this.add.text(600, 380, 'Ajustes', {
            fontSize: '32px',
            color: '#00ff00'
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => options.setStyle({ color: '#ffff00' }))
            .on('pointerout', () => options.setStyle({ color: '#00ff00' }))
            .on('pointerdown', () => this.scene.start('OptionsScene'));    
    }
}
