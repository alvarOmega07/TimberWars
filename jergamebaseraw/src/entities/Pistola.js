import { GameObject } from './GameObject.js';

export class Pistola extends GameObject {
    constructor(scene, x, y) {
        // Usa la textura 'pistol_dummy'
        super(scene, x, y, 'pistol_dummy');
    }

    onPickUp(player) {
        super.onPickUp(player);
        player.equipWeapon(this); // Asigna esta pistola como el arma del jugador
        console.log("¡Pistola equipada!");
    }
}