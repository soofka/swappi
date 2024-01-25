import path from 'path';
import File from './File.js';
import { isFunction, isObject } from '../helpers/index.js';
import { getConfig } from '../utils/index.js';

export class ModuleFile extends File {

    #moduleFunctions = [];

    constructor(srcAbsPath, distAbsPaths = [], relPath = '') {
        super(srcAbsPath, distAbsPaths, relPath);
    }

    async load() {
        super.load();

        const { default: module } = await import(path.join('file:///', this.src.abs));
        const nameArray = this.src.name.split('.');

        if (nameArray.length >= 1) {
            let name;
            let ext = '';

            if (nameArray.length === 1) {
                name = nameArray[0];
            } else {
                name = nameArray.slice(0, nameArray.length - 1).join('.');
                ext = `.${nameArray[nameArray.length - 1]}`;
            }

            if (isFunction(module)) {
                for (let dist of this.dist) {
                    this.#moduleFunctions.push(module);
                    dist.name = name;
                    dist.ext = ext;
                }
            } else if (isObject(module)) {
                const newDist = [];
                for (let dist of this.dist) {
                    newDist.push(...Object.keys(module).map((key) => {
                        this.#moduleFunctions.push(module[key]);
                        const rootDist = dist.clone();
                        rootDist.name = `${name}${key}`;
                        rootDist.ext = ext;
                        return rootDist;
                    }));
                }
                this.dist = newDist;
            }
        }
    }

    async execute(dist, index) {
        return this.#moduleFunctions[index](getConfig().data);
    }

}

export default ModuleFile;
