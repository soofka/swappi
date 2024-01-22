import File from './File.js';

export class CssFile extends File {

    constructor(absPath, relPath) {
        super(absPath, relPath);
    }

    async parse() {
    }

}

export default CssFile;
