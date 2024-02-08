class Processor {
  #options;
  get options() {
    return this.#options;
  }

  constructor(options = {}) {
    this.#options = options;
  }

  test() {
    return true;
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
      for (let dist of file.dists) {
        if (this.test(file.src) || this.test(dist)) {
          processing.push(() => (dist.content = this.process(dist.content)));
        }
      }
    }
    return processing;
  }

  async process(content) {
    return content;
  }
}

export default Processor;
