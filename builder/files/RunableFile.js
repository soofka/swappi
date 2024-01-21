import path from 'path';
import File from './File.js';

export class RunableFile extends File {

    module;

    constructor(absPath, relPath) {
        super(absPath, relPath);
    }

    async load() {
        const module = await import(path.join('file:///', this.abs));
        this.module = module.default;
    }

    run(params) {
        return this.module(...params);
    }
    

}

export default RunableFile;
