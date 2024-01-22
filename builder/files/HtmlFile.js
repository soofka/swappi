import File from './File.js';

export class JsFile extends File {

    constructor(absPath, relPath) {
        super(absPath, relPath);
    }

    async parse() {
    }

}

export default JsFile;
