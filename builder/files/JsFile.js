import File from './File.js';

export class HtmlFile extends File {

    constructor(absPath, relPath) {
        super(absPath, relPath);
    }

    async parse() {
    }

}

export default HtmlFile;
