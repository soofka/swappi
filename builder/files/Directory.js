import fs from 'fs/promises';
import path from 'path';

import Dirent from './Dirent.js';
import FileFactory from './FileFactory.js';

export class Directory extends Dirent {

    #dirents;

    constructor(absPath, relPath) {
        super(absPath, relPath);
        this.#dirents = [];
    }

    async load() {
        for (let item of await fs.readdir(this.srcAbs, { withFileTypes: true })) {
            if (item.isFile()) {
                this.#dirents.push(FileFactory.getFile(path.join(item.path, item.name), this.distRel));
            } else if (item.isDirectory()) {
                const directory = new Directory(item.path, path.join(this.distRel, item.name));
                this.#dirents.push(directory);
                await directory.load();
            }
        }
    }

    get dirents() {
        return this.#dirents;
    }

    isDir() {
        return true;
    }

}

export default Directory;
