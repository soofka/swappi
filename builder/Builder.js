import defaultConfig from './config.js';
import { Directory } from './files/index.js';
import {
    deepMerge,
    findInArray,
    isDeepEqual,
    isInArray,
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
        // await this.#initPartials();
        // await this.#initPublic();

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
        
                this.#report = {};
                for (let key of Object.keys(report.files)) {
                    this.#report[key] = new Directory(
                        (direntObject) => getFileProvider()
                            .getFile(direntObject.absDir, direntObject.name, direntObject.ext),
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

        this.#files.templates.src = await new Directory(
            () => getFileProvider().getModuleFile(),
            getConfig().paths.templates.src,
        );
        await this.#files.templates.src.load();
        await this.#files.templates.src.prepare(getConfig().paths.templates.dist);

        this.#deduplicateTemplates();

        this.#files.templates.dist.old.reset();
        this.#files.templates.dist.new = await this.#files.templates.src.process();
        
        getLogger().log(2, 'Initializing templates finished');

    }

    #deduplicateTemplates() {
        getLogger().log(3, `Deduplicating templates`);

        for (let template of this.#files.templates.src.allDirents) {
            if (this.#report && isInArray(this.#report.files.templates.src.allDirents, (element) => element.isEqual(template))) {
                let templateFiles = [];

                for (let dist of template.dist) {
                    const templateFile = findInArray(this.#files.templates.dist.old.allDirents, (element) => element.src.equals(dist));
                    if (templateFile) {
                        templateFiles.push(templateFile);
                    } else {
                        templateFiles = [];
                        break;
                    }
                }

                if (templateFiles.length > 0) {
                    template.modified = false;
                    
                    for (let templateFile of templateFiles) {
                        templateFile.modified = false;
                    }
                }
            }
        }
        
        getLogger().log(3, `Templates deduplicated`);
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

        // getLogger().log(3, 'Processing public');
        // await this.#files.src.new.public.process(this.#files.src.old.public, this.#files.dist);
        // getLogger().log(3, 'Processing public finished');

        // getLogger().log(3, 'Saving build report');
        // await this.#saveBuildReport();
        // getLogger().log(3, 'Saving build report finished');

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
        await saveFile(getConfig().paths.report, JSON.stringify(report));
    }

}

export default Builder;
