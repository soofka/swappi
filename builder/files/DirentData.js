import path from 'path';
import { getDirentObject } from '../helpers/index.js';

export class DirentData {

    #dir; get dir() { return this.#dir } set dir(value) { this.#dir = value }
    #name; get name() { return this.#name } set name(value) { this.#name = value }
    #ext; get ext() { return this.#ext } set ext(value) { this.#ext = value }
    #rel; get rel() { return this.#rel } set rel(value) { this.#rel = value }

    constructor(absPath, relPath = '') {
        if (absPath) {
            const obj = getDirentObject(absPath);
            this.#dir = obj.dir;
            this.#name = obj.name;
            this.#ext = obj.ext;
        }
        this.#rel = relPath;
    }
    
    clone() {
        const clone = new DirentData();
        clone.dir = this.#dir;
        clone.name = this.#name;
        clone.ext = this.#ext;
        clone.rel = this.#rel;
        return clone;
    }

    isEqual(direntData) {
        return this.#dir === direntData.dir
            && this.#name === direntData.name
            && this.#ext === direntData.ext
            && this.#rel === direntData.rel;
    }

    serialize() {
        return {
            dir: this.#dir,
            name: this.#name,
            ext: this.#ext,
            rel: this.#rel,
        }
    }

    deserialize({ dir, name, ext, rel}) {
        this.#dir = dir;
        this.#name = name;
        this.#ext = ext;
        this.#rel = rel;
        return this;
    }

    get abs() { return path.join(this.#dir, this.full) }
    get full() { return `${this.#name}${this.#ext}` }

}

export default DirentData;
