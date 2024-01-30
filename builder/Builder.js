import defaultConfig from './config.js';
import { Directory } from './files/index.js';
import {
    deepMerge,
    isDeepEqual,
    isObject,
    loadFile,
    parseJson,
    saveFile,
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
    };
    #report = false;
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
                getLogger().log(4, `Config has ${this.#newConfig ? '' : 'not '}changed`);
        
                this.#report = {};
                for (let key of Object.keys(report.files)) {
                    this.#report[key] = new Directory(
                        (direntObject) => getFileProvider().getFile(direntObject.absDir, direntObject.name, direntObject.ext),
                    ).deserializeAll(report.files[key]);
                }
        
                getLogger().log(3, 'Loading previous build report finished');
                getLogger().log(4, 'Previous bulid report:', report);
            } else {
                getLogger().warn(3, `Invalid previous build report content (content: ${reportJson})`);
            }
        } else {
            getLogger().warn(3, `Previous build report not found (path: ${getConfig().paths.report})`);
        }
        
        getLogger().log(2, 'Previous bulid report initialized');
    }

    async #initTemplates() {
        getLogger().log(2, `Initializing templates (path: ${JSON.stringify(getConfig().paths.templates)})`);

        this.#files.templates.dist.old = new Directory(
            (nodeDirent) => getFileProvider().getFile(nodeDirent.path, nodeDirent.name),
            getConfig().paths.templates.dist,
        );
        await this.#files.templates.dist.old.load();

        this.#files.templates.src = new Directory(
            () => getFileProvider().getModuleFile(),
            getConfig().paths.templates.src,
        );
        await this.#files.templates.src.load();
        await this.#files.templates.src.prepare(
            getConfig().paths.templates.dist,
            this.#report && this.#report.files.templates,
            this.#files.templates.dist.old,
        );
        
        getLogger().log(2, 'Initializing templates finished');

    }

    async #initPartials() {
        getLogger().log(2, `Initializing partials (path: ${JSON.stringify(getConfig().paths.partials)})`);

        this.#files.partials.dist.old = new Directory(
            (nodeDirent) => getFileProvider().getFile(nodeDirent.path, nodeDirent.name),
            getConfig().paths.partials.dist,
        );
        await this.#files.partials.dist.old.load();

        this.#files.partials.src = new Directory(
            () => getFileProvider().getModuleFile(),
            getConfig().paths.partials.src,
        );
        await this.#files.partials.src.load();
        await this.#files.partials.src.prepare(
            getConfig().paths.partials.dist,
            this.#report && this.#report.files.partials,
            this.#files.partials.dist.old,
        );

        getLogger().log(2, 'Initializing partials finished');
    }

    async #initPublic() {
        getLogger().log(2, `Initializing public (path: ${JSON.stringify(getConfig().paths.public)})`);

        this.#files.public.dist.old = new Directory(
            (nodeDirent) => getFileProvider().getFile(nodeDirent.path, nodeDirent.name),
            getConfig().paths.public.dist,
        );
        await this.#files.public.dist.old.load();

        this.#files.public.src = new Directory(
            (nodeDirent) => getFileProvider().getFile(nodeDirent.path, nodeDirent.name),
            getConfig().paths.public.src,
        );
        await this.#files.public.src.load();
        await this.#files.public.src.prepare(
            getConfig().paths.public.dist,
            this.#report && this.#report.files.public,
            this.#files.public.dist.old,
        );

        getLogger().log(2, 'Initializing public finished');
    }

    async build() {
        getLogger().log(1, 'Building');

        await this.#buildTemplates();
        await this.#buildPartials();
        await this.#buildPublic();
        await this.#saveReport();

        getLogger().log(1, 'Building finished');
    }

    async #buildTemplates() {
        getLogger().log(2, 'Building templates');

        await this.#files.templates.dist.old.reset();
        this.#files.templates.dist.new = await this.#files.templates.src.process();

        getLogger().log(2, 'Building templates finished');
    }

    async #buildPartials() {
        getLogger().log(2, 'Building partials');

        await this.#files.partials.dist.old.reset();
        this.#files.partials.dist.new = await this.#files.partials.src.process();

        getLogger().log(2, 'Building partials finished');
    }

    async #buildPublic() {
        getLogger().log(2, 'Building public');

        await this.#files.public.dist.old.reset();
        this.#files.public.dist.new = await this.#files.public.src.process();

        getLogger().log(2, 'Building public finished');
    }

    async #saveReport() {
        getLogger().log(3, 'Saving current build report');

        await saveFile(getConfig().paths.report, JSON.stringify({
            config: getConfig(),
            files: {
                templates: this.#files.templates.src.serialize(true, true, false),
                partials: this.#files.partials.src.serialize(true, true, false),
                public: this.#files.public.src.serialize(true, true, false),
            },
        }));

        getLogger().log(3, 'Saving current build report finished');
    }

}

export default Builder;
