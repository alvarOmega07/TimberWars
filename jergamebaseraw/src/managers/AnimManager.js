export class AnimManager {
    constructor(scene) {
        this.scene = scene;
    }

    createPlayerAnimations() {
        const anims = this.scene.anims;
        const sheets = ['player_sheet1', 'player_sheet2'];

        sheets.forEach(sheetKey => {
            if (!anims.exists(`${sheetKey}_idle`)) {
                anims.create({
                    key: `${sheetKey}_idle`,
                    frames: anims.generateFrameNumbers(sheetKey, { start: 4, end: 5 }),
                    frameRate: 4,
                    repeat: -1
                });
            }

            if (!anims.exists(`${sheetKey}_run`)) {
                anims.create({
                    key: `${sheetKey}_run`,
                    frames: anims.generateFrameNumbers(sheetKey, { start: 0, end: 3 }),
                    frameRate: 12,
                    repeat: -1
                });
            }

            if (!anims.exists(`${sheetKey}_jump`)) {
                anims.create({
                    key: `${sheetKey}_jump`,
                    frames: anims.generateFrameNumbers(sheetKey, { frames: [4, 6] }),
                    frameRate: 10,
                    repeat: 0
                });
            }

            if (!anims.exists(`${sheetKey}_fall`)) {
                anims.create({
                    key: `${sheetKey}_fall`,
                    frames: anims.generateFrameNumbers(sheetKey, { frames: [7] }),
                    frameRate: 1,
                    repeat: -1
                });
            }

            if (!anims.exists(`${sheetKey}_death`)) {
                anims.create({
                    key: `${sheetKey}_death`,
                    frames: anims.generateFrameNumbers(sheetKey, { start: 8, end: 11 }),
                    frameRate: 8,
                    repeat: 0
                });
            }
        });
    }
}