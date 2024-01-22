import path from 'path';

export class Dirent {

    #obj;

    #srcRoot;
    #srcDir;
    #srcName;
    #srcRel;

    _distRoot;
    _distDir;
    _distName;
    _distRel;

    constructor(absPath, relPath = '') {
        this.#obj = path.parse(absPath);
        this.#srcRoot = this.#obj.root;
        this.#srcDir = this.#obj.dir;
        this.#srcName = this.#obj.name;
        this.#srcRel = relPath;
    }

    get obj() {
        return this.#obj;
    }

    get srcRoot() {
        return this.#srcRoot;
    }

    get srcDir() {
        return this.#srcDir;
    }

    get srcName() {
        return this.#srcName;
    }

    get srcRel() {
        return this.#srcRel;
    }

    get srcAbs() {
        return path.join(this.#srcDir, this.#srcName);
    }

    get distRoot() {
        return this._distRoot;
    }

    set distRoot(root) {
        this._distDir = this._distDir.replace(this._distRoot, root);
        this._distRoot = root;
    }

    get distDir() {
        return this._distDir;
    }

    set distDir(dir) {
        this._distRoot = dir.split(path.sep)[0];
        this._distDir = dir;
    }

    get distName() {
        return this._distName;
    }

    set distName(name) {
        this._distName = name;
    }

    get distAbs() {
        return path.join(this._distDir, this._distName);
    }

}

export default Dirent;
