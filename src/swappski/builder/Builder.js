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
    await this.#delete();

    await this.#process();
    await this.save();

    await this.#saveReport();
  }

  async #loadReport() {
    getLogger().log("Loading build report").logLevelUp();

    let report;
    try {
      report = await loadJson(getConfig().reportFile);
    } catch (e) {
      if (e.code !== "ENOENT") {
        throw e;
      }
      getLogger().logLevelDown().log("Failed to load build report");
    }
    if (report) {
      getLogger().log("Report JSON loaded").logLevelUp();
      if (isInObject(report, "config") && isObject(report.config)) {
        this.#isNewConfig = !isDeepEqual(getConfig(), report.config);
        getLogger().log(
          `Report config loaded (${this.#isNewConfig ? "" : "not "}changed)`,
        );
      }
      if (isInObject(report, "src") && isObject(report.src)) {
        this.#report = new Directory().deserialize(report.src);
        getLogger().log("Report files loaded");
      }
      getLogger().logLevelDown().logLevelDown().log("Build report loaded");
    }
  }

  async #init() {
    getLogger().log("Initializing directories").logLevelUp();

    [this.#src, this.#dist] = await Promise.all([
      new Directory(getConfig().src).init(),
      await new Directory(getConfig().dist).init(),
    ]);

    getLogger().logLevelDown().log("Directories initialized");
  }

  async #load() {
    getLogger().log("Loading files").logLevelUp();

    await Promise.all(this.#src.load(getConfig().dist));

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
          preparing.push((file = processor.prepareFile(file)));
        }
        getLogger().logLevelDown();
      }
      getLogger().logLevelDown();
      await Promise.all(preparing);
    }

    this.#markForProcessing();

    getLogger().logLevelDown().log("Files prepared");
  }

  #markForProcessing() {
    getLogger().log("Marking files for processing").logLevelUp();

    for (let file of this.#src.files) {
      if (
        !this.#isNewConfig &&
        this.#report &&
        isInArray(this.#report.files, (element) => element.isEqual(file))
      ) {
        const distsToProcess = [];
        const oldDistFiles = [];
        for (let dist of file.dists) {
          const oldDistFile = findInArray(this.#dist.files, (element) =>
            element.src.isEqual(dist),
          );
          if (oldDistFile) {
            oldDistFiles.push(oldDistFile);
          } else {
            distsToProcess.push(dist);
          }
        }
        for (let oldDistFile of oldDistFiles) {
          getLogger().log(`File not modified: ${oldDistFile.src.rel}`);
          oldDistFile.isModified = false;
        }
        if (distsToProcess.length === 0) {
          getLogger().log(`File not modified: ${file.src.rel}`);
          file.isModified = false;
        }
        file.distsToProcess = distsToProcess;
      } else {
        file.distsToProcess = file.dists;
      }
    }

    getLogger().logLevelDown().log("Files marked for processing");
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
          getLogger()
            .log(`Processing dists of file ${file.src.rel}`)
            .logLevelUp();
          for (let dist of file.distsToProcess) {
            getLogger().log(`Testing file ${file.src.rel}`).logLevelUp();
            if (processor.test(file.src) || processor.test(dist)) {
              getLogger().log(`Dist: ${dist.rel}`);
              processing.push((dist = processor.process(dist)));
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

      await saveFile(getConfig().logFile, getLogger().logs.join("\r\n"));

      getLogger().logLevelDown().log("Log file saved");
    }
  }
}

export default Builder;
