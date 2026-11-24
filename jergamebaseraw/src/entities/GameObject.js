import Phaser from 'phaser';

export class GameObject extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey) {
        super(scene, x, y, textureKey);

        // Añadir a la escena y activar físicas de Arcade
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.isPickedUp = false;
    }

    onPickUp(player) {
        if (this.isPickedUp) return;
        
        this.isPickedUp = true;
        this.setVisible(false);
        this.setActive(false);
        if (this.body) this.body.enable = false; // Desactivar cuerpo físico en el suelo
    }
}