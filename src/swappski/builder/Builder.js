import { Directory } from "./core/index.js";
import {
  isDeepEqual,
  isInArray,
  isInObject,
  isObject,
  findInArray,
  loadJson,
  saveFile,
} from "../helpers/index.js";
import { getConfig, getLogger } from "../utils/index.js";

export class Builder {
  #src;
  #dist;
  #report;
  #processors;
  #isNewConfig = true;

  constructor(processors) {
    this.#processors = processors || getConfig().processors;
  }

  async build() {
    await this.#loadReport();

    await this.#init();
    await this.#load();

    await this.#prepare();
    await this.#deduplicate();

    await this.#delete();
    await this.#process();
    await this.save();

    await this.#saveReport();
  }

  async #loadReport() {
    getLogger().log("Loading build report").logLevelUp();

    const report = loadJson(getConfig().reportFile);
    if (report) {
      if (isInObject(report, "config") && isObject(report.config)) {
        this.#isNewConfig = !isDeepEqual(getConfig(), this.#report.config);
      }
      if (isInObject(report, "src") && isObject(report.src)) {
        this.#report = new Directory().deserialize(report.src);
      }
    }

    getLogger().logLevelDown().log("Build report loaded");
  }

  async #init() {
    getLogger().log("Initializing directories").logLevelUp();

    // can be redone to promis all
    this.#src = await new Directory(getConfig().src).init();
    this.#dist = await new Directory(getConfig().dist).init();

    getLogger().logLevelDown().log("Directories initialized");
  }

  async #load() {
    getLogger().log("Loading files").logLevelUp();

    await Promise.all(this.#src.load());

    getLogger().logLevelDown().log("Files loaded");
  }

  async #prepare() {
    getLogger().log("Preparing files").logLevelUp();

    for (let processor of this.#processors) {
      getLogger().log(`Processor: ${processor.constructor.name}`).logLevelUp();
      const preparing = [];
      for (let file of this.#src.files) {
        getLogger().log(`Testing file ${file.src.rel}`).logLevelUp();
        if (processor.test(file.src)) {
          getLogger().log(`Preparing file ${file.src.rel}`);
          preparing.push(async () => (file = await this.prepareFile(file)));
        }
        getLogger().logLevelDown();
      }
      getLogger().logLevelDown();
      await Promise.all(preparing);
    }

    getLogger().logLevelDown().log("Files prepared");
  }

  #deduplicate() {
    getLogger().log("Deduplicating files").logLevelUp();

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
            getLogger().log(`File not modified: ${oldDistFile.src.rel}`);
            oldDistFile.isModified = false;
          }
          if (newDists.length === 0) {
            getLogger().log(`File not modified: ${file.src.rel}`);
            file.isModified = false;
          }
          file.dists = newDists;
        }
      }
    }

    getLogger().logLevelDown().log("Files deduplicated");
  }

  async #delete() {
    getLogger().log("Deleting files").logLevelUp();

    await Promise.all(this.#dist.delete());

    getLogger().logLevelDown().log("Files deleted");
  }

  async #process() {
    getLogger().log("Processing files").logLevelUp();

    for (let processor of this.#processors) {
      getLogger().log(`Processor: ${processor.constructor.name}`).logLevelUp();
      const processing = [];
      for (let file of this.#src.files) {
        if (getConfig().force || file.isModified) {
          getLogger().log(`File ${file.src.rel} is modified`).logLevelUp();
          for (let dist of file.dists) {
            getLogger().log(`Testing file ${file.src.rel}`).logLevelUp();
            if (this.test(file.src) || this.test(dist)) {
              getLogger().log(`Dist: ${dist.rel}`);
              processing.push(() => (dist = this.process(dist)));
            }
            getLogger().logLevelDown();
          }
          getLogger().logLevelDown();
        }
      }
      getLogger().logLevelDown();
      await Promise.all(processing);
    }

    getLogger().logLevelDown().log("Files processed");
  }

  async save() {
    getLogger().log("Saving files").logLevelUp();

    await Promise.all(this.#src.save());

    getLogger().logLevelDown().log("Files saved");
  }

  async #saveReport() {
    getLogger().log("Saving report").logLevelUp();

    await saveFile(
      getConfig().reportFile,
      JSON.stringify({
        config: getConfig(),
        src: this.#src.serialize(),
      }),
    );

    getLogger().logLevelDown().log("Report saved");

    if (getConfig().logFile && getConfig.logFile !== "") {
      getLogger().log("Saving log file").logLevelUp();

      await saveFile(getConfig().reportFile, getLogger().logs.join("\r\n"));

      getLogger().logLevelDown().log("Log file saved");
    }
  }
}

export default Builder;
