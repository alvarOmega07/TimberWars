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
        this.fireSoundKey = config.fireSoundKey || 'pistol_sfx';
        this.shotShake = config.shotShake || 0.0015;

        this.lastFired = 0;
        this.owner = null;
        this.displayOwner = null; // Referencia al display que la contenía
        this.isReloading = false;
        this.reloadTimer = null;
        this.reloadStartedAt = null;
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
        if (this.isReloading) return;
        if (this.currentAmmo <= 0) return;

        const time = this.scene.time.now;
        if (time < this.lastFired) return;

        this.currentAmmo--;
        this.lastFired = time + this.fireRate;
        this.scene.uiManager?.updateAmmo(this.scene.players);
        this.scene.audioManager?.playSFX(this.fireSoundKey, { volume: 0.55 });
        this.scene.cameras.main.shake(55, this.shotShake);

        this.onShoot();
    }

    showMuzzleFlash(x, y, color = 0xfde047, radius = 8) {
        const flash = this.scene.add.circle(x, y, radius, color, 0.95)
            .setDepth((this.owner?.depth || 0) + 1);
        this.scene.tweens.add({
            targets: flash,
            scaleX: 0.15,
            scaleY: 0.15,
            alpha: 0,
            duration: 100,
            ease: 'Cubic.easeOut',
            onComplete: () => flash.destroy()
        });
    }

    reload() {
        if (!this.isPickedUp || !this.owner || this.isReloading ||
            this.currentAmmo >= this.maxAmmoInMag) {
            return;
        }

        const owner = this.owner;
        this.isReloading = true;
        this.reloadStartedAt = this.scene.time.now;
        this.scene.uiManager?.updateAmmo(this.scene.players);
        this.scene.audioManager?.playSFX('reload_sfx', { volume: 0.45 });
        this.reloadTimer = this.scene.time.delayedCall(this.reloadTime, () => {
            this.reloadTimer = null;
            this.isReloading = false;
            this.reloadStartedAt = null;

            if (!this.isPickedUp || this.owner !== owner) {
                this.scene.uiManager?.updateAmmo(this.scene.players);
                return;
            }

            this.currentAmmo = this.maxAmmoInMag;
            this.scene.uiManager?.updateAmmo(this.scene.players);
        });
    }

    cancelReload() {
        if (this.reloadTimer) {
            this.reloadTimer.remove(false);
            this.reloadTimer = null;
        }
        this.isReloading = false;
        this.reloadStartedAt = null;
    }

    onShoot() {
        console.warn("[Weapon] onShoot() no ha sido implementado en la clase hija.");
    }

    drop() {
        if (!this.isPickedUp || !this.owner) return;

        const player = this.owner;
        this.cancelReload();

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
        this.cancelReload();
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