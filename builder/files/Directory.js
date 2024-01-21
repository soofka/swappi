import fs from 'fs/promises';
import path from 'path';

import Dirent from './Dirent.js';
import File from './File.js';
import RunableFile from './RunableFile.js';

export class Directory extends Dirent {

    dirents;
    fileType;

    constructor(absPath, relPath, runable = false) {
        super(absPath, relPath);
        this.dirents = [];
        this.fileType = runable ? RunableFile : File;
    }

    async load() {
        for (let item of await fs.readdir(this.abs, { withFileTypes: true })) {
            if (item.isFile()) {
                this.dirents.push(new this.fileType(path.join(item.path, item.name), this.rel));
            } else if (item.isDirectory()) {
                const directory = new Directory(item.path, path.join(this.rel, item.name), this.fileType);
                this.dirents.push(directory);
                await directory.load();
            }
        }
    }

    isDir() {
        return true;
    }

    getDirents() {
        return this.dirents;
    }

}

export default Directory;
