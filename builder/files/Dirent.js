import DirentData from './DirentData.js';

export class Dirent {

    #src; get src() { return this.#src }
    #dist = []; get dist() { return this.#dist } set dist(value) { this.#dist = value }
    #isDir; get isDir() { return this.#isDir } set isDir(value) { this.#isDir = value }

    constructor(srcAbsPath, distAbsPaths = [], relPath = '') {
        this.#src = new DirentData(srcAbsPath, relPath);

        for (let distPath of distAbsPaths) {
            this.addDist(distPath, relPath);
        }
    }

    addDist(absPath, relPath = '') {
        this.#dist.push(new DirentData(absPath, relPath));
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

}

export default Dirent;
