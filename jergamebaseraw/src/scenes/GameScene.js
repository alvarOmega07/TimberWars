import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Cargar recursos
        this.load.image('tiles_key', 'assets/images/tileset1.png')

        this.load.tilemapTiledJSON('mapa_key', 'assets/images/Mapa.tmj')
    }

   create() {
    const map = this.make.tilemap({ key: 'mapa_key' });

    const tileset = map.addTilesetImage('tileset1', 'tiles_key');

    const capaSuelo = map.createLayer('Suelo', tileset, 0, 0);
    const capaAire = map.createLayer('Aire', tileset, 0, 0);

    capaSuelo.setCollisionByProperty({ Solid: true });
}

    update(time, delta) {
        // Bucle del juego
    }
}
