import fs from 'fs/promises';
import path from 'path';

import Dirent from './Dirent.js';

export class Directory extends Dirent {

    #getFileClass;

    constructor(getFileClass, srcAbsPath, distAbsPaths, relPath = '') {
        super(srcAbsPath, distAbsPaths, relPath);
        this.#getFileClass = getFileClass;
        this.src.content = [];
    }

    async load() {
        for (let item of await fs.readdir(this.src.abs, { withFileTypes: true })) {
            if (item.isFile()) {
                const srcPath = path.join(this.src.abs, item.name);
                const distPaths = this.dist.map((dist) => path.join(dist.abs, item.name));
                const fileClass = this.#getFileClass(item);
                const file = new fileClass(srcPath, distPaths, relPath);
                this.src.content.push(file);
                await file.load();
            } else if (item.isDirectory()) {
                const directory = new Directory(this.#getFileClass, item.path, path.join(this.dist.rel, item.name));
                this.src.content.push(directory);
                await directory.load();
            }
        }
    }

    async executeAndSave() {
        for (let dist of this.dist) {
            try {
                await fs.stat(dist.abs);
            } catch(e) {
                if (e.code !== 'ENOENT') {
                    throw e;
                }
                fs.mkdir(path.dirname(dist.abs), { recursive: true });
            }
        }

        for (let dirent of this.src.content) {
            await dirent.executeAndSave();
            this.dist.content.push(dirent);
        }
    }

    get getFileClass() {
        return this.#getFileClass;
    }

    get allDirents() {
        let allDirents = [];
        for (let dirent of this.src.content) {
            if (dirent.isDir()) {
                allDirents.push(...dirent.allDirents);
            } else {
                allDirents.push(dirent);
            }
        }
        return allDirents;
    }

    isDir() {
        return true;
    }

}

export default Directory;
