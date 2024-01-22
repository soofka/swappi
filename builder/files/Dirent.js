import DirentData from './DirentData.js';

export class Dirent {

    #src;
    #dist = [];

    constructor(srcAbsPath, distAbsPaths = [], relPath = '') {
        this.#src = new DirentData(srcAbsPath, relPath);

        for (let distPath of distAbsPaths) {
            this.addDist(distPath, relPath);
        }
    }

    addDist(absPath, relPath = '') {
        this.#dist.push(new DirentData(absPath, relPath));
    }

    get src() {
        return this.#src;
    }

    get dist() {
        return this.#dist;
    }

    set dist(dist) {
        this.#dist = dist;
    }

}

export default Dirent;
