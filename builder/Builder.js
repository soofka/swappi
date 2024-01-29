import fs from 'fs/promises';
import defaultConfig from './config.js';
import { Directory } from './files/index.js';
import {
    deepMerge,
    isDeepEqual,
    isObject,
    loadFile,
    parseJson,
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
        public: { src: {}, dist: { old: {}, new: {} }},
        partials: { src: {}, dist: { old: {}, new: {} }},
        templates: { src: {}, dist: { old: {}, new: {} }},
        report: {},
    };
    #newConfig = true;

    constructor(config) {
        initConfigProvider(deepMerge(defaultConfig, config));
        initLoggerProvider(getConfig().options.verbosity);
        initFileProvider(getConfig().constants.filesGroupMap);
    }

    async init() {
        getLogger().log(1, 'Initializing build');
        getLogger().log(3, 'Config:', JSON.stringify(getConfig()));

        await this.#initReport();
        await this.#initTemplates();
        await this.#initPartials();
        await this.#initPublic();

        getLogger().log(1, 'Build initialized');
    }

    async #initReport() {
        getLogger().log(2, `Initializing previous build report (path: ${getConfig().paths.report})`);

        getLogger().log(3, 'Loading previous build report');
        const report = await loadFile(getConfig().paths.report);
        if (report) {
            const reportJson = parseJson(report);
            if (reportJson && isObject(reportJson)
                && report.hasOwnProperty('config') && isObject(reportJson.config)
                && report.hasOwnProperty('files') && isObject(reportJson.files)
            ) {
                this.#newConfig = !isDeepEqual(getConfig(), reportJson.config);
                getLogger().log(4, `Config has ${this.#newConfig ? '' : 'NOT '}changed`);
        
                for (let key of Object.keys(report.files)) {
                    this.#files.report[key] = new Directory(
                        (direntObject) => getFileProvider()
                            .getFile(direntObject.absDir, direntObject.name, direntObject.ext),
                    ).deserializeAll(report.files[key]);
                }
        
                getLogger().log(3, 'Loading previous build report finished');
                getLogger().log(4, 'Previous bulid report:', report);
            } else {
                getLogger().log(3, `Invalid previous build report content (content: ${reportJson})`);
            }
        } else {
            getLogger().log(3, `Previous build report not found (path: ${getConfig().paths.report})`);
        }
        
        getLogger().log(2, 'Previous bulid report initialized');
    }

    async #initDist() {
        getLogger().log(2, 'Initializing dist');

        this.#files.dist = new Directory(
            (nodeDirent) => getFileProvider().getFile(nodeDirent.path, nodeDirent.name),
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
        getLogger().log(2, `Initializing templates (path: ${JSON.stringify(getConfig().paths.templates)})`);

        this.#files.templates.src = await new Directory(
            () => getFileProvider().getModuleFile(),
            getConfig().paths.templates.src,
        ).load().prepare(getConfig().paths.templates.dist);

        this.#files.templates.dist.old = await new Directory(
            (nodeDirent) => getFileProvider().getFile(nodeDirent.path, nodeDirent.name),
            getConfig().paths.templates.dist,
        ).load();

        this.#files.templates.dist.new = await deduplicateTemplates( // <==== next step
            this.#files.templates.src,
            this.#files.templates.dist.old,
        ).process();


        // getLogger().log(3, `Loading templates src (abs: ${this.#files.templates.src.abs})`);
        // await this.#files.src.new.templates.load();
        // getLogger().log(3, 'Loading templates finished');
        // getLogger().log(4, 'Templates:', JSON.stringify(this.#files.src.new.templates.serializeAll(true, true, false)));

        // await this.#files.src.new.templates.resetDist();

        // getLogger().log(3, 'Processing templates');
        // // compare and mark those to be redone
        // await this.#files.src.new.templates.process(this.#files.src.old.templates);
        // getLogger().log(3, 'Processing templates finished');
        
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
