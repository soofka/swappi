import fs from 'fs/promises';
import defaultConfig from './config.js';
import { Directory } from './files/index.js';
import { deepMerge } from './helpers/index.js';
import {
    initFileFactory,
    getFileFactory,
    initLogger,
    getLogger,
} from './utils/index.js';

export class Builder {
    #config = {};
    #files = {
        src: {
            public: {},
            partials: {},
            templates: {},
        },
        dist: {
            old: {},
            new: {},
        },
    };

    constructor(config, files = {}) {
        this.#config = deepMerge(defaultConfig, config);
        this.#files = deepMerge(this.#files, files);

        initFileFactory(this.#config.constants.filesGroupMap);
        initLogger(this.#config.options.verbosity);
    }

    async init() {
        getLogger().log(1, 'Initializing');
        getLogger().log(2, 'Config:', JSON.stringify(this.#config));

        await this.#initTemplates();
        await this.#initPartials();
        await this.#initPublic();
        await this.#initOldDist();
        await this.#initNewDist();

        getLogger().log(1, 'Initializing finished');
    }

    async #initTemplates() {
        getLogger().log(2, 'Initializing templates');

        this.#files.src.templates = new Directory(
            () => getFileFactory().getModuleFile(),
            this.#config.paths.templates,
            [this.#config.paths.generated],
        );

        getLogger().log(3, 'Loading templates');
        await this.#files.src.templates.load();
        getLogger().log(3, 'Loading templates finished');
        getLogger().log(4, 'Templates:', JSON.stringify(this.#files.src.templates.serializeAll(true, true, false)));

        // compare and mark those to be redone

        await this.#files.src.templates.resetDist();

        getLogger().log(3, 'Executing and saving templates');
        await this.#files.src.templates.executeAndSave(this.#config);
        getLogger().log(3, 'Executing and saving templates finished');
        
        getLogger().log(2, 'Initializing templates finished');
    }

    async #initPartials() {
        getLogger().log(2, 'Initializing partials');

        this.#files.src.partials = new Directory(
            () => getFileFactory().getModuleFile(),
            this.#config.paths.partials,
            [this.#config.paths.generated],
        );

        getLogger().log(3, 'Loading partials');
        await this.#files.src.partials.load();
        getLogger().log(3, 'Loading partials finished:');
        getLogger().log(4, 'Partials:', JSON.stringify(this.#files.src.partials.serializeAll(true, true, false)));

        // compare and mark those to be redone

        getLogger().log(2, 'Initializing partials finished');
    }

    async #initPublic() {
        getLogger().log(2, 'Initializing public');

        this.#files.src.public = new Directory(
            (dirent) => getFileFactory().getFile(dirent.path, dirent.name),
            this.#config.paths.public,
            [this.#config.paths.dist],
        );

        getLogger().log(3, 'Loading public');
        await this.#files.src.public.load();
        getLogger().log(3, 'Loading public finished');
        getLogger().log(4, 'Public:', JSON.stringify(this.#files.src.public.serializeAll(true, true, false)));

        // compare and mark those to be redone

        getLogger().log(2, 'Initializing public finished');
    }

    async #initOldDist() {
        getLogger().log(2, 'Initializing old dist');

        this.#files.dist.old = new Directory(
            (dirent) => getFileFactory().getFile(dirent.path, dirent.name),
            this.#config.paths.dist,
        );

        getLogger().log(3, 'Loading old dist');
        await this.#files.dist.old.load();
        getLogger().log(3, 'Loading old dist finished');
        getLogger().log(4, 'Old dist:', JSON.stringify(this.#files.dist.old.serializeAll(true, true, false)));

        // compare and mark those to be redone

        getLogger().log(2, 'Initializing old dist finished');
    }

    async #initNewDist() {

    }

    async build() {
        getLogger().log(1, 'Building');

        getLogger().log(3, 'Executing and saving public');
        await this.#files.src.public.executeAndSave(this.#config);
        getLogger().log(3, 'Executing and saving public finished');

        getLogger().log(3, 'Saving build report');
        await this.#saveBuildReport();
        getLogger().log(3, 'Saving build report finished');

        getLogger().log(1, 'Building finished');
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
