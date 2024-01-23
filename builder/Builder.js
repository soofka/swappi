import fs from 'fs/promises';
import defaultConfig from './config.js';
import Logger from './Logger.js';
import { Directory, FileFactory } from './files/index.js';
import { deepMerge, getDirentObject } from './helpers/index.js';

export class Builder {
    #config = {};
    #files = {
        src: {
            public: {},
            partials: {},
            templates: {},
        },
        dist: {},
    };
    #logger;

    constructor(config, files = {}) {
        this.#config = deepMerge(defaultConfig, config);
        this.#files = deepMerge(this.#files, files);
        this.#logger = new Logger(this.#config.options.verbosity);
    }

    async init() {
        this.#logger.log(1, 'Initializing');
        this.#logger.log(2, 'Config:', JSON.stringify(this.#config));

        await this.#initTemplates();
        await this.#initPartials();
        await this.#initPublic();
        await this.#initDist();

        this.#logger.log(1, 'Initializing finished');
    }

    async #initTemplates() {
        this.#logger.log(2, 'Initializing templates');

        this.#files.src.templates = new Directory(
            () => FileFactory.getModuleFile(),
            this.#config.paths.templates,
            [this.#config.paths.generated],
        );

        this.#logger.log(3, 'Loading templates');
        await this.#files.src.templates.load();
        this.#logger.log(3, 'Loading templates finished');
        this.#logger.log(4, 'Templates:', JSON.stringify(this.#files.src.templates.serializeAll(true, true, false)));

        // compare and mark those to be redone

        await this.#files.src.templates.resetDist();

        this.#logger.log(3, 'Executing and saving templates');
        await this.#files.src.templates.executeAndSave(this.#config);
        this.#logger.log(3, 'Executing and saving templates finished');
        
        this.#logger.log(2, 'Initializing templates finished');
    }

    async #initPartials() {
        this.#logger.log(2, 'Initializing partials');

        this.#files.src.partials = new Directory(
            () => FileFactory.getModuleFile(),
            this.#config.paths.partials,
            [this.#config.paths.generated],
        );

        this.#logger.log(3, 'Loading partials');
        await this.#files.src.partials.load();
        this.#logger.log(3, 'Loading partials finished:');
        this.#logger.log(4, 'Partials:', JSON.stringify(this.#files.src.partials.serializeAll(true, true, false)));

        // compare and mark those to be redone

        this.#logger.log(2, 'Initializing partials finished');
    }

    async #initPublic() {
        this.#logger.log(2, 'Initializing public');

        this.#files.src.public = new Directory(
            (dirent) => FileFactory.getFile(this.#config.constants.filesGroupMap, dirent.path, dirent.name),
            this.#config.paths.public,
            [this.#config.paths.dist],
        );

        this.#logger.log(3, 'Loading public');
        await this.#files.src.public.load();
        this.#logger.log(3, 'Loading public finished');
        this.#logger.log(4, 'Public:', JSON.stringify(this.#files.src.public.serializeAll(true, true, false)));

        // compare and mark those to be redone

        this.#logger.log(2, 'Initializing public finished');
    }

    async #initDist() {
        this.#logger.log(2, 'Initializing dist');

        this.#files.dist = new Directory(
            (dirent) => FileFactory.getFile(this.#config.constants.filesGroupMap, dirent.path, dirent.name),
            this.#config.paths.dist,
        );

        this.#logger.log(3, 'Loading dist');
        await this.#files.dist.load();
        this.#logger.log(3, 'Loading dist finished');
        this.#logger.log(4, 'Dist:', JSON.stringify(this.#files.dist.serializeAll(true, true, false)));

        // compare and mark those to be redone

        this.#logger.log(2, 'Initializing dist finished');
    }


    async build() {
        this.#logger.log(1, 'Building');

        this.#logger.log(3, 'Executing and saving public');
        await this.#files.src.public.executeAndSave(this.#config);
        this.#logger.log(3, 'Executing and saving public finished');

        this.#logger.log(3, 'Saving build report');
        await this.#saveBuildReport();
        this.#logger.log(3, 'Saving build report finished');

        this.#logger.log(1, 'Building finished');
    }

    async #saveBuildReport() {
        let report = {};
        for (let key of Object.keys(this.#files.src)) {
            report[key] = this.#files.src[key].serializeAll(true, true, false);
        }
        await fs.writeFile(this.#config.paths.report, JSON.stringify(report));
    }

}

export default Builder;
