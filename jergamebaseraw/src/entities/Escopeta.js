import { Weapon } from './Weapon.js';

export class Escopeta extends Weapon {
    constructor(scene, x, y) {
        super(scene, x, y, 'shotgun_dummy', {
        });

        this.currentAmmo = 5;
        this.fireRate = 350;
        this.bulletSpeed = 500;
        this.bullets_shot = 5;
        this.dispersion = 0.5; // Radianes de apertura
    }

    onShoot() {
        if (!this.owner) return;

        // Determinar el offset del cañón y el ángulo base (0 rad derecha, PI rad izquierda)
        const isRight = this.owner.facing === 'right' || !this.owner.flipX;
        const offsetX = isRight ? 24 : -24;
        const bulletX = this.owner.x + offsetX;
        const bulletY = this.owner.y;
        const baseAngle = isRight ? 0 : Math.PI;

        for (let i = 0; i < this.bullets_shot; i++) {
            const bullet = this.bulletsGroup.create(bulletX, bulletY, 'bullet_dummy');

            if (bullet) {
                // Desactivar la gravedad
                bullet.body.allowGravity = false;

                // Aplicar la dispersión aleatoria
                const spread = (Math.random() - 0.5) * this.dispersion;
                const finalAngle = baseAngle + spread;

                // Descomponer la velocidad
                const vx = Math.cos(finalAngle) * this.bulletSpeed;
                const vy = Math.sin(finalAngle) * this.bulletSpeed;

                bullet.setVelocity(vx, vy);

                // Destruir la bala tras 500ms si no ha colisionado
                this.scene.time.delayedCall(200, () => {
                    if (bullet.active) {
                        bullet.destroy();
                    }
                });
            }
        }

        console.log(`[Escopeta] ¡PUM! Balas restantes: ${this.currentAmmo}`);
    }
}