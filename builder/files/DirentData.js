import path from "path";
import { getDirentObject } from "../helpers/index.js";
import { getConfig } from "../utils/index.js";

export class DirentData {
  #absDir;
  get absDir() {
    return this.#absDir;
  }
  set absDir(value) {
    this.#absDir = value;
  }
  #relDir;
  get relDir() {
    return this.#relDir;
  }
  set relDir(value) {
    this.#relDir = value;
  }
  #name;
  get name() {
    return this.#name;
  }
  set name(value) {
    this.#name = value;
  }
  #hash;
  get hash() {
    return this.#hash;
  }
  set hash(value) {
    this.#hash = value;
  }
  #hashable;
  #ext;
  get ext() {
    return this.#ext;
  }
  set ext(value) {
    this.#ext = value;
  }

  constructor(absPath, relPath = "", hashable = true) {
    this.init(absPath, relPath, hashable);
  }

  init(absPath, relPath, hashable) {
    if (absPath) {
      const obj = getDirentObject(absPath);
      this.#absDir = obj.dir;
      this.#name = obj.name;
      this.#hash = obj.hash;
      this.#ext = obj.ext;
    }
    if (relPath !== undefined) {
      this.#relDir = relPath;
    }
    if (hashable !== undefined) {
      this.#hashable = hashable;
    }
    return this;
  }

  clone() {
    const clone = new DirentData();
    clone.absDir = this.#absDir;
    clone.relDir = this.#relDir;
    clone.name = this.#name;
    clone.hash = this.#hash;
    clone.ext = this.#ext;
    return clone;
  }

  isEqual(direntData) {
    return (
      this.#absDir === direntData.absDir &&
      this.#relDir === direntData.relDir &&
      this.#name === direntData.name &&
      (this.#hash !== "" && direntData.hash !== ""
        ? this.#hash === direntData.hash
        : true) &&
      this.#ext === direntData.ext
    );
  }

  serialize() {
    const obj = {};
    if (this.#absDir && this.#absDir !== "") {
      obj.absDir = this.#absDir;
    }
    if (this.#relDir && this.#relDir !== "") {
      obj.relDir = this.#relDir;
    }
    if (this.#name && this.#name !== "") {
      obj.name = this.#name;
    }
    if (this.#hash && this.#hash !== "") {
      obj.hash = this.#hash;
    }
    if (this.#ext && this.#ext !== "") {
      obj.ext = this.#ext;
    }
    return obj;
  }

  deserialize({ absDir = "", relDir = "", name = "", hash = "", ext = "" }) {
    this.#absDir = absDir;
    this.#relDir = relDir;
    this.#name = name;
    this.#hash = hash;
    this.#ext = ext;
    return this;
  }

  get full() {
    return `${this.#name}${this.#hashable ? (this.#hash === "" ? "" : `${getConfig().constants.hashSeparator}${this.#hash}`) : ""}${this.#ext}`;
  }
  get abs() {
    return path.join(this.#absDir, this.full);
  }
  get rel() {
    return path.join(this.#relDir, this.full);
  }
}

export default DirentData;
