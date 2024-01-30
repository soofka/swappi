import File from './File.js';
import { findInArray, isFunction, isObject, loadModule } from '../helpers/index.js';
import { getConfig, getLogger } from '../utils/index.js';

export class ModuleFile extends File {

    #module; get module() { return this.#module }

    constructor(absPath, relPath = '') {
        super(absPath, relPath);
    }

    async prepare(isConfigModified, distPath, reportDirectory = undefined, additionalDirectories = undefined) {
        getLogger().log(7, `Preparing module file ${this.src.rel} [isConfigModified=${isConfigModified}, distPath=${distPath}, reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`);
        super.prepare(isConfigModified, distPath, reportDirectory, additionalDirectories);

        const nameArray = this.src.name.split('.');
        if (nameArray.length > 0) {
            let name;
            let ext = '';

            if (nameArray.length === 1) {
                name = nameArray[0];
            } else {
                name = nameArray.slice(0, nameArray.length - 1).join('.');
                ext = `.${nameArray[nameArray.length - 1]}`;
            }

            // make it load from memory
            this.#module = await loadModule(this.src.abs);
            if (isFunction(this.#module)) {
                this.dist[0].name = name;
                this.dist[0].ext = ext;
            } else if (isObject(this.#module)) {
                const newDist = Object.keys(this.#module).map((key) => {
                    const distDirentData = this.dist[0].clone();
                    distDirentData.name = `${name}${key}`;
                    distDirentData.ext = ext;
                    return distDirentData;
                });
                this.dist = newDist;
            }

            if (!this.modified && isObject(additionalDirectories) && additionalDirectories.hasOwnProperty('oldDist')) {
                let distFiles = [];
                for (let dist of this.dist) {
                    const distFile = findInArray(additionalDirectories.oldDist.allFiles, (element) => element.src.isEqual(dist));
                    if (distFile) {
                        distFiles.push(distFile);
                    } else {
                        distFiles = [];
                        break;
                    }
                }
                if (distFiles.length > 0) {
                    this.modified = false;
                    for (let distFile of distFiles) {
                        distFile.modified = false;
                    }
                } else {
                    this.modified = true;
                }
            }
        }

        getLogger().log(7, `Module file ${this.src.rel} prepared (modified: ${this.modified}, dist length: ${this.dist.length})`);
        return this;
    }

    async execute(dist, index) {
        if (isFunction(this.#module)) {
            return this.#module(getConfig().data);
        } else if (isObject(this.#module)) {
            for (let key of Object.keys(this.#module)) {
                if (dist.name.endsWith(key)) {
                    return this.#module[key](getConfig().data);
                }
            }
        }
    }

}

export default ModuleFile;
