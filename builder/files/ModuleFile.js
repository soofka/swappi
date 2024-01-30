import File from './File.js';
import { findInArray, isFunction, isObject, loadModule } from '../helpers/index.js';
import { getConfig, getLogger } from '../utils/index.js';

export class ModuleFile extends File {

    #moduleFunctions = [];

    constructor(absPath, relPath = '') {
        super(absPath, relPath);
    }

    async prepare(distPath, reportDirectory, distDirectory) {
        getLogger().log(7, `Preparing module file ${this.src.rel} [distPath=${distPath}, reportDirectory=${reportDirectory}, distDirectory=${distDirectory}]`);
        super.prepare(distPath, reportDirectory);

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

            // make it load from memory
            const module = await loadModule(this.src.abs);
            if (isFunction(module)) {
                this.#moduleFunctions.push(module);
                this.dist[0].name = name;
                this.dist[0].ext = ext;
            } else if (isObject(module)) {
                const newDist = Object.keys(module).map((key) => {
                    this.#moduleFunctions.push(module[key]);
                    const distDirentData = this.dist[0].clone();
                    distDirentData.name = `${name}${key}`;
                    distDirentData.ext = ext;
                    return distDirentData;
                });
                this.dist = newDist;
            }

            let distFiles = [];
            for (let dist of this.dist) {
                const distFile = findInArray(distDirectory.allFiles, (element) => element.src.isEqual(dist));
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
            }
        }

        getLogger().log(7, `Module file ${this.src.rel} prepared (modified: ${this.modified}, dist length: ${this.dist.length})`);
        return this;
    }

    async execute(dist, index) {
        // is it safe to do it in order instead of relying on keys?
        return this.#moduleFunctions[index](getConfig().data);
    }

}

export default ModuleFile;
