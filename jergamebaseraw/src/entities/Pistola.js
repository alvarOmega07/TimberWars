import { Weapon } from './Weapon.js';

export class Pistola extends Weapon {
    constructor(scene, x, y) {
        // Usa la textura 'pistol_dummy'
        super(scene, x, y, 'pistol_dummy', {
            maxAmmo: 5,
            fireRate: 250,
            bulletSpeed: 500
        });
    }

    onShoot() {
        // Determinar el offset del cañón según hacia dónde mira el jugador
        const offsetX = (this.owner.facing === 'right') ? 24 : -24;
        const bulletX = this.owner.x + offsetX;
        const bulletY = this.owner.y;

        // Crear el proyectil en el grupo de físicas heredado de Weapon
        const bullet = this.bulletsGroup.create(bulletX, bulletY, 'bullet_dummy');

        if (bullet) {
            // Desactivar gravedad para que la bala vaya en línea recta horizontal
            bullet.body.allowGravity = false;
            
            const velocity = (this.owner.facing === 'right') ? this.bulletSpeed : -this.bulletSpeed;
            bullet.setVelocityX(velocity);

            // Destruir la bala tras 2 segundos si no choca antes contra una pared/suelo
            this.scene.time.delayedCall(2000, () => {
                if (bullet.active) {
                    bullet.destroy();
                }
            });
        }

        console.log(`[Pistola] ¡PUM! Balas restantes: ${this.currentAmmo}`);
    }
}