import path from "path";
import crypto from "crypto";
import Dirent from "./Dirent.js";
import DirentData from "./DirentData.js";
import {
  deleteFile,
  isInArray,
  loadFile,
  saveFile,
} from "../../helpers/index.js";
import { getConfig } from "../../utils/index.js";

export class File extends Dirent {
  #dists = [];
  get dists() {
    return this.#dists;
  }
  set dists(value) {
    this.#dists = value;
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

  async load(distAbsPath) {
    this.src.content = await loadFile(this.src.abs, this.src.contentEncoding);
    if (!this.src.contentHash || this.src.contentHash === "") {
      this.src.contentHash = crypto
        .createHash(
          getConfig().hashOptions.algorithm,
          getConfig().hashOptions.algorithmOptions,
        )
        .update(this.src.content)
        .digest("hex");
    }
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
    for (let dist of this.#dists) {
      saving.push(saveFile(dist.abs, dist.content));
    }
    return saving;
  }

  delete() {
    return deleteFile(this.src.abs);
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
