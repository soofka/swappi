import path from 'path';
import Dirent from './Dirent.js';
import { createDir, deleteFile, loadDir } from '../helpers/index.js';
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

        const dir = await loadDir(this.src.abs);
        if (dir) {
            for (let nodeDirent of dir) {
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
        } else {
            getLogger().warn(6, `Directory ${this.src.abs} does not exist in file system`);
            
            const newDir = await createDir(this.src.abs);
            if (newDir) {
                getLogger().log(6, `Directory ${this.src.abs} created`);
            }
        }

        getLogger().log(6, `Directory ${this.src.rel} loaded (direntList length: ${this.#direntList.length})`);
        return this;
    }

    async prepare(distPath) {
        getLogger().log(6, `Preparing directory ${this.src.rel} [distPath=${distPath}]`);

        for (let dirent of this.#direntList) {
            await dirent.prepare(distPath);
        }

        getLogger().log(6, `Directory ${this.src.rel} prepared`);
        return this;
    }

    async process() {
        getLogger().log(6, `Processing directory ${this.src.rel}`);

        for (let dirent of this.#direntList) {
            await dirent.process();
        }

        getLogger().log(6, `Directory ${this.src.rel} processed`);
        return this;
    }

    async reset() {
        getLogger().log(6, `Reseting directory ${this.src.rel}`);

        const newDirentList = [];
        for (let dirent of this.#direntList) {
            if (dirent.isDir) {
                newDirentList.push(await dirent.clear());
            } else if (!dirent.modified) {
                newDirentList.push(dirent);
            } else {
                await deleteFile(dirent.src.abs);
            }
        }
        this.#direntList = newDirentList;

        getLogger().log(6, `Directory ${this.src.rel} reseted`);
        return this;
    }

    async isEqual(directory) {
        if (super.isEqual(directory)) {
            return this.#direntList.length === directory.direntList.length;
        }
        return false;
    }

    serialize(src = true, dist = true, content = true) {
        const root = super.serialize(src);

        root.direntList = [];
        for (let dirent of this.#direntList) {
            root.direntList.push(dirent.serialize(src, dist, content));
        }

        return root;
    }

    deserialize({ src, direntList }) {
        super.deserialize({ src });

        for (let index in direntList) {
            const dirent = direntList[index];
            if (dirent.hasOwnProperty('direntList')) {
                this.#direntList.push(new Directory(this.#getFileClass).deserialize(dirent));
            } else {
                const fileClass = this.#getFileClass(dirent);
                this.#direntList.push(new fileClass().deserialize(dirent));
            }
        }

        return this;
    }

    get allDirents() {
        let allDirents = [];
        for (let dirent of this.#direntList) {
            if (dirent.isDir) {
                allDirents.push(...dirent.allDirents);
            } else {
                allDirents.push(dirent);
            }
        }
        return allDirents;
    }

}

export default Directory;
