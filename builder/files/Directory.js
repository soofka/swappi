import fs from 'fs/promises';
import path from 'path';
import Dirent from './Dirent.js';

export class Directory extends Dirent {

    #content = []; get content() { return this.#content }
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
                this.#content.push(direntObject);
            }
        }
    }

    async executeAndSave(config) {
        await this.createDist();
        
        for (let dirent of this.#content) {
            await dirent.executeAndSave(config);
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

    serializeAll(src = true, dist = true, fileContent = true) {
        const root = this.serialize(src, dist);
        root.content = [];
        
        for (let index in this.#content) {
            let dirent = this.#content[index];
            if (dirent.isDir) {
                root.content.push(dirent.serializeAll(src, dist, fileContent));
            } else {
                root.content.push(dirent.serialize(src, dist, fileContent));
            }
        }

        return root;
    }

    get allDirents() {
        let allDirents = [];
        for (let dirent of this.#content) {
            if (dirent.isDir) {
                allDirents.push(...dirent.allDirents);
            } else {
                allDirents.push(dirent);
            }
        }
        return allDirents;
    }

}

const createDir = async (absPath) => await fs.mkdir(absPath, { recursive: true });
const removeDir = async (absPath) => await fs.rm(absPath, { recursive: true, force: true });

export default Directory;
