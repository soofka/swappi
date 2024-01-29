import fs from 'fs/promises';
import path from 'path';
import Dirent from './Dirent.js';
import { loadDir } from '../helpers/index.js';
import { getLogger } from '../utils/index.js';

export class Directory extends Dirent {

    #direntList = []; get direntList() { return this.#direntList }
    #getFileClass;

    constructor(getFileClass, absPath, relPath = '') {
        super(absPath, relPath);
        this.#getFileClass = getFileClass;
        this.isDir = true;
    }

    async load() {
        getLogger().log(6, `Loading directory ${this.src.rel}`);

        for (let nodeDirent of await loadDir(this.src.abs)) {
            const srcPath = path.join(this.src.abs, nodeDirent.name);
            let dirent;

            if (nodeDirent.isFile()) {
                const fileClass = this.#getFileClass(nodeDirent);
                dirent = new fileClass(srcPath, this.src.relDir);
            } else if (nodeDirent.isDirectory()) {
                dirent = new Directory(this.#getFileClass, srcPath, dirent.name);
            }

            if (dirent) {
                await dirent.load();
                this.#direntList.push(dirent);
            }
        }

        getLogger().log(6, `Directory ${this.src.rel} loaded`);
        return this;
    }

    prepare(distPath) {
        getLogger().log(6, `Preparing directory ${this.src.rel} [distPath=${distPath}]`);

        for (let dirent of this.#direntList) {
            dirent.prepare(distPath);
        }

        getLogger().log(6, `Directory ${this.src.rel} prepared`);
        return this;
    }

    async process(oldSrc, oldDist, parentModified = false) {
        getLogger().log(6, `Processing directory (abs: ${this.abs})`);

        super.process(oldSrc, oldDist, this.isEqual, parentModified);
        await this.createDist();
        
        for (let dirent of this.#direntList) {
            if (dirent.isDir) {
                const newOldSrc = oldSrc && Array.isArray(oldSrc.direntList) && oldSrc.direntList.find((item) => dirent.isEqual(item));
                await dirent.process(newOldSrc, oldDist, this.modified);
            } else {
                const newOldSrc = oldSrc && oldSrc.dirList;
                await dirent.process(newOldSrc, oldDist, this.modified);
            }
        }

        getLogger().log(6, `Directory processed (abs: ${this.abs})`);
    }

    async createDist() {
        for (let dist of this.dist) {
            await createDir(dist.abs);
        }
    }

    async resetDist() {
        for (let dist of this.dist) {
            await removeDir(dist.abs);
            await createDir(dist.abs);
        }
    }

    async removeFromDist() {

    }

    async isEqual(directory) {
        if (super.isEqual(directory)) {
            return this.#direntList.length === directory.direntList.length;
        }
        return false;
    }

    serializeAll(src = true, dist = true, fileContent = true) {
        const root = this.serialize(src, dist);
        root.direntList = [];
        
        for (let index in this.#direntList) {
            const dirent = this.#direntList[index];
            if (dirent.isDir) {
                root.direntList.push(dirent.serializeAll(src, dist, fileContent));
            } else {
                root.direntList.push(dirent.serialize(src, dist, fileContent));
            }
        }

        return root;
    }

    deserializeAll({ src, dist, direntList }) {
        this.deserialize({ src, dist });

        for (let index in direntList) {
            const dirent = direntList[index];
            if (dirent.hasOwnProperty('direntList')) {
                this.#direntList.push(new Directory(this.#getFileClass).deserializeAll(dirent));
            } else {
                const fileClass = this.#getFileClass(dirent);
                this.#direntList.push(new fileClass().deserialize(dirent));
            }
        }

        return this;
    }

    // get allDirents() {
    //     let allDirents = [];
    //     for (let dirent of this.#direntList) {
    //         if (dirent.isDir) {
    //             allDirents.push(...dirent.allDirents);
    //         } else {
    //             allDirents.push(dirent);
    //         }
    //     }
    //     return allDirents;
    // }

}

const createDir = async (absPath) => await fs.mkdir(absPath, { recursive: true });
const removeDir = async (absPath) => await fs.rm(absPath, { recursive: true, force: true });

export default Directory;
