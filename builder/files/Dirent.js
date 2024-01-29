import DirentData from './DirentData.js';
import { getLogger } from '../utils/index.js';

export class Dirent {

    #src; get src() { return this.#src }
    #isDir; get isDir() { return this.#isDir } set isDir(value) { this.#isDir = value }
    #modified; get modified() { return this.#modified } set modified(value) { this.#modified = value }

    constructor(absPath, relPath = '') {
        getLogger().log(6, `Creating dirent [absPath=${absPath}, relPath=${relPath}]`);
        this.#src = new DirentData(absPath, relPath);
    }

    isEqual(dirent) {
        return this.#src.isEqual(dirent.src);
    }

    process(oldSrc, oldDist, comparisonMethod, parentModified) {
        this.#modified = true;

        if (!parentModified && oldSrc && comparisonMethod(oldSrc) && oldDist) {
            for (let dirent of oldDist.allDirents) {
                if (comparisonMethod(dirent)) {
                    dirent.toBeRemoved = false;
                    this.#modified = false;
                    break;
                }
            }
        };
    }

    serialize(src = true) {
        const obj = {};

        if (src) {
            obj.src = this.#src.serialize();
        }

        return obj;
    }

    deserialize({ src }) {
        this.#src = new DirentData().deserialize(src);
        return this;
    }

}

export default Dirent;
