import File from './File.js';

export class JsonFile extends File {

    constructor(absPath, relPath) {
        super(absPath, relPath);
    }

    async parse() {
    }

}

export default JsonFile;
