import DirentData from "./DirentData.js";

export class Dirent {
  #src;
  get src() {
    return this.#src;
  }
  #isDir;
  get isDir() {
    return this.#isDir;
  }
  set isDir(value) {
    this.#isDir = value;
  }

  constructor(absPath, relPath, hashable) {
    this.#src = new DirentData(absPath, relPath, hashable);
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
