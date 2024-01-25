import fs from 'fs/promises';
import defaultConfig from './config.js';
import { Directory } from './files/index.js';
import { deepMerge } from './helpers/index.js';
import {
    initConfigProvider,
    getConfig,
    initFileProvider,
    getFileProvider,
    initLoggerProvider,
    getLogger,
} from './utils/index.js';

export class Builder {
    
    #files = {
        src: {
            public: {},
            partials: {},
            templates: {},
        },
        dist: {},
        report: {},
    };

    constructor(config) {
        initConfigProvider(deepMerge(defaultConfig, config));
        initLoggerProvider(getConfig().options.verbosity);
        initFileProvider(getConfig().constants.filesGroupMap);
    }

    async init() {
        getLogger().log(1, 'Initializing');
        getLogger().log(2, 'Config:', JSON.stringify(getConfig()));

        await this.#initReport();
        await this.#initDist();
        await this.#initTemplates();
        await this.#initPartials();
        await this.#initPublic();

        getLogger().log(1, 'Initializing finished');
    }

    async #initReport() {
        getLogger().log(2, 'Initializing previous build report');

        const report = JSON.parse(await fs.readFile(getConfig().paths.report, { encoding: 'utf8' }));
        console.log('wut', report)
        for (let key of Object.keys(report)) {
            console.log('gonna parse', key, report[key]);
            this.#files.report[key] = new Directory().deserializeAll(report[key]);
            console.log('parsed', key, this.#files.report[key].direntList);
        }

        getLogger().log(2, 'Initializing previous bulid report finished');
        getLogger().log(3, 'Previous bulid report:', JSON.stringify(this.#files.report.public.serializeAll(true, true, false)));
    }

    async #initDist() {
        getLogger().log(2, 'Initializing dist');

        this.#files.dist = new Directory(
            (dirent) => getFileProvider().getFile(dirent.path, dirent.name),
            getConfig().paths.dist,
        );

        getLogger().log(3, 'Loading dist');
        await this.#files.dist.load();
        getLogger().log(3, 'Loading dist finished');
        getLogger().log(4, 'Dist:', JSON.stringify(this.#files.dist.serializeAll(true, true, false)));

        // compare and mark those to be redone

        getLogger().log(2, 'Initializing dist finished');
    }

    async #initTemplates() {
        getLogger().log(2, 'Initializing templates');

        this.#files.src.templates = new Directory(
            () => getFileProvider().getModuleFile(),
            getConfig().paths.templates,
            [getConfig().paths.generated],
        );

        getLogger().log(3, 'Loading templates');
        await this.#files.src.templates.load();
        getLogger().log(3, 'Loading templates finished');
        getLogger().log(4, 'Templates:', JSON.stringify(this.#files.src.templates.serializeAll(true, true, false)));

        // compare and mark those to be redone

        await this.#files.src.templates.resetDist();

        getLogger().log(3, 'Executing and saving templates');
        await this.#files.src.templates.executeAndSave();
        getLogger().log(3, 'Executing and saving templates finished');
        
        getLogger().log(2, 'Initializing templates finished');
    }

    async #initPartials() {
        getLogger().log(2, 'Initializing partials');

        this.#files.src.partials = new Directory(
            () => getFileProvider().getModuleFile(),
            getConfig().paths.partials,
            [getConfig().paths.generated],
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
            (dirent) => getFileProvider().getFile(dirent.path, dirent.name),
            getConfig().paths.public,
            [getConfig().paths.dist],
        );

        getLogger().log(3, 'Loading public');
        await this.#files.src.public.load();
        getLogger().log(3, 'Loading public finished');
        getLogger().log(4, 'Public:', JSON.stringify(this.#files.src.public.serializeAll(true, true, false)));

        // compare and mark those to be redone

        getLogger().log(2, 'Initializing public finished');
    }

    async build() {
        getLogger().log(1, 'Building');

        getLogger().log(3, 'Executing and saving public');
        await this.#files.src.public.executeAndSave();
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
        await fs.writeFile(getConfig().paths.report, JSON.stringify(report));
    }

}

export default Builder;
