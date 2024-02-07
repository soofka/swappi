export class Builder {
  #src;
  #dist;
  #report;
  #processors;

  constructor(processors) {
    this.#processors = [new BaseProcessor(), ...processors];
  }

  async build() {
    await this.#loadReport();

    await this.#init();
    await this.#load(); // load just before saving to not store in memory for a long time maybe?

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
    return this.#src.load();
  }

  #prepare() {
    for (let processor of this.#processors) {
      for (let file of this.#src.files) {
        if (processor.test(file)) {
          file = processor.prepareFile(file);
        }
      }
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
    const deleting = [];
    for (let file of this.#dist.files) {
      if (file.isModified) {
        deleting.push(file.delete());
      }
    }

    const processing = [];
    for (let processor of this.#processors) {
      for (let file of this.#src.files) {
        processing.push(this.#processFile(processor, file));
      }
    }

    await Promise.all([...deleting, ...processing]);

    const saving = [];
    for (let file of this.#src.files) {
      saving.push(file.save());
    }

    return Promise.all(saving);
  }

  async #processFile(processor, file) {
    if (file.shouldBeProcessed()) {
      file = await processor.processFile(file, this.#src);
    }
    return file.save();
  }

  async #saveReport() {}
}
