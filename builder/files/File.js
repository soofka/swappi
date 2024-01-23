import fs from 'fs/promises';
import Dirent from './Dirent.js';

export class File extends Dirent {

    constructor(srcAbsPath, distAbsPaths = [], relPath = '') {
        super(srcAbsPath, distAbsPaths, relPath);
        this.content = '';
        this.isDir = false;
    }

    async load() {
        this.content = await fs.readFile(this.src.abs, { encoding: 'utf8' });
    }

    async executeAndSave(data) {
        for (let distIndex in this.dist) {
            const dist = this.dist[distIndex];
            const content = await this.execute(dist, distIndex, data);
            await this.save(dist, distIndex, content, data);
        }
    }

    async execute() {
        return this.content;
    }

    async save(dist, content) {
        await fs.writeFile(dist.abs, content);
    }

}

export default File;
