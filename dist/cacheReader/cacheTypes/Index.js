"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Archive_js_1 = __importDefault(require("./Archive.js"));
const File_js_1 = __importDefault(require("./File.js"));
const HashConverter_js_1 = __importDefault(require("../HashConverter.js"));
class Index {
    constructor(id) {
        this.id = id;
        this.protocol = 0;
        this.revision = -1;
        this.hash = 0;
        this.crc = 0;
        this.compression = 0;
        this.named = false;
        this.archivesCount = 0;
        this.archives = {};
        this.indexSegments = [];
    }
    loadIndexData(data) {
        let dataview = new DataView(data.buffer);
        this.protocol = dataview.readUint8();
        if (this.protocol >= 6) {
            this.revision = dataview.readInt32();
        }
        this.hash = dataview.readUint8();
        this.named = (1 & this.hash) != 0;
        if (this.protocol >= 7) {
            this.archivesCount = dataview.readBigSmart();
        }
        else {
            this.archivesCount = dataview.readUint16();
        }
        let lastArchiveId = 0;
        for (let i = 0; i < this.archivesCount; i++) {
            let archiveId;
            if (this.protocol >= 7) {
                archiveId = lastArchiveId += dataview.readBigSmart();
            }
            else {
                archiveId = lastArchiveId += dataview.readInt16();
            }
            this.archives[archiveId] = new Archive_js_1.default();
            this.archives[archiveId].id = archiveId;
        }
        let archiveKeys = Object.keys(this.archives);
        if (this.named) {
            for (let i = 0; i < this.archivesCount; i++) {
                let nameHash = dataview.readInt32();
                this.archives[archiveKeys[i]].nameHash = nameHash;
                if (HashConverter_js_1.default[nameHash] != undefined)
                    this.archives[archiveKeys[i]].name = HashConverter_js_1.default[nameHash];
            }
        }
        for (let i = 0; i < this.archivesCount; i++) {
            let crc = dataview.readInt32();
            this.archives[archiveKeys[i]].crc = crc;
        }
        for (let i = 0; i < this.archivesCount; i++) {
            let revision = dataview.readInt32();
            this.archives[archiveKeys[i]].revision = revision;
        }
        for (let i = 0; i < this.archivesCount; i++) {
            let numberOfFiles;
            if (this.protocol >= 7) {
                numberOfFiles = dataview.readBigSmart();
            }
            else {
                numberOfFiles = dataview.readUint16();
            }
            if (numberOfFiles <= 0)
                console.log("Warning: Files <= 0 for archive " + i + ". Files amount: " + numberOfFiles);
            this.archives[archiveKeys[i]].files = Array(numberOfFiles).fill(undefined);
        }
        for (let i = 0; i < this.archivesCount; i++) {
            let fileID = 0;
            for (let j = 0; j < this.archives[archiveKeys[i]].files.length; j++) {
                if (this.protocol >= 7) {
                    fileID += dataview.readBigSmart();
                }
                else {
                    fileID += dataview.readUint16();
                }
                this.archives[archiveKeys[i]].files[j] = new File_js_1.default(fileID);
            }
        }
        if (this.named) {
            for (let i = 0; i < this.archivesCount; i++) {
                for (let j = 0; j < this.archives[archiveKeys[i]].files.length; j++) {
                    let fileName = dataview.readUint32();
                    this.archives[archiveKeys[i]].files[j].nameHash = fileName;
                    if (HashConverter_js_1.default[fileName] != undefined)
                        this.archives[archiveKeys[i]].files[j].name = HashConverter_js_1.default[fileName];
                }
            }
        }
    }
    toString() {
        return this.id;
    }
}
exports.default = Index;