export class Builder {
  #src;
  #dist;
  #report;
  #processors;

  constructor(processors = []) {
    this.#processors = processors; //+fileprocessor?
  }

  async build() {
    await Promise.all(this.#loadReport());
    await Promise.all(this.#init());
    await Promise.all(this.#load());

    await this.#prepare();
    await this.#process();

    await this.#saveReport();
  }

  async #loadReport() {}

  #init() {
    this.#src = new Directory(getConfig().src).init();
    this.#dist = new Directory(getConfig().dist).init();
    return Promise.all([this.#src, this.#dist]);
  }

  #load() {
    return Promise.all(this.#src.load());
  }

  async #prepare() {
    for (let processor of this.#processors) {
      await Promise.all(processor.prepareFiles(this.#src.files));
    }
    this.#deduplicate();
  }

  #deduplicate() {
    if (isDeepEqual(getConfig(), this.#report.config)) {
      for (let file of this.#src.files) {
        const isInReport = isInArray(this.#report.files, (element) =>
          element.isEqual(file),
        );
        //...etc
      }
    }
  }

  async #process() {
    await Promise.all(this.#dist.delete());

    for (let processor of this.#processors) {
      await Promise.all(processor.processFiles(this.#src.files));
    }

    return Promise.all(this.#src.save());
  }

  async #saveReport() {}
}
