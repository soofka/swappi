class Processor {
  test() {
    return true;
  }

  prepareFiles(files) {
    const preparing = [];
    for (let file of files) {
      if (this.test(file)) {
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
      if (this.test(file)) {
        processing.push(() => (file = this.processFile(file, files)));
      }
    }
    return processing;
  }

  async processFile(file) {
    return file;
  }
}

export default Processor;
