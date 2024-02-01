import path from "path";
import Dirent from "./Dirent.js";
import {
  createDir,
  deleteFile,
  isInObject,
  loadDir,
} from "../helpers/index.js";
import { getLogger } from "../utils/index.js";

export class Directory extends Dirent {
  #getFile;
  #direntList = [];
  get direntList() {
    return this.#direntList;
  }
  #stats = {
    loaded: 0,
    prepared: 0,
    processed: 0,
  };
  get stats() {
    return this.#stats;
  }

  constructor(getFile, absPath, relPath) {
    super(absPath, relPath);
    this.#getFile = getFile;
    this.isDir = true;
  }

  async load() {
    getLogger().log(6, `Loading directory ${this.src.rel}`);

    const dir = await loadDir(this.src.abs);
    if (dir) {
      for (let nodeDirent of dir) {
        const srcPath = path.join(this.src.abs, nodeDirent.name);
        const relPath = this.src.relDir === "" ? path.sep : this.src.rel;

        let dirent;
        if (nodeDirent.isFile()) {
          dirent = this.#getFile(nodeDirent);
          dirent.src.init(srcPath, relPath);
        } else if (nodeDirent.isDirectory()) {
          dirent = new Directory(this.#getFile, srcPath, relPath);
        }

        if (dirent) {
          await dirent.load();
          this.#direntList.push(dirent);

          if (!dirent.isDir) {
            this.#stats.loaded++;
          }
        }
      }
    } else {
      getLogger().warn(
        6,
        `Directory ${this.src.abs} does not exist in file system`,
      );

      const newDir = await createDir(this.src.abs);
      if (newDir) {
        getLogger().log(6, `Directory ${this.src.abs} created`);
      }
    }

    getLogger().log(
      6,
      `Directory ${this.src.rel} loaded (${this.#stats.loaded} files)`,
    );
    return this;
  }

  async prepare(
    isConfigModified,
    distPath,
    reportDirectory = undefined,
    additionalDirectories = undefined,
  ) {
    getLogger().log(
      6,
      `Preparing directory ${this.src.rel} [isConfigModified=${isConfigModified}, distPath=${distPath}, reportDirectory=${reportDirectory} additionalDirectories=${additionalDirectories}]`,
    );

    for (let dirent of this.#direntList) {
      await dirent.prepare(
        isConfigModified,
        distPath,
        reportDirectory,
        additionalDirectories,
      );

      if (!dirent.isDir) {
        this.#stats.prepared++;
      }
    }

    getLogger().log(
      6,
      `Directory ${this.src.rel} prepared (${this.#stats.prepared} files)`,
    );
    return this;
  }

  async reset() {
    getLogger().log(6, `Reseting directory ${this.src.rel}`);

    const newDirentList = [];
    for (let dirent of this.#direntList) {
      if (dirent.isDir) {
        newDirentList.push(await dirent.reset());
      } else if (!dirent.modified) {
        newDirentList.push(dirent);
      } else {
        console.log("gonna delete file", dirent.src.abs);
        await deleteFile(dirent.src.abs);
      }
    }
    this.#direntList = newDirentList;

    getLogger().log(6, `Directory ${this.src.rel} reset`);
    return this;
  }

  async process(rootDirectory) {
    getLogger().log(6, `Processing directory ${this.src.rel}`);

    for (let dirent of this.#direntList) {
      if (dirent.isDir) {
        await dirent.process(rootDirectory || this);
      } else if (dirent.shouldBeProcessed()) {
        await dirent.process(rootDirectory || this);
        this.#stats.processed++;
      }
    }

    getLogger().log(
      6,
      `Directory ${this.src.rel} processed (${this.#stats.processed} files)`,
    );
    return this;
  }

  isEqual(directory) {
    if (super.isEqual(directory)) {
      return this.#direntList.length === directory.direntList.length;
    }
    return false;
  }

  serialize(src = true, dist = true, content = false) {
    const root = super.serialize(src);

    root.direntList = [];
    for (let dirent of this.#direntList) {
      root.direntList.push(dirent.serialize(src, dist, content));
    }

    return root;
  }

  deserialize({ src, direntList }) {
    super.deserialize({ src });

    for (let index in direntList) {
      const dirent = direntList[index];
      if (isInObject(dirent, "direntList")) {
        this.#direntList.push(new Directory(this.#getFile).deserialize(dirent));
      } else {
        this.#direntList.push(this.#getFile(dirent).deserialize(dirent));
      }
    }

    return this;
  }

  get allFiles() {
    let allFiles = [];
    for (let dirent of this.#direntList) {
      if (dirent.isDir) {
        allFiles.push(...dirent.allFiles);
      } else {
        allFiles.push(dirent);
      }
    }
    return allFiles;
  }

  get allStats() {
    const allStats = this.#stats;
    for (let dirent of this.#direntList) {
      if (dirent.isDir) {
        const direntStats = dirent.allStats;
        allStats.loaded += direntStats.loaded;
        allStats.prepared += direntStats.prepared;
        allStats.processed += direntStats.processed;
      }
    }
    return allStats;
  }
}

export default Directory;
