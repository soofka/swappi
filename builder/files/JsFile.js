import { minify } from 'terser';
import File from './File.js';

export class JsFile extends File {

    constructor(absPath, relPath) {
        super(absPath, relPath);
    }

    async execute(dist, index, config) {
        const contentMinified = await minify(this.content, config.options.optimize.js);
        return contentMinified.code;
    }

}

export default JsFile;
