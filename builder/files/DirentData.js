import path from 'path';
import crypto from 'crypto';

export class DirentData {

    #obj;
    #dir;
    #name;
    #ext;
    #rel;
    #module;
    #content = '';
    #hash = '';

    constructor(absPath, relPath = '') {
        if (absPath) {
            this.init(absPath, relPath);
        }
    }

    init(absPath, relPath = '') {
        this.#obj = path.parse(absPath);
        this.#dir = this.#obj.dir;
        this.#name = this.#obj.name;
        this.#ext = this.#obj.ext;
        this.#rel = relPath;
    }
    
    clone() {
        const clone = new DirentData();
        clone.dir = this.#dir;
        clone.name = this.#name;
        clone.ext = this.#ext;
        clone.rel = this.#rel;
        clone.module = this.#module;
        clone.content = this.#content;
        return clone;
    }

    get obj() {
        return this.#obj;
    }

    get dir() {
        return this.#dir;
    }

    set dir(dir) {
        this.#dir = dir;
    }

    get name() {
        return this.#name;
    }

    set name(name) {
        this.#name = name;
    }

    get ext() {
        return this.#ext;
    }

    set ext(ext) {
        this.#ext = ext;
    }

    get rel() {
        return this.#rel;
    }

    set rel(rel) {
        this.#rel = rel;
    }

    get module() {
        return this.#module;
    }

    set module(module) {
        this.#module = module;
    }

    setModule(module) {
        this.#module = module;
    }

    get content() {
        return this.#content;
    }

    set content(content) {
        this.#content = content;
        this.#hash = Array.isArray(this.#content)
            ? ''
            : crypto.createHash('sha256').update(this.#content).digest('hex');
    }

    get hash() {
        return this.#hash;
    }

    get abs() {
        return path.join(this.#dir, this.full);
    }

    get full() {
        return `${this.#name}${this.#ext}`;
    }

}

export default DirentData;
