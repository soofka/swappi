import Dirent from './Dirent.js';

const HASH_ALGORITHM = 'sha256';
const HASH_SEPARATOR = '+';

export class File extends Dirent {

    ext;
    content;
    contentHash;

    constructor(absPath, relPath) {
        super(absPath, relPath);
        this.ext = this.obj.ext;
        // const hashSeparatorIndex = this.name.lastIndexOf(HASH_SEPARATOR);
        // if (hashSeparatorIndex >= 0) {
        //     this.hash = this.name.substring(hashSeparatorIndex + 1);
        //     this.name = this.name.substring(0, hashSeparatorIndex);
        // }
    }

    calculateContentHash() {
        this.contentHash = crypto.createHash(HASH_ALGORITHM).update(this.content).digest('hex');;
    }

    isDir() {
        return false;
    }

    getExt() {
        return this.ext;
    }

    getHash() {
        return this.hash;
    }

    getContent() {
        return this.content;
    }

}

export default File;
