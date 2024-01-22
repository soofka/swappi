import defaultConfig from './config.js';
import deepMerge from './helpers/deepMerge.js';

export class Builder {

    #config;
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
    }

}

export default Builder;
