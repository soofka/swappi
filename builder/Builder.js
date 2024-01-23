import path from 'path';
import defaultConfig from './config.js';
import Logger from './Logger.js';
import {
    Directory,
    File,
    CssFile,
    HtmlFile,
    ImgFile,
    JsFile,
    JsonFile,
    ModuleFile,
} from './files/index.js';
import { deepMerge, getDirentObject } from './helpers/index.js';

export class Builder {
    #config = {};
    #files = {
        src: {
            public: {},
            partials: {},
            templates: {},
            generated: {}, // do i need this?
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
        this.#logger.log(2, 'Config:', this.#config);

        await this.initTemplates();
        await this.initPartials();
        await this.initPublic();

        this.#logger.log(1, 'Initializing finished');
    }

    async initTemplates() {
        this.#logger.log(2, 'Initializing templates');

        this.#files.src.templates = new Directory(
            () => ModuleFile,
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

    async initPartials() {
        this.#logger.log(2, 'Initializing partials');

        this.#files.src.partials = new Directory(
            () => ModuleFile,
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

    async initPublic() {
        this.#logger.log(2, 'Initializing public');

        this.#files.src.public = new Directory(
            (dirent) => {
                const { ext } = getDirentObject(path.join(dirent.path, dirent.name));
                
                if (this.#config.constants.filesGroupMap.html.includes(ext)) {
                    return HtmlFile;
                } else if (this.#config.constants.filesGroupMap.css.includes(ext)) {
                    return CssFile;
                } else if (this.#config.constants.filesGroupMap.js.includes(ext)) {
                    return JsFile;
                } else if (this.#config.constants.filesGroupMap.json.includes(ext)) {
                    return JsonFile;
                } else if (this.#config.constants.filesGroupMap.img.includes(ext)) {
                    return ImgFile;
                } else {
                    return File;
                }
            },
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

    async build() {
        this.#logger.log(1, 'Building');

        await this.#files.src.public.executeAndSave(this.#config);

        this.#logger.log(1, 'Building finished');
    }

}

export default Builder;
