export class SceneManager {
    constructor(scene, mapKey, tilesetKey, tilesetName) {
        this.scene = scene;
        this.map = scene.make.tilemap({ key: mapKey });
        this.tileset = this.map.addTilesetImage(tilesetName, tilesetKey);
        this.layers = {};
    }

    createLayer(layerName, isSolid = false) {
        const layer = this.map.createLayer(layerName, this.tileset, 0, 0);
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