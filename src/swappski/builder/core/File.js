import path from "path";
import crypto from "crypto";
import Dirent from "./Dirent.js";
import DirentData from "./DirentData.js";
import {
  findInArray,
  isInArray,
  isInObject,
  loadFile,
  saveFile,
} from "../helpers/index.js";
import { getConfig, getLogger } from "../utils/index.js";

export class File extends Dirent {
  #dist = [];
  get dist() {
    return this.#dist;
  }
  set dist(value) {
    this.#dist = value;
  }
  #modified = true;
  get modified() {
    return this.#modified;
  }
  set modified(value) {
    this.#modified = value;
  }
  #foundInReport = false;
  get foundInReport() {
    return this.#foundInReport;
  }
  #foundInOldDist = false;
  get foundInOldDist() {
    return this.#foundInOldDist;
  }
  #content = "";
  get content() {
    return this.#content;
  }
  #encoding = "utf8";
  get encoding() {
    return this.#encoding;
  }
  set encoding(value) {
    this.#encoding = value;
  }
  #processors = [];

  constructor(srcAbsPath, relPath, hashable = true) {
    super(srcAbsPath, relPath, hashable);
    this.isDir = false;
  }

  addProcessors(processors) {
    for (let processor of processors) {
      if (processor.test(this)) {
        this.#processors.push(processor);
      }
    }
  }

  async load() {
    getLogger().log(7, `Loading file ${this.src.rel}`);

    this.#content = await loadFile(this.src.abs, this.#encoding);

    if (!this.src.hash || this.src.hash === "") {
      this.src.hash = crypto
        .createHash(
          getConfig().constants.hashAlgorithm,
          getConfig().constants.hashAlgorithmOptions,
        )
        .update(this.#content)
        .digest("hex");
    }

    getLogger().log(7, `File ${this.src.rel} loaded`);
    return this;
  }

  async prepare(
    isConfigModified,
    distPath,
    reportDirectory = undefined,
    additionalDirectories = undefined,
  ) {
    getLogger().log(
      7,
      `Preparing file ${this.src.rel} [isConfigModified=${isConfigModified}, distPath=${distPath}, reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`,
    );

    await this.prepareForProcessing(
      distPath,
      reportDirectory,
      additionalDirectories,
    );
    this.checkForModifications(
      isConfigModified,
      reportDirectory,
      isInObject(additionalDirectories, "oldDist") &&
        additionalDirectories.oldDist,
    );

    getLogger().log(
      7,
      `File ${this.src.rel} prepared (modified: ${this.#modified}, shouldBeProcessed: ${this.shouldBeProcessed()}, dist length: ${this.#dist.length})`,
    );
    return this;
  }

  async prepareForProcessing(distPath, reportDirectory, additionalDirectories) {
    getLogger().log(
      7,
      `Preparing file ${this.src.rel} for processing [distPath=${distPath}. reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`,
    );

    const distDirentData = this.src.clone();
    distDirentData.absDir =
      distDirentData.relDir === path.sep
        ? distPath
        : path.join(distPath, distDirentData.relDir);
    this.#dist.push(distDirentData);

    getLogger().log(
      7,
      `File ${this.src.rel} prepared for processing (dist length: ${this.#dist.length})`,
    );
    return this;
  }

  checkForModifications(isConfigModified, reportDirectory, oldDistDirectory) {
    getLogger().log(
      7,
      `Checking file ${this.src.rel} for modifications [isConfigModified=${isConfigModified}, reportDirectory=${reportDirectory}, oldDistDirectory=${oldDistDirectory}]`,
    );

    this.#foundInReport = this.isInReport(reportDirectory);

    const oldDistFiles = this.findInOldDist(oldDistDirectory);
    for (let distFile of oldDistFiles) {
      distFile.modified = false;
    }

    this.#foundInOldDist = oldDistFiles.length > 0;
    this.#modified =
      isConfigModified || !this.#foundInReport || !this.#foundInOldDist;

    getLogger().log(
      7,
      `File ${this.src.rel} checked for modifications (modified=${this.#modified})`,
    );
    return this;
  }

  isInReport(report) {
    if (
      report &&
      isInArray(report.allFiles, (element) => element.isEqual(this))
    ) {
      return true;
    }
    return false;
  }

  findInOldDist(oldDist) {
    let distFiles = [];
    if (oldDist) {
      for (let dist of this.dist) {
        const distFile = findInArray(oldDist.allFiles, (element) =>
          element.src.isEqual(dist),
        );
        if (distFile) {
          distFiles.push(distFile);
        } else {
          distFiles = [];
          break;
        }
      }
    }
    return distFiles;
  }

  shouldBeProcessed() {
    return this.#modified;
  }

  async process(rootDirectory) {
    getLogger().log(7, `Processing file ${this.src.rel}`);

    const executing = [];
    for (let distIndex in this.dist) {
      const dist = this.dist[distIndex];
      executing.push(this.execute(dist, distIndex, rootDirectory));
    }
    const content = await Promise.all(executing);
    const saving = [];
    for (let distIndex in this.dist) {
      const dist = this.dist[distIndex];
      saving.push(this.save(dist, distIndex, content[distIndex]));
    }
    await Promise.all(saving);

    getLogger().log(7, `File ${this.src.rel} processed`);
    return this;
  }

  async execute(dist, index) {
    return this.content;
  }

  async save(dist, distIndex, content) {
    await saveFile(dist.abs, content);
  }

  isEqual(file, withDist = true) {
    if (super.isEqual(file)) {
      if (withDist) {
        for (let dist of file.dist) {
          if (!isInArray(this.#dist, (element) => element.isEqual(dist))) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  }

  serialize(src = true, dist = true, content = false) {
    const obj = super.serialize(src);

    if (dist) {
      obj.dist = this.#dist.map((dist) => dist.serialize());
    }

    if (content) {
      obj.content = this.#content;
    }

    return obj;
  }

  deserialize({ src = {}, dist = [], content }) {
    super.deserialize({ src });

    this.#dist = [];
    for (let item of dist) {
      this.#dist.push(new DirentData().deserialize(item));
    }

    this.#content = content;
    return this;
  }
}

export default File;
