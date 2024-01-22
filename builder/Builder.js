import defaultConfig from './config.js';
import deepMerge from './helpers/deepMerge.js';
import Directory from './files/Directory.js';
import ModuleFile from './files/ModuleFile.js';

export class Builder {

    #config = {};
    #files = {
        src: {
            public: {},
            partials: {},
            templates: {},
            generated: {},
        },
        dist: {
            old: {},
            new: {},
        },
    };

    constructor(config, files = {}) {
        this.#config = deepMerge(defaultConfig, config);
        this.#files = deepMerge(this.#files, files);

        this.initTemplates();
        this.initPartials();
    }

    async initTemplates() {
        this.#files.src.templates = new Directory(
            () => ModuleFile,
            this.#config.paths.templates,
            [this.#config.paths.generated],
        );

        await this.#files.src.templates.load();
        // compare and mark those to be redone
        this.#files.src.generated = await this.#files.src.templates.executeAndSave();
    }

    async initPartials() {
        this.#files.src.partials = new Directory(
            () => ModuleFile,
            this.#config.paths.partials,
            [this.#config.paths.generated],
        );

        await this.#files.src.partials.load();
    }

}

export default Builder;
