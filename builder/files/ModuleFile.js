import path from 'path';
import File from './File.js';
import { isFunction, isObject } from '../helpers/index.js';

export class ModuleFile extends File {

    #module;

    constructor(srcAbsPath, distAbsPaths = [], relPath = '') {
        super(srcAbsPath, distAbsPaths, relPath);
    }

    async load() {
        super.load();
        const { default: d } = await import(path.join('file:///', this.src.abs));
        this.#module = d;

        const nameArray = this.src.name.split('.');
        nameArray.pop();

        if (nameArray.length >= 1) {
            let name;
            let ext = '';

            if (nameArray.length === 1) {
                name = nameArray[0];
            } else {
                name = nameArray.slice(0, nameArray.length - 1).join('.');
                ext = `.${nameArray[nameArray.length - 1]}`;
            }

            if (isFunction(this.#module)) {
                this.dist[0].name = name;
                this.dist[0].ext = ext;
                this.dist[0].setModule(this.#module);
            } else if (isObject(this.#module)) {
                this.dist = Object.keys(this.#module).map((key) => {
                    const rootDist = this.dist[0].clone();
                    rootDist.name = `${name}${key}`;
                    rootDist.ext = ext;
                    rootDist.setModule(this.#module[key]);
                    return rootDist;
                });
            }
        }
    }

    async execute(dist, data) {
        dist.content = dist.module(data);
    }

}

export default ModuleFile;
