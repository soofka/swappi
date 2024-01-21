import path from 'path';

export class Dirent {

    obj;
    root;
    dir;
    base;
    name;
    abs;
    rel;

    constructor(absPath, relPath = '') {
        this.obj = path.parse(absPath);
        this.root = this.obj.root;
        this.dir = this.obj.dir;
        this.base = this.obj.base;
        this.name = this.obj.name;
        this.abs = absPath;
        this.rel = relPath;
    }

    getRoot() {
        return this.root;
    }

    getDir() {
        return this.dir;
    }

    getBase() {
        return this.base;
    }

    getName() {
        return this.name;
    }

    getAbs() {
        return this.abs;
    }

    getRel() {
        return this.rel;
    }
}

export default Dirent;
