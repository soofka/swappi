import path from "path";
import { getDirentObject } from "../helpers/index.js";

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
  #ext;
  get ext() {
    return this.#ext;
  }
  set ext(value) {
    this.#ext = value;
  }

  constructor(absPath, relPath = "") {
    this.init(absPath, relPath);
  }

  init(absPath, relPath = "") {
    if (absPath) {
      const obj = getDirentObject(absPath);
      this.#absDir = obj.dir;
      this.#name = obj.name;
      this.#ext = obj.ext;
    }
    this.#relDir = relPath;
    return this;
  }

  clone() {
    const clone = new DirentData();
    clone.absDir = this.#absDir;
    clone.relDir = this.#relDir;
    clone.name = this.#name;
    clone.ext = this.#ext;
    return clone;
  }

  isEqual(direntData) {
    return (
      this.#absDir === direntData.absDir &&
      this.#relDir === direntData.relDir &&
      this.#name === direntData.name &&
      this.#ext === direntData.ext
    );
  }

  serialize() {
    return {
      absDir: this.#absDir,
      relDir: this.#relDir,
      name: this.#name,
      ext: this.#ext,
    };
  }

  deserialize({ absDir, relDir, name, ext }) {
    this.#absDir = absDir;
    this.#relDir = relDir;
    this.#name = name;
    this.#ext = ext;
    return this;
  }

  get full() {
    return `${this.#name}${this.#ext}`;
  }
  get abs() {
    return path.join(this.#absDir, this.full);
  }
  get rel() {
    return path.join(this.#relDir, this.full);
  }
}

export default DirentData;
