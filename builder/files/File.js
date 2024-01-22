import fs from 'fs/promises';
import Dirent from './Dirent.js';

export class File extends Dirent {

    constructor(srcAbsPath, distAbsPaths = [], relPath = '') {
        super(srcAbsPath, distAbsPaths, relPath);
    }

    async load() {
        this.src.content = await fs.readFile(this.src.abs, { encoding: 'utf8' });
    }

    async executeAndSave(data) {
        for (let dist of this.dist) {
            await this.execute(dist, data);
            await this.save(dist, data);
        }
    }

    async execute(dist) {
        dist.content = this.src.content;
    }

    async save(dist) {
        await fs.writeFile(dist.abs, dist.content);
    }

    isDir() {
        return false;
    }

}

export default File;
