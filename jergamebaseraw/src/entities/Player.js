import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey = 'player_dummy', controls = {}) {
        super(scene, x, y, textureKey);

        // Añadir a la escena y activar físicas
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setBounce(0.1);
        this.setCollideWorldBounds(true);

        this.facing = 'right';
        this.weapon = null;
        this.isDead = false;

        const keyboard = scene.input.keyboard;
        this.moveKeys = controls.moveKeys || {
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            jump: Phaser.Input.Keyboard.KeyCodes.UP
        };
        this.keys = {
            left: keyboard.addKey(this.moveKeys.left),
            right: keyboard.addKey(this.moveKeys.right),
            jump: keyboard.addKey(this.moveKeys.jump),
            pickup: keyboard.addKey(controls.pickupKey || Phaser.Input.Keyboard.KeyCodes.E),
            shoot: keyboard.addKey(controls.shootKey || Phaser.Input.Keyboard.KeyCodes.SPACE),
            drop: keyboard.addKey(controls.dropKey || Phaser.Input.Keyboard.KeyCodes.Q)
        };
    }

    tryPickUp(nearbyObject) {
        // Si no hay objeto cerca o ya fue recogido, no hace nada
        if (!nearbyObject || nearbyObject.isPickedUp) return;

        // El jugador usa su tecla asignada para recoger el arma.
        if (Phaser.Input.Keyboard.JustDown(this.keys.pickup)) {
            if(this.getWeapon()){
            console.log('Ya hay un arma equipada');
            return;
            }
            nearbyObject.onPickUp(this);
        }
    }

    update(nearbyObject) {
       this.move();
       this.tryPickUp(nearbyObject);
       this.useWeapon();

    const limiteInferior = this.scene.mapManager?.map?.heightInPixels + 50 || 700;

    if (this.y > limiteInferior) {
        this.die();
    }
    }

    equipWeapon(weapon){
        this.weapon = weapon;
        console.log('[Player] Arma equipada correctamente.');
        this.scene.uiManager?.updateAmmo(this.scene.players);
    }

    unequipWeapon(){
        this.weapon = null;
        console.log('[Player] Arma desequipada correctamente.');
        this.scene.uiManager?.updateAmmo(this.scene.players);
    }

    getWeapon() {
        return this.weapon !== null;
    }

    useWeapon(){
        if (!this.getWeapon()) return;

        // Disparar con la tecla asignada al jugador.
        if (this.keys.shoot.isDown) {
            this.weapon.shoot();
        }

        // Tirar / soltar el arma con la tecla asignada al jugador.
        if (Phaser.Input.Keyboard.JustDown(this.keys.drop)) {
            this.weapon.drop();
        }
    }

    move() {
        // Movimiento Horizontal
        if (this.keys.left.isDown) {
            this.setVelocityX(-160);
            this.facing = 'left';
            this.setFlipX(true); // Invierte la imagen horizontalmente cuando mira a la izquierda
        } else if (this.keys.right.isDown) {
            this.setVelocityX(160);
            this.facing = 'right';
            this.setFlipX(false); // Orientación original hacia la derecha
        } else {
            this.setVelocityX(0);
        }

        // Salto
        if (this.keys.jump.isDown && this.body.blocked.down) {
            this.setVelocityY(-350);
        }
    }

    die(){
        if (this.isDead) return;
        this.isDead = true;
        this.scene.playerDied(this);
    }

}