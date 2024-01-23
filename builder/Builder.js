import defaultConfig from './config.js';
import Logger from './Logger.js';
import Directory from './files/Directory.js';
import ModuleFile from './files/ModuleFile.js';
import deepMerge from './helpers/deepMerge.js';

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
    #logger;

    constructor(config, files = {}) {
        this.#config = deepMerge(defaultConfig, config);
        this.#files = deepMerge(this.#files, files);
        this.#logger = new Logger(this.#config.options.verbosity);
    }

    async init() {
        this.#logger.log(1, 'Initializing');

        await this.initTemplates();
        await this.initPartials();

        this.#logger.log(1, 'Initializing finished');
    }

    async build() {

    }

    async initTemplates() {
        this.#logger.log(2, 'Initializing templates');

        this.#files.src.templates = new Directory(
            () => ModuleFile,
            this.#config.paths.templates,
            [this.#config.paths.generated],
        );

        await this.#files.src.templates.resetDist();

        this.#logger.log(3, 'Loading templates');
        await this.#files.src.templates.load();
        this.#logger.log(3, 'Loading templates finished:', JSON.stringify(this.#files.src.templates.serializeAll(true, true, false)));

        // compare and mark those to be redone

        this.#logger.log(3, 'Executing and saving templates');
        this.#files.src.generated = await this.#files.src.templates.executeAndSave(this.#config.data);
        this.#logger.log(3, 'Executing and saving templates finished');
        
        this.#logger.log(2, 'Initializing templates finished');
    }

    async initPartials() {
        this.#logger.log(2, 'Initializing partials');

        this.#files.src.partials = new Directory(
            () => ModuleFile,
            this.#config.paths.partials,
            [this.#config.paths.generated],
        );

        this.#logger.log(3, 'Loading partials');
        await this.#files.src.partials.load();
        this.#logger.log(3, 'Loading partials finished:', JSON.stringify(this.#files.src.partials.serializeAll(true, true, false)));

        // compare and mark those to be redone

        this.#logger.log(2, 'Initializing partials finished');
    }

}

export default Builder;
