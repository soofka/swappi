import path from "path";
import Dirent from "./Dirent.js";
import DirentData from "./DirentData.js";
import {
  deleteFile,
  isImage,
  isInArray,
  isPdf,
  loadFile,
  saveFile,
} from "../../helpers/index.js";

export class File extends Dirent {
  #dists = [];
  get dists() {
    return this.#dists;
  }
  set dists(value) {
    this.#dists = value;
  }
  #distsToProcess = [];
  get distsToProcess() {
    return this.#distsToProcess;
  }
  set distsToProcess(value) {
    this.#distsToProcess = value;
  }
  #isStatic = true;
  get isStatic() {
    return this.#isStatic;
  }
  set isStatic(value) {
    this.#isStatic = value;
  }
  #isModified = true;
  get isModified() {
    return this.#isModified;
  }
  set isModified(value) {
    this.#isModified = value;
  }

  constructor(srcAbsPath, relDir) {
    super(srcAbsPath, relDir);
    this.isDir = false;
  }

  async load() {
    this.src.contentEncoding =
      isImage(this.src) || isPdf(this.src) ? null : "utf8";
    this.src.content = await loadFile(this.src.abs, this.src.contentEncoding);
    if (!this.src.contentHash || this.src.contentHash === "") {
      this.src.resetContentHash();
    }
    return this;
  }

  prepare(distAbsPath) {
    if (this.#dists.length === 0) {
      const dist = this.src.clone();
      dist.absDir =
        dist.relDir === path.sep
          ? distAbsPath
          : path.join(distAbsPath, dist.relDir);
      this.#dists = [dist];
    }
    return this;
  }

  save() {
    const saving = [];
    for (let dist of this.#distsToProcess) {
      saving.push(saveFile(dist.abs, dist.content, this.contentEncoding));
    }
    return saving;
  }

  delete() {
    return deleteFile(this.src.abs);
  }

  clone() {
    const clone = new File();
    clone.src = super.clone().src;
    for (let dist of this.#dists) {
      clone.dists.push(dist.clone());
    }
    clone.isModified = this.#isModified;
    return clone;
  }

  isEqual(file, withDist = true) {
    if (super.isEqual(file)) {
      if (withDist) {
        for (let dist of file.dists) {
          if (!isInArray(this.#dists, (element) => element.isEqual(dist))) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  }

  serialize(src = true, dists = true) {
    const obj = super.serialize(src);

    if (dists) {
      obj.dists = this.#dists.map((dist) => dist.serialize());
    }

    return obj;
  }

  deserialize({ src = {}, dists = [] }) {
    super.deserialize({ src });

    this.#dists = [];
    for (let dist of dists) {
      this.#dists.push(new DirentData().deserialize(dist));
    }

    return this;
  }
}

export default File;
