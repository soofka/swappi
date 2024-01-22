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




for (let group of Object.keys(this.files.src.templates)) {
    for (let file of this.files.src.templates[group]) {
        // is is cross-env?
        if (typeof moduleDefault === 'function') {
            const resultContent = moduleDefault(this.config.data);
            const resultPath = path.join(this.config.paths.generated, file.rel, file.name);
            await writeFile(resultPath, resultContent);
        } else if (typeof moduleDefault === 'object') {
            for (let key of Object.keys(module)) {
                const resultContent = moduleDefault[key](this.config.data);
                const dotIndex = file.name.lastIndexOf('.');
                const resultName = `${file.name.substring(0, dotIndex)}${key}${file.name.substring(dotIndex)}`;
                const resultPath = path.join(this.config.paths.generated, file.rel, resultName);
                await writeFile(resultPath, resultContent);
            }
        }
    }
}