import { deepMerge } from "../../utils/index.js";

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

  prepareFiles(files) {
    const preparing = [];
    for (let file of files) {
      if (this.test(file.src)) {
        preparing.push(() => (file = this.prepareFile(file)));
      }
    }
    return preparing;
  }

  async prepareFile(file) {
    return file;
  }

  processFiles(files) {
    const processing = [];
    for (let file of files) {
      if (getConfig().force || file.isModified) {
        for (let dist of file.dists) {
          if (this.test(file.src) || this.test(dist)) {
            processing.push(() => (dist = this.process(dist)));
          }
        }
      }
    }
    return processing;
  }

  async process(dist) {
    return dist;
  }
}

export default Processor;
