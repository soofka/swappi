import { deepMerge } from "../../helpers/index.js";

class Provider {
  #options;
  get options() {
    return this.#options;
  }

  constructor(options = {}, defaultOptions = {}) {
    this.#options = deepMerge(options, defaultOptions);
  }

  provide(src) {
    return src;
  }
}

export default Provider;
