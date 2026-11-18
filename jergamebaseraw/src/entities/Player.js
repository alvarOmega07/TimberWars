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
        this.weapon = null;

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.keySpace = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyQ = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    }

    tryPickUp(nearbyObject) {
        // Si no hay objeto cerca o ya fue recogido, no hace nada
        if (!nearbyObject || nearbyObject.isPickedUp) return;

        // Solo cuando el usuario pulsa E, "despierta" el método del arma
        if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
            nearbyObject.onPickUp(this);
        }
    }

    update(nearbyObject) {
       this.move();
       this.tryPickUp(nearbyObject);
       this.useWeapon();
    }

    equipWeapon(weapon){
        this.weapon = weapon;
        console.log('[Player] Arma equipada correctamente.');
    }

    unequipWeapon(){
        this.weapon = null;
        console.log('[Player] Arma desequipada correctamente.');
    }

    getWeapon() {
        return this.weapon !== null;
    }

    useWeapon(){
        if (!this.getWeapon()) return;

        // Disparar con barra espaciadora
        if (this.keySpace.isDown) {
            this.weapon.shoot();
        }

        // Tirar / Soltar arma al suelo con Q
        if (Phaser.Input.Keyboard.JustDown(this.keyQ)) {
            this.weapon.drop();
        }
    }

    move() {
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