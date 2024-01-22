import File from './File.js';

export class ModuleFile extends File {

    constructor(absPath, relPath, module) {
        super(absPath, relPath);
        this.srcContent = module;
    }

    async run() {
    }

}

export default ModuleFile;
