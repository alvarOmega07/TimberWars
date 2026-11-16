import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey = 'player_sprite') {
        super(scene, x, y, textureKey);

        // Añadir a la escena y activar físicas
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setBounce(0.1);
        this.setCollideWorldBounds(true);

        this.facing = 'right';
        this.cursors = scene.input.keyboard.createCursorKeys();
    }

    update() {
        // Movimiento Horizontal
        if (this.cursors.left.isDown) {
            this.setVelocityX(-160);
            this.facing = 'left';
            this.setFlipX(true); // Invierte la imagen horizontalmente cuando mira a la izquierda
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(160);
            this.facing = 'right';
            this.setFlipX(false); // Orientación original hacia la derecha
        } else {
            this.setVelocityX(0);
        }

        // Salto
        if (this.cursors.up.isDown && this.body.blocked.down) {
            this.setVelocityY(-350);
        }
    }
}