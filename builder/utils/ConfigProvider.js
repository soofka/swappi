import { decorateWithSingleton } from './decorateWithSingleton.js';

class ConfigProvider {

    #config; get config() { return this.#config }

    constructor(config) {
        this.#config = config;
    }

}

const { init: initConfigProvider, get: getConfigInstance } = decorateWithSingleton(ConfigProvider);
const getConfig = () => getConfigInstance().config;
export { initConfigProvider, getConfig };
export default getConfig;
