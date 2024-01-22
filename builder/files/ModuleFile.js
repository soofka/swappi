import path from 'path';
import File from './File.js';
import isFunction from './helpers/isFunction.js';
import isObject from './helpers/isObject.js';

export class ModuleFile extends File {

    constructor(srcAbsPath, distAbsPaths = [], relPath = '') {
        super(srcAbsPath, distAbsPaths, relPath);
    }

    async load() {
        this.src.content = await import(path.join('file:///', this.src.abs));
        const nameArray = this.src.name.split('.');
        
        if (isFunction(this.src.content.default)) {
            this.dist[0].name = nameArray[0];
            this.dist[0].ext = nameArray[1];
        } else if (isObject(this.src.content.default)) {
            this.dist = Object.keys(this.src.content).map((key) => {
                const rootDist = this.dist[0].clone();
                rootDist.name = `${nameArray[0]}${key}`;
                rootDist.ext = nameArray[1];
                return rootDist;
            });
        }
    }

    async execute(dist, data) {
        dist.content = this.src.content.default(data);
    }

}

export default ModuleFile;
