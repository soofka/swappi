import DirentData from './DirentData.js';
import { isInArray } from '../helpers/index.js';

export class Dirent {

    #src; get src() { return this.#src }
    #dist = []; get dist() { return this.#dist } set dist(value) { this.#dist = value }
    #isDir; get isDir() { return this.#isDir } set isDir(value) { this.#isDir = value }
    #modified; get modified() { return this.#modified } set modified(value) { this.#modified = value }

    constructor(srcAbsPath, distAbsPaths = [], relPath = '') {
        this.#src = new DirentData(srcAbsPath, relPath);

        for (let distPath of distAbsPaths) {
            this.addDist(distPath, relPath);
        }
    }

    addDist(absPath, relPath = '') {
        this.#dist.push(new DirentData(absPath, relPath));
    }

    isEqual(dirent) {
        if (this.#src.isEqual(dirent.src)) {
            for (let thisDist of this.#dist) {
                if (!isInArray(dirent.dist, (comparandDist) => thisDist.isEqual(comparandDist))) {
                    return false;
                }
            }
        }
        return true;
    }

    serialize(src = true, dist = true) {
        const obj = {};

        if (src) {
            obj.src = this.#src.serialize();
        }

        if (dist) {
            obj.dist = this.#dist.map((dist) => dist.serialize());
        }

        return obj;
    }

    deserialize({ src, dist }) {
        this.#src = new DirentData().deserialize(src);
        this.#dist = dist.map((distItem) => new DirentData().deserialize(distItem));
        return this;
    }

}

export default Dirent;
