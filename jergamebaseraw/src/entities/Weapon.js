import { GameObject } from "./GameObject.js";

export class Weapon extends GameObject {
    constructor(scene, x, y, textureKey, config = {}) {
        super(scene, x, y, textureKey);

        // --- ATRIBUTOS Y MUNICIÓN ---
        this.maxAmmoInMag = config.maxAmmoInMag || 6;  // Capacidad del cargador
        this.currentAmmo = this.maxAmmoInMag;          // Balas actuales en el cargador
        this.fireRate = config.fireRate || 250;        // Tiempo en ms entre disparos
        this.reloadTime = config.reloadTime || 1500;   // Tiempo en ms para recargar
        this.bulletSpeed = config.bulletSpeed || 400;  // Velocidad de la bala

        // --- ESTADOS INTERNOS ---
        this.lastFired = 0;
        this.owner = null; // Guardará la referencia del Player que la lleva equipada
        this.setDrag(150);

        // --- GRUPO DE BALAS ---
        this.bulletsGroup = scene.physics.add.group();

        // Configurar colisión de las balas producidas por esta arma con la colisión
        if (scene.capaSuelo) {
            scene.physics.add.collider(this.bulletsGroup, scene.capaSuelo, (bullet) => {
                bullet.destroy();
            });
        }
    }

    /**
     * 1. RECOGER (OVERRIDE DE GAMEOBJECT)
     * Se ejecuta cuando el jugador pulsa la tecla E sobre el arma en el suelo.
     */
    onPickUp(player) {
        if (this.isPickedUp) return;

        super.onPickUp(player);
        this.owner = player;
        player.equipWeapon(this);
    }

    /**
     * 2. DISPARAR
     * Crea un proyectil en la posición y dirección actual del jugador si hay munición.
     */
    shoot() {
        if (!this.isPickedUp || !this.owner) return;
        if (this.currentAmmo <= 0) return;

        const time = this.scene.time.now;
        if (time < this.lastFired) return;

        // Restar munición y actualizar tiempo del último disparo
        this.currentAmmo--;
        this.lastFired = time + this.fireRate;

        // Llamar a la lógica específica que implementará cada subclase
        this.onShoot();
    }

    onShoot() {
        console.warn("[Weapon] onShoot() no ha sido implementado en la clase hija.");
    }
    /**
     * 4. TIRAR / SOLTAR
     * Suelta el arma en la posición actual del jugador y la vuelve a colocar en el suelo.
     */
    drop() {
        if (!this.isPickedUp || !this.owner) return;

        const player = this.owner;

        // Reubicar el arma cerca del jugador
        this.setPosition(player.x, player.y);
        this.setVisible(true);
        this.setActive(true);

        // Reactivar su cuerpo físico en el suelo
        if (this.body) {
            this.body.enable = true;
            this.body.reset(player.x, player.y);
            this.setDragX(100);

            // Aplicar un pequeño impulso al soltarla
            const dropImpulseX = (player.facing === 'right') ? 100 : -100;
            this.setVelocity(dropImpulseX, -100);
        }

        // Resetear estados
        this.isPickedUp = false;
        this.owner = null;
        player.unequipWeapon();

        console.log('[Arma] Soltada en el suelo.');
    }
}