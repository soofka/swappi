import { performance } from "perf_hooks";
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
    this.#processors =
      (isInObject(processors, getConfig().mode) &&
        processors[getConfig().mode]) ||
      getConfig().processors[getConfig().mode];
  }

  async init() {
    getLogger().log("Initializing builder").logLevelUp();

    await this.#loadReport();

    getLogger().logLevelDown().log("Builder initialized");
    return this;
  }

  async build() {
    const startTime = performance.now();
    getLogger().log("Build started").logLevelUp();

    await this.#initDirs();
    await this.#load();

    await this.#prepareBase();
    await this.#prepare();
    await this.#delete();

    await this.#process();
    await this.#save();
    await this.#saveReport();

    const endTime = performance.now();
    getLogger()
      .logLevelDown()
      .log(`Build finished in ${Math.round(endTime - startTime)}ms`);

    return this;
  }

  async close() {
    getLogger().log("Terminating builder").logLevelUp();

    await this.#saveReportToFile();

    getLogger().logLevelDown().log("Builder terminated");
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

  async #initDirs() {
    getLogger().log("Initializing directories").logLevelUp();

    [this.#src, this.#dist] = await Promise.all([
      new Directory(getConfig().src).init(),
      await new Directory(getConfig().dist).init(),
    ]);

    getLogger()
      .log(`src initialized (${this.#src.dirents.length} immediate dirents)`)
      .log(`dist initialized (${this.#dist.dirents.length} immediate dirents)`)
      .logLevelDown()
      .log("Directories initialized");
  }

  async #load() {
    getLogger().log("Loading dirents").logLevelUp();

    const loading = this.#src.load();
    await Promise.all(loading);

    getLogger().logLevelDown().log(`${loading.length} dirents loaded`);
  }

  async #prepareBase() {
    getLogger().log("Preparing files base").logLevelUp();
    this.#src.prepare(getConfig().dist);
    getLogger().logLevelDown().log("Files base prepared");
  }

  async #prepare() {
    getLogger().log("Preparing files").logLevelUp();

    let preparingCount = 0;
    for (let processor of this.#processors) {
      const preparing = [];
      for (let file of this.#src.files) {
        getLogger()
          .log(`${processor.constructor.name} testing file ${file.src.rel}`)
          .logLevelUp();
        if (processor.test(file.src)) {
          getLogger().log(
            `${processor.constructor.name} preparing file ${file.src.rel}`,
          );
          preparing.push((file = processor.prepareFile(file)));
        }
        getLogger().logLevelDown();
      }
      preparingCount += preparing.length;
      await Promise.all(preparing);
    }

    this.#markForProcessing();

    getLogger().logLevelDown().log(`${preparingCount} files prepared`);
  }

  #markForProcessing() {
    getLogger().log("Marking files for processing").logLevelUp();

    for (let file of this.#src.files) {
      if (
        file.isStatic &&
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
          oldDistFile.isModified = false;
        }
        if (distsToProcess.length === 0) {
          file.isModified = false;
        }
        file.distsToProcess = distsToProcess;
      } else {
        file.distsToProcess = file.dists;
      }

      getLogger().log(
        `File ${file.src.rel} is ${file.isStatic ? "" : "not "}static, is ${file.isModified ? "" : "not "}modified, and has ${file.distsToProcess.length}/${file.dists.length} dists to process`,
      );
    }

    getLogger().logLevelDown().log("Files marked for processing");
  }

  async #delete() {
    getLogger().log("Deleting dirents").logLevelUp();

    const deleting = this.#dist.delete();
    await Promise.all(deleting);

    getLogger().logLevelDown().log(`${deleting.length} dirents deleted`);
  }

  async #process() {
    getLogger().log("Processing dists").logLevelUp();

    let processingCount = 0;
    for (let processor of this.#processors) {
      const processing = [];
      for (let file of this.#src.files) {
        if (getConfig().force || file.isModified) {
          for (let dist of file.distsToProcess) {
            getLogger()
              .log(`${processor.constructor.name} testing dist ${dist.rel}`)
              .logLevelUp();
            if (processor.test(file.src) || processor.test(dist)) {
              getLogger().log(
                `${processor.constructor.name} processing dist ${dist.rel}`,
              );
              processing.push(
                (dist = processor.process(dist, this.#src.dists)),
              );
            }
            getLogger().logLevelDown();
          }
        }
      }
      processingCount += processing.length;
      await Promise.all(processing);
    }

    getLogger().logLevelDown().log(`Dists processed ${processingCount} times`);
  }

  async #save() {
    getLogger().log("Saving files").logLevelUp();

    const saving = this.#src.save();
    await Promise.all(saving);

    getLogger().logLevelDown().log(`${saving.length} files saved`);
  }

  async #saveReport() {
    this.#report = this.#src.clone();
  }

  async #saveReportToFile() {
    getLogger().log("Saving report to file").logLevelUp();

    if (this.#src) {
      await saveFile(
        getConfig().reportFile,
        JSON.stringify({
          config: getConfig(),
          src: this.#src.serialize(),
        }),
      );

      getLogger()
        .logLevelDown()
        .log(`Report saved to file ${getConfig().reportFile}`);

      if (getConfig().logFile) {
        getLogger().log("Saving log file").logLevelUp();

        await saveFile(getConfig().logFile, getLogger().logs.join("\r\n"));

        getLogger()
          .logLevelDown()
          .log(`Log file saved to ${getConfig().logFile}`);
      }
    } else {
      getLogger().logLevelDown().log("Failed to save report to file");
    }
  }
}

export default Builder;
