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
  #modified;
  get modified() {
    return this.#modified;
  }
  set modified(value) {
    this.#modified = value;
  }
  #content = "";
  get content() {
    return this.#content;
  }
  #contentHash = "";
  get contentHash() {
    return this.#contentHash;
  }

  constructor(srcAbsPath, relPath) {
    super(srcAbsPath, relPath);
    this.isDir = false;
  }

  async load() {
    getLogger().log(7, `Loading file ${this.src.rel}`);

    this.#content = await loadFile(this.src.abs);
    this.#contentHash = crypto
      .createHash(
        getConfig().constants.hashAlgorithm,
        getConfig().constants.hashAlgorithmOptions,
      )
      .update(this.#content)
      .digest("hex");

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

    const distDirentData = this.src.clone();
    if (distPath) {
      distDirentData.absDir = path.join(distPath, distDirentData.relDir);
    }
    this.#dist.push(distDirentData);
    this.checkForModifications(
      isConfigModified,
      reportDirectory,
      isInObject(additionalDirectories, "oldDist") &&
        additionalDirectories.oldDist,
    );

    getLogger().log(
      7,
      `File ${this.src.rel} prepared (modified: ${this.#modified}, dist length: ${this.#dist.length})`,
    );
    return this;
  }

  async process(rootDirectory) {
    getLogger().log(7, `Processing file ${this.src.rel}`);

    for (let distIndex in this.dist) {
      const dist = this.dist[distIndex];
      const content = await this.execute(dist, distIndex, rootDirectory);
      await this.save(dist, distIndex, content);
    }

    getLogger().log(7, `File ${this.src.rel} processed`);
    return this;
  }

  async execute(dist, index) {
    return this.content;
  }

  async save(dist, distIndex, content) {
    await saveFile(dist.abs, content);
  }

  checkForModifications(isConfigModified, reportDirectory, oldDistDirectory) {
    if (isConfigModified) {
      this.#modified = true;
      return;
    }
    if (
      reportDirectory &&
      !isInArray(reportDirectory.allFiles, (element) => element.isEqual(this))
    ) {
      this.#modified = true;
      return;
    }
    if (oldDistDirectory) {
      let distFiles = [];
      for (let dist of this.dist) {
        const distFile = findInArray(oldDistDirectory.allFiles, (element) =>
          element.src.isEqual(dist),
        );
        if (distFile) {
          distFiles.push(distFile);
        } else {
          distFiles = [];
          break;
        }
      }
      if (distFiles.length > 0) {
        for (let distFile of distFiles) {
          distFile.#modified = false;
        }
      } else {
        this.#modified = true;
        return;
      }
    }
    this.#modified = false;
  }

  shouldBeProcessed() {
    return this.#modified;
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
      return this.#contentHash === file.contentHash;
    }
    return false;
  }

  serialize(src = true, dist = true, content = false) {
    const obj = { ...super.serialize(src), contentHash: this.#contentHash };

    if (dist) {
      obj.dist = this.#dist.map((dist) => dist.serialize());
    }

    if (content) {
      obj.content = this.#content;
    }

    return obj;
  }

  deserialize({ src, dist, content, contentHash }) {
    super.deserialize({ src });

    this.#dist = [];
    for (let item of dist) {
      this.#dist.push(new DirentData().deserialize(item));
    }

    this.#content = content;
    this.#contentHash = contentHash;
    return this;
  }
}

export default File;
