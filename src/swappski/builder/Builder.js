import { Directory } from "./core/index.js";
import {
  isInArray,
  isInObject,
  isObject,
  findInArray,
  saveFile,
} from "../helpers/index.js";
import { getConfig } from "../utils/index.js";

export class Builder {
  #src;
  #dist;
  #report;
  #processors;
  #isNewConfig = true;

  constructor(processors = []) {
    this.#processors = processors; //+fileprocessor?
  }

  async build() {
    await this.#loadReport();

    await this.#init();
    await this.#load();

    await this.#prepare();
    await this.#process();

    await this.#saveReport();
  }

  async #loadReport() {
    const report = loadJson(getConfig().paths.report);
    if (report) {
      if (isInObject(report, "config") && isObject(report.config)) {
        this.#isNewConfig = isDeepEqual(getConfig(), this.#report.config);
      }
      if (isInObject(report, "src") && isObject(report.src)) {
        this.#report = new Directory().deserialize(report.src);
      }
    }
  }

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
    if (this.#isNewConfig) {
      for (let file of this.#src.files) {
        if (isInArray(this.#report.files, (element) => element.isEqual(file))) {
          const newDists = [];
          const oldDistFiles = [];
          for (let dist of file.dists) {
            const oldDistFile = findInArray(this.#dist.files, (element) =>
              element.src.isEqual(dist),
            );
            if (oldDistFile) {
              oldDistFiles.push(oldDistFile);
            } else {
              newDists.push(dist);
            }
          }
          for (let oldDistFile of oldDistFiles) {
            oldDistFile.isModified = false;
          }
          if (newDists.length === 0) {
            file.isModified = false;
          }
          file.dists = newDists;
        }
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

  async #saveReport() {
    return saveFile(
      getConfig().reportFile,
      JSON.stringify({
        config: getConfig(),
        src: this.#src.serialize(),
      }),
    );
  }
}
