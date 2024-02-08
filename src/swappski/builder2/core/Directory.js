import path from "path";
import Dirent from "./Dirent.js";
import { isInObject, loadDir } from "../helpers/index.js";

export class Directory extends Dirent {
  #dirents = [];

  constructor(absPath, relDir) {
    super(absPath, relDir);
    this.isDir = true;
  }

  async init() {
    for (let nodeDirent of await loadDir(this.src.abs)) {
      const srcPath = path.join(this.src.abs, nodeDirent.name);
      const relDir = this.src.relDir === "" ? path.sep : this.src.rel;

      if (nodeDirent.isFile()) {
        this.#dirents.push(new File(srcPath, relDir));
      } else if (nodeDirent.isDirectory()) {
        this.#dirents.push(new Directory(srcPath, relDir));
      }
    }
    return this;
  }

  load() {
    const loading = [];
    for (let dirent of this.#dirents) {
      loading.push(dirent.load());
    }
    return loading;
  }

  isEqual(directory, deep = false) {
    if (super.isEqual(directory)) {
      if (deep) {
        for (let index in this.#dirents) {
          if (!this.#dirents[index].isEqual(directory[index])) {
            return false;
          }
        }
        return true;
      } else {
        return this.#dirents.length === directory.dirents.length;
      }
    }
    return false;
  }

  serialize(src = true, dist = true) {
    const obj = super.serialize(src);

    if (this.#dirents.length > 0) {
      obj.dirents = [];
      for (let dirent of this.#dirents) {
        obj.dirents.push(dirent.serialize(src, dist));
      }
    }

    return obj;
  }

  deserialize({ src = {}, dirents = [] }) {
    super.deserialize({ src });

    for (let dirent of dirents) {
      let obj = {};
      if (isInObject(dirent, "dirents")) {
        obj = new Directory();
      } else {
        obj = new File();
      }
      this.dirents.push(obj.deserialize(dirent));
    }

    return this;
  }

  get files() {
    let files = [];
    for (let dirent of this.#dirents) {
      if (dirent.isDir) {
        files.push(...dirent.files);
      } else {
        files.push(dirent);
      }
    }
    return files;
  }
}

export default Directory;
