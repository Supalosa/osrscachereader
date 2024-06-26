/**
 * An archive from an index
 * @category Cache Types
 * @hideconstructor
 */
class Archive {
    constructor() {
        /**
         * The ID of the file
         * @type {number}
         */
        this.id = 0;

        this.name = "";

        /** @type {number} */
        this.hash = 0;

        /**
         * Hashed name of the archive. Hashes can be brute forced or cracked hashes can be found online
         * @type {number}
         */
        this.nameHash = 0;

        /** @type {number} */
        this.crc = 0;

        /** @type {number} */
        this.revision = 0;

        this.filesLoaded = false;

        /**
         * The files containing definitions within the archive
         * @type {Array}
         */
        this.files = [];
    }

    loadFiles(data) {
        if (this.files.length == 1) {
            this.files[0].content = data;
            return;
        }
        let dataview = new DataView(data.buffer);
        let chunks = dataview.getUint8(data.length - 1);

        let chunkSizes = [];
        for (let i = 0; i < this.files.length; i++) {
            chunkSizes[i] = [];
        }
        let fileSizes = Array(this.files.length).fill(0);

        let streamPosition = data.length - 1 - chunks * this.files.length * 4;

        //the following two loops can be combined in to one
        for (let i = 0; i < chunks; i++) {
            let chunkSize = 0;
            for (let id = 0; id < this.files.length; id++) {
                //rip magic number

                let delta = dataview.getInt32(streamPosition);
                chunkSize += delta;
                streamPosition += 4;
                chunkSizes[id][i] = chunkSize;
                fileSizes[id] += chunkSize;
                //if (id > 32915 && id < 32950)
                //console.log(id, delta, streamPosition);
                //if (id > 32210 && id < 32220)
                //console.log(id, delta, streamPosition);
            }
        }
        //console.log(data);
        //console.log(chunkSizes);
        //console.log(fileSizes);

        let fileOffsets = Array(this.files.length).fill(0);

        streamPosition = 0;

        for (let i = 0; i < chunks; i++) {
            for (let id = 0; id < this.files.length; id++) {
                let chunkSize = chunkSizes[id][i];
                //console.log(chunkSize);
                //System.out.println(fileOffsets[id] + " " + chunkSize + " " + stream.getOffset() + " " + stream.remaining());
                //console.log(id + " " + fileOffsets[id] + " " + chunkSize);
                if (this.files[id].content == undefined) this.files[id].content = [];
                //dez - can be done in a better way
                var newData = new Uint8Array(dataview.buffer.slice(streamPosition, streamPosition + chunkSize));
                var contentUpdate = new Uint8Array(this.files[id].content.length + newData.length);
                contentUpdate.set(this.files[id].content);
                contentUpdate.set(newData, this.files[id].content.length);

                this.files[id].content = contentUpdate;
                fileOffsets[id] += chunkSize;

                if (id == 0) {
                    //console.log(this.files[id].content);
                    //console.log(newData);
                    //console.log(streamPosition);
                }
                streamPosition += newData.byteLength;
                //console.log(fileOffsets[id]);
                //console.log(this.files[id].content);
            }
        }
        //console.log(fileOffsets);
        //console.log(this.files[0]);
    }
}

export default Archive;
