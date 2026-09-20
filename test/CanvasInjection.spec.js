import assert from "assert";
import GLTFExporter from "../src/cacheReader/exporters/GLTFExporter.js";
import { Sprite } from "../src/cacheReader/loaders/SpriteLoader.js";

const model = {
    faceVertexIndices1: [0],
    faceVertexIndices2: [1],
    faceVertexIndices3: [2],
    faceColors: [0],
    faceAlphas: [0],
    vertexPositionsX: [0, 1, 0],
    vertexPositionsY: [0, 0, 1],
    vertexPositionsZ: [0, 0, 0],
};

describe("Canvas injection", function () {
    it("requires createCanvas only when a sprite image is rendered", async function () {
        const sprite = new Sprite();
        sprite.width = 1;
        sprite.height = 1;
        sprite.pixels = [0xff0000];

        await assert.rejects(sprite.createImage(), /injected createCanvas function/);
        assert.deepEqual(sprite.createImageData({
            createImageData: () => ({ data: new Uint8ClampedArray(4) }),
        }).data, new Uint8ClampedArray([255, 0, 0, 254]));

    });

    it("requires createCanvas only when a GLTF colour palette is generated", function () {
        const exporter = new GLTFExporter(model);
        assert.throws(() => exporter.addColors(), /injected createCanvas function/);
    });
});
