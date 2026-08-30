import assert from "assert";
import "../src/cacheReader/helpers/DataView.js";
import SpotAnimLoader from "../src/cacheReader/loaders/SpotAnimLoader.js";

describe("Spot animation model IDs", () => {
    it("decodes legacy unsigned-short model IDs", () => {
        const definition = new SpotAnimLoader().load(new Uint8Array([1, 0x12, 0x34, 0]), 1);
        assert.equal(definition.modelId, 0x1234);
    });

    it("decodes current four-byte model IDs", () => {
        const definition = new SpotAnimLoader().load(new Uint8Array([3, 0, 1, 2, 3, 0]), 1);
        assert.equal(definition.modelId, 0x010203);
    });
});
