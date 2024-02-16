import DirentData from "./DirentData.js";

export class Dirent {
  #src;
  get src() {
    return this.#src;
  }
  set src(value) {
    this.#src = value;
  }
  #isDir;
  get isDir() {
    return this.#isDir;
  }
  set isDir(value) {
    this.#isDir = value;
  }

  constructor(absPath, relDir) {
    this.#src = new DirentData(absPath, relDir);
  }

  clone() {
    const clone = new Dirent();
    clone.src = this.#src.clone();
    return clone;
  }

  isEqual(dirent) {
    return this.#src.isEqual(dirent.src);
  }

  serialize(src = true) {
    const obj = {};

    if (src) {
      obj.src = this.#src.serialize();
    }

    return obj;
  }

  deserialize({ src = {} }) {
    this.#src = new DirentData().deserialize(src);
    return this;
  }
}

export default Dirent;
