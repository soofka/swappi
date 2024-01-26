import fs from 'fs/promises';
import defaultConfig from './config.js';
import { Directory } from './files/index.js';
import {
    deepMerge,
    isDeepEqual,
} from './helpers/index.js';
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
            old: {}, // old state of src dir (from report)
            new: { // current state of src dir (from file system)
                public: {},
                partials: {},
                templates: {},
            }
        },
        dist: {}, // current state of dist dir (from file system)
    };
    #newConfig = true;

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

        let report;
        getLogger().log(3, 'Loading previous build report');

        try {
            report = JSON.parse(await fs.readFile(getConfig().paths.report, { encoding: 'utf8' }));
        } catch(e) {
            if (!e.code === 'ENOENT') {
                throw e;
            }
            getLogger().log(2, `Previous build report not found (${getConfig().paths.report})`, e);
            return;
        }

        if (isDeepEqual(getConfig(), report.config)) {
            this.#newConfig = false;
        }

        for (let key of Object.keys(report.files)) {
            this.#files.src.old[key] = new Directory(
                (dirent) => getFileProvider().getFile(dirent.src.dir, dirent.src.name, dirent.src.ext),
            ).deserializeAll(report.files[key]);

            getLogger().log(4, `Loading ${key} directory from previous build finished`);
            getLogger().log(5, `${key} directory from previous build:`, JSON.stringify(this.#files.src.old[key].serializeAll(true, true, false)));
        }

        getLogger().log(3, 'Loading previous build report finished');
        getLogger().log(4, 'Previous bulid report:', JSON.stringify(report));

        getLogger().log(2, 'Initializing previous bulid report finished');
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

        this.#files.src.new.templates = new Directory(
            () => getFileProvider().getModuleFile(),
            getConfig().paths.templates,
            [getConfig().paths.generated],
        );

        getLogger().log(3, 'Loading templates');
        await this.#files.src.new.templates.load();
        getLogger().log(3, 'Loading templates finished');
        getLogger().log(4, 'Templates:', JSON.stringify(this.#files.src.new.templates.serializeAll(true, true, false)));

        await this.#files.src.new.templates.resetDist();

        getLogger().log(3, 'Processing templates');
        // compare and mark those to be redone
        await this.#files.src.new.templates.process(this.#files.src.old.templates);
        getLogger().log(3, 'Processing templates finished');
        
        getLogger().log(2, 'Initializing templates finished');
    }

    async #initPartials() {
        getLogger().log(2, 'Initializing partials');

        this.#files.src.new.partials = new Directory(
            () => getFileProvider().getModuleFile(),
            getConfig().paths.partials,
            [getConfig().paths.generated],
        );

        getLogger().log(3, 'Loading partials');
        await this.#files.src.new.partials.load();
        getLogger().log(3, 'Loading partials finished:');
        getLogger().log(4, 'Partials:', JSON.stringify(this.#files.src.new.partials.serializeAll(true, true, false)));

        // compare and mark those to be redone

        getLogger().log(2, 'Initializing partials finished');
    }

    async #initPublic() {
        getLogger().log(2, 'Initializing public');

        this.#files.src.new.public = new Directory(
            (dirent) => getFileProvider().getFile(dirent.path, dirent.name),
            getConfig().paths.public,
            [getConfig().paths.dist],
        );

        getLogger().log(3, 'Loading public');
        await this.#files.src.new.public.load();
        getLogger().log(3, 'Loading public finished');
        getLogger().log(4, 'Public:', JSON.stringify(this.#files.src.new.public.serializeAll(true, true, false)));

        // compare and mark those to be redone

        getLogger().log(2, 'Initializing public finished');
    }

    async build() {
        getLogger().log(1, 'Building');

        getLogger().log(3, 'Processing public');
        await this.#files.src.new.public.process(this.#files.src.old.public, this.#files.dist);
        getLogger().log(3, 'Processing public finished');

        getLogger().log(3, 'Saving build report');
        await this.#saveBuildReport();
        getLogger().log(3, 'Saving build report finished');

        getLogger().log(1, 'Building finished');
    }

    async #saveBuildReport() {
        let report = {
            config: getConfig(),
            files: {},
        };
        for (let key of Object.keys(this.#files.src.old)) {
            report.files[key] = this.#files.src.old[key].serializeAll(true, true, false);
        }
        await fs.writeFile(getConfig().paths.report, JSON.stringify(report));
    }

}

export default Builder;
