import { GameObject } from "./GameObject.js";

export class Weapon extends GameObject {
    constructor(scene, x, y, textureKey, config = {}) {
        super(scene, x, y, textureKey);

        this.setOrigin(0.5, 0.5);
        this.clearTint();

        this.maxAmmoInMag = config.maxAmmoInMag || 6;
        this.currentAmmo = this.maxAmmoInMag;
        this.fireRate = config.fireRate || 250;
        this.bulletSpeed = config.bulletSpeed || 400;
        this.fireSoundKey = config.fireSoundKey || 'pistol_sfx';
        this.shotShake = config.shotShake || 0.0015;

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

    updatePosition() {
        if (!this.isPickedUp || !this.owner) return;

        const isFacingRight = (this.owner.facing === 'right' || this.owner.flipX);

        const offsetX = isFacingRight ? 10 : -10;
        const offsetY = 0;

        this.setPosition(this.owner.x + offsetX, this.owner.y + offsetY);

        this.setFlipX(!isFacingRight);

        this.setDepth(this.owner.depth + 1);
        }
        
        onPickUp(player) {
        if (this.isPickedUp) return;

        super.onPickUp(player);
        this.owner = player;

        this.setVisible(true);
        this.setActive(true);
        this.setDepth(player.depth + 1);

        if (this.displayOwner) {
            const display = this.displayOwner;
            this.displayOwner = null;
            display.onPickedUp();
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

        if (this.currentAmmo === 0) {
            this.setTint(0x64748b);
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