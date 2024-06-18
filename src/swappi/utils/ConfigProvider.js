import defaultConfig from "../swappi.config.js";
import { deepMerge } from "../helpers/index.js";
import decorateWithSingleton from "./decorateWithSingleton.js";

class ConfigProvider {
  #config;
  get config() {
    return this.#config;
  }

  constructor(config) {
    this.#config = deepMerge(defaultConfig, config);
  }
}

const { init: initConfigProvider, get: getConfigInstance } =
  decorateWithSingleton(ConfigProvider);
const getConfig = () => getConfigInstance().config;
export { initConfigProvider, getConfig };
export default getConfig;
