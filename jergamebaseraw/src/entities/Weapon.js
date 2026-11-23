import { GameObject } from "./GameObject.js";

export class Weapon extends GameObject {
    constructor(scene, x, y, textureKey, config = {}) {
        super(scene, x, y, textureKey);

        this.setOrigin(0.5, 0.5);
        this.clearTint();

        this.maxAmmoInMag = config.maxAmmoInMag || 6;
        this.currentAmmo = this.maxAmmoInMag;
        this.fireRate = config.fireRate || 250;
        this.reloadTime = config.reloadTime || 1500;
        this.bulletSpeed = config.bulletSpeed || 400;

        this.lastFired = 0;
        this.owner = null;
        this.displayOwner = null; // Referencia al display que la contenía
        this.setDrag(150);

        

        this.bulletsGroup = scene.physics.add.group();

        if (scene.capaSuelo) {
            scene.physics.add.collider(this.bulletsGroup, scene.capaSuelo, (bullet) => {
                bullet.destroy();
            });
        }
    }

    onPickUp(player) {
        if (this.isPickedUp) return;

        super.onPickUp(player);
        this.owner = player;

        // Avisar al display de que el pedestal ha quedado libre
        if (this.displayOwner) {
            this.displayOwner.onPickedUp();
            this.displayOwner = null;
        }

        player.equipWeapon(this);
    }

    shoot() {
        if (!this.isPickedUp || !this.owner) return;
        if (this.currentAmmo <= 0) return;

        const time = this.scene.time.now;
        if (time < this.lastFired) return;

        this.currentAmmo--;
        this.lastFired = time + this.fireRate;

        this.onShoot();
    }

    onShoot() {
        console.warn("[Weapon] onShoot() no ha sido implementado en la clase hija.");
    }

    drop() {
        if (!this.isPickedUp || !this.owner) return;

        const player = this.owner;

        this.setPosition(player.x, player.y);
        this.setVisible(true);
        this.setActive(true);

        if (this.body) {
            if (this.owner.facing === 'left') {
                this.setFlipX(true);
            } else {
                this.setFlipX(false);
            }

            this.setSize(8, 8);
            this.body.enable = true;
            this.body.reset(player.x, player.y);
            this.setDragX(100);

            const dropImpulseX = (player.facing === 'right') ? 100 : -100;
            this.setVelocity(dropImpulseX, -100);
        }

        this.isPickedUp = false;
        this.owner = null;
        player.unequipWeapon();

        console.log('[Arma] Soltada en el suelo.');
    }

    resetTo(x, y) {
        if (this.owner) {
            this.owner.unequipWeapon();
        }

        this.bulletsGroup.clear(true, true);
        this.owner = null;
        this.isPickedUp = false;
        this.displayOwner = null;
        this.setPosition(x, y);
        this.setVisible(true);
        this.setActive(true);

        if (this.body) {
            this.body.enable = true;
            this.body.reset(x, y);
            this.setVelocity(0, 0);
        }
    }
}