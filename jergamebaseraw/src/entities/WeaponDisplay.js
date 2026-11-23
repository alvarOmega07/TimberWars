import Phaser from 'phaser';

export class WeaponDisplay extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, weapon, respawnDelay = 6000) {
        // Asignar textura del display o usar dummy como respaldo
        const displayTexture = scene.textures.exists('Display') ? 'Display' : 'bullet_dummy';
        super(scene, x, y, displayTexture);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        this.displayTexture = displayTexture;
        this.respawnTime = respawnDelay;
        this.currentWeapon = null;
        this.isOccupied = false;

        // Guardar la clase del arma (Pistola o Escopeta) y la clave de la textura para los respawns
        this.WeaponClass = weapon.constructor;
        this.weaponTextureKey = weapon.texture.key;

        // Montar el arma inicial
        this.spawnWeapon(weapon);
    }

    spawnWeapon(weapon) {
        if(this.isOccupied == true) return;
        this.currentWeapon = weapon;
        this.isOccupied = true;

        // Posicionar el arma física justo encima de la base del display
        this.currentWeapon.setPosition(this.x, this.y - 2);
        this.currentWeapon.displayOwner = this;

        // Restaurar textura activa
        if (this.scene.textures.exists(this.displayTexture)) {
            this.setTexture(this.displayTexture);
        }
        this.clearTint();
    }

    onPickedUp() {
        this.isOccupied = false;
        this.currentWeapon = null;

        // Tinte de base vacía
        if (this.scene.textures.exists('display_empty')) {
            this.setTexture('display_empty');
        } else {
            this.setTint(0x555555);
        }

        // Programar el respawn tras transcurrir respawnTime
        this.scene.time.delayedCall(this.respawnTime, () => {
            if (this.scene && this.scene.sys.isActive()) {
                this.respawnWeapon();
            }
        });
    }

    respawnWeapon() {
        if (!this.scene.weaponManager) return;

        // Instanciar de nuevo la misma clase de arma
        const newWeapon = new this.WeaponClass(this.scene, this.x, this.y - 12, this.weaponTextureKey);

        // Registrar físicas en el manager y acoplar al display
        this.scene.weaponManager.registerNewWeapon(newWeapon);
        this.spawnWeapon(newWeapon);
    }

    resetDisplay() {
        if (this.currentWeapon) {
            this.currentWeapon.destroy();
            this.currentWeapon = null;
        }

        const initialWeapon = new this.WeaponClass(this.scene, this.x, this.y - 12, this.weaponTextureKey);
        this.scene.weaponManager.registerNewWeapon(initialWeapon);
        this.spawnWeapon(initialWeapon);
    }
}