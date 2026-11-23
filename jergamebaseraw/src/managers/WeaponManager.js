import { WeaponDisplay } from '../entities/WeaponDisplay.js';
import { Pistola } from '../entities/Pistola.js';
import { Escopeta } from '../entities/Escopeta.js';

export class WeaponManager {
    constructor(scene) {
        this.scene = scene;
        this.displays = [];
        this.grupoArmas = this.scene.physics.add.group();
    }

    createWeapons() {
        // 1. Instanciar armas iniciales
        const pistola1 = new Pistola(this.scene, 174, 324, 'pistol');
        const pistola2 = new Pistola(this.scene, 622, 322, 'pistol');
        const escopeta = new Escopeta(this.scene, 400, 258, 'shotgun');

        // Registrar físicas
        [pistola1, pistola2, escopeta].forEach(w => this.registerNewWeapon(w));

        // 2. Instanciar los displays pasándoles las armas físicas
        this.displays = [
            new WeaponDisplay(this.scene, 174, 337, pistola1, 8000),
            new WeaponDisplay(this.scene, 622, 337, pistola2, 8000),
            new WeaponDisplay(this.scene, 400, 273, escopeta, 10000)
        ];
    }

    registerNewWeapon(weapon) {
        this.grupoArmas.add(weapon);

        if (this.scene.capaSuelo) {
            this.scene.physics.add.collider(weapon, this.scene.capaSuelo);
        }

        if (this.scene.players) {
            this.setupBulletCollisionsForWeapon(weapon, this.scene.players);
        }
    }

    setupBulletCollisions(players) {
        this.grupoArmas.getChildren().forEach(weapon => {
            this.setupBulletCollisionsForWeapon(weapon, players);
        });
    }

    setupBulletCollisionsForWeapon(weapon, players) {
        players.forEach(target => {
            this.scene.physics.add.overlap(weapon.bulletsGroup, target, (objectA, objectB) => {
                const bullet = objectA === target ? objectB : objectA;
                if (!bullet.active || bullet.getData('shooter') === target || this.scene.roundResolving) return;

                bullet.destroy();
                target.die();
            });
        });
    }

    checkNearbyWeapon(player) {
        let nearbyItem = null;

        // 1. Buscar en displays ocupados
        this.displays.forEach(display => {
            if (display.isOccupied && display.currentWeapon) {
                if (this.scene.physics.overlap(player, display.currentWeapon)) {
                    nearbyItem = display.currentWeapon;
                }
            }
        });

        // 2. Buscar armas tiradas sueltas en el suelo
        if (!nearbyItem) {
            this.scene.physics.overlap(player, this.grupoArmas, (p, weapon) => {
                if (!weapon.isPickedUp) {
                    nearbyItem = weapon;
                }
            });
        }

        return nearbyItem;
    }

    resetAll() {
        this.displays.forEach(display => display.resetDisplay());
    }
}