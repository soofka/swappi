import fs from 'fs/promises';
import path from 'path';
import Dirent from './Dirent.js';

export class Directory extends Dirent {

    #direntList = []; get direntList() { return this.#direntList }
    #getFileClass;

    constructor(getFileClass, srcAbsPath, distAbsPaths, relPath = '') {
        super(srcAbsPath, distAbsPaths, relPath);
        this.#getFileClass = getFileClass;
        this.isDir = true;
    }

    async load() {
        for (let dirent of await fs.readdir(this.src.abs, { withFileTypes: true })) {
            const srcPath = path.join(this.src.abs, dirent.name);
            const distPaths = this.dist.map((dist) => path.join(dist.abs, dirent.name));

            let direntObject;

            if (dirent.isFile()) {
                const fileClass = this.#getFileClass(dirent);
                direntObject = new fileClass(srcPath, distPaths, this.src.rel);
            } else if (dirent.isDirectory()) {
                direntObject = new Directory(this.#getFileClass, srcPath, distPaths, dirent.name);
            }

            if (direntObject) {
                await direntObject.load();
                this.#direntList.push(direntObject);
            }
        }
    }

    async executeAndSave(comparandDirectory, parentModified = false) {
        await this.createDist();
        this.modified = parentModified || (comparandDirectory && this.isEqual(comparandDirectory));
        
        for (let dirent of this.#direntList) {
            if (dirent.isDir) {
                const newComparand = comparandDirectory
                    && Array.isArray(comparandDirectory)
                    && comparandDirectory.direntList.find((item) => dirent.isEqual(item));
                await dirent.executeAndSave(newComparand, parentModified);
            } else {
                const newComparand = comparandDirectory && comparandDirectory.dirList;
                await dirent.executeAndSave(newComparand, parentModified);
            }
        }
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
