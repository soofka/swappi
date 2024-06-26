import path from "path";
import File from "./File.js";
import Dirent from "./Dirent.js";
import { deleteDir, isInObject, loadDir } from "../../helpers/index.js";

export class Directory extends Dirent {
  #dirents = [];
  get dirents() {
    return this.#dirents;
  }
  set dirents(value) {
    this.#dirents = value;
  }

  constructor(absPath, relDir) {
    super(absPath, relDir);
    this.isDir = true;
  }

  async init() {
    const relDir = this.src.relDir === "" ? path.sep : this.src.rel;
    for (let nodeDirent of await loadDir(this.src.abs)) {
      const srcPath = path.join(this.src.abs, nodeDirent.name);

      if (nodeDirent.isFile()) {
        this.#dirents.push(new File(srcPath, relDir));
      } else if (nodeDirent.isDirectory()) {
        this.#dirents.push(await new Directory(srcPath, relDir).init());
      }
    }
    return this;
  }

  load() {
    const loading = [];
    for (let dirent of this.#dirents) {
      if (dirent.isDir) {
        loading.push(...dirent.load());
      } else {
        loading.push(dirent.load());
      }
    }
    return loading;
  }

  prepare(distAbsPath) {
    for (let dirent of this.#dirents) {
      dirent.prepare(distAbsPath);
    }
  }

  save() {
    const saving = [];
    for (let dirent of this.#dirents) {
      saving.push(...dirent.save());
    }
    return saving;
  }

  delete() {
    const deleting = [];
    let deleteThis = this.#dirents.length === 0;
    for (let dirent of this.#dirents) {
      if (dirent.isDir) {
        deleting.push(...dirent.delete());
      } else if (dirent.isModified) {
        deleting.push(dirent.delete());
      } else {
        deleteThis = false;
      }
    }
    if (deleteThis) {
      deleting.push(deleteDir(this.src.abs));
    }
    return deleting;
  }

  clone() {
    const clone = new Directory();
    clone.src = super.clone().src;
    for (let dirent of this.#dirents) {
      clone.dirents.push(dirent.clone());
    }
    return clone;
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

  serialize(src = true, dists = true) {
    const obj = super.serialize(src);

    if (this.#dirents.length > 0) {
      obj.dirents = [];
      for (let dirent of this.#dirents) {
        obj.dirents.push(dirent.serialize(src, dists));
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

  get dists() {
    let dists = [];
    for (let dirent of this.#dirents) {
      dists.push(...dirent.dists);
    }
    return dists;
  }
}

export default Directory;
