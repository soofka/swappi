import File from './File.js';

export class ImgFile extends File {

    constructor(absPath, relPath) {
        super(absPath, relPath);
    }

    async parse() {
    }

}

export default ImgFile;
