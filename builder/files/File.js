import Dirent from './Dirent.js';

export class File extends Dirent {

    #srcExt;
    #srcContent;
    #srcContentHash;

    _distExt;
    _distContent;
    _distContentHash;

    constructor(absPath, relPath) {
        super(absPath, relPath);
        this.#srcExt = this.obj.ext;
    }

    async load() {
        if (!this.#srcContent) {
            this.#srcContent = await fs.readFile(this.srcAbs, { encoding: 'utf8' });
        }
    }

    async parse() {
        this._distContent = this.#srcContent;
        this._distContentHash = this.#srcContentHash;
    }

    async save() {
        try {
            await fs.stat(this.distAbs);
        } catch(e) {
            if (e.code !== 'ENOENT') {
                throw e;
            }
            fs.mkdir(path.dirname(this.distAbs), { recursive: true });
        }
        await fs.writeFile(this.distAbs, this._distContent);
    }

    calculateContentHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex');;
    }

    get srcExt() {
        return this.#srcExt;
    }

    get srcFull() {
        return `${this.srcName}${this.#srcExt}`;
    }

    get srcAbs() {
        return path.join(this.srcDir, this.srcFull);
    }

    get srcContent() {
        return this.#srcContent;
    }

    set srcContent(content) {
        this.#srcContent = content;
        this.#srcContentHash = this.calculateContentHash(this.#srcContent);
    }

    get srcContentHash() {
        return this.#srcContentHash;
    }

    get distExt() {
        return this._distExt;
    }

    set distExt(ext) {
        this._distExt = ext;
    }

    get distName() {
        return this._distName;
    }

    set distName(name) {
        this._distName = name;
    }

    get distFull() {
        return `${this._distName}${this._distExt}`;
    }

    get distAbs() {
        return path.join(this._distDir, this.distFull);
    }

    get distContent() {
        return this._distContent;
    }

    set distContent(content) {
        this._distContent = content;
    }

    get distContentHash() {
        return this._distContentHash;
    }

    isDir() {
        return false;
    }

}

export default File;
