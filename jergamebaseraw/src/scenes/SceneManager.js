export class SceneManager {
    constructor(scene, mapKey) {
        this.scene = scene;
        this.map = scene.make.tilemap({ key: mapKey });
        this.tilesets = [];
        this.layers = {};
    }

    // Añade un tileset asociando el nombre de Tiled con la clave cargada en Phaser
    addTileset(tiledName, phaserKey) {
        const ts = this.map.addTilesetImage(tiledName, phaserKey);
        if (ts) {
            this.tilesets.push(ts);
        }
        return ts;
    }

    // Crea la capa usando todos los tilesets registrados en el mapa
    createLayer(layerName, isSolid = false) {
        const layer = this.map.createLayer(layerName, this.tilesets, 0, 0);
        if (isSolid && layer) {
            layer.setCollisionByExclusion([-1]);
        }
        this.layers[layerName] = layer;
        return layer;
    }

    getLayer(layerName) {
        return this.layers[layerName];
    }
}