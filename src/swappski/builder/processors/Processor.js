import { deepMerge } from "../../helpers/index.js";

class Processor {
  #options;
  get options() {
    return this.#options;
  }

  constructor(
    options = {},
    defaultOptions = {
      test: () => true,
    },
  ) {
    this.#options = deepMerge(options, defaultOptions);
  }

  test(direntData) {
    return this.#options.test(direntData);
  }

  prepareFiles(files) {}

  async prepareFile(file) {
    return file;
  }

  async process(dist) {
    return dist;
  }

  close(src) {
    return src;
  }
}

export default Processor;
