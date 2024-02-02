import path from "path";
import Dirent from "./Dirent.js";
import { deleteFile, isInObject, loadDir } from "../helpers/index.js";
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

  constructor(getFile, absPath, relPath, hashable = false) {
    super(absPath, relPath, hashable);
    this.#getFile = getFile;
    this.isDir = true;
  }

  async load(withFiles = true) {
    getLogger().log(6, `Loading directory ${this.src.rel}`);

    let fileCount = 0;
    const loading = [];
    for (let nodeDirent of await loadDir(this.src.abs)) {
      const srcPath = path.join(this.src.abs, nodeDirent.name);
      const relPath = this.src.relDir === "" ? path.sep : this.src.rel;

      let dirent;
      if (nodeDirent.isFile()) {
        dirent = this.#getFile(nodeDirent);
        dirent.src.init(srcPath, relPath);
        this.#direntList.push(dirent);

        if (withFiles) {
          loading.push(dirent.load());
          fileCount++;
        }
      } else if (nodeDirent.isDirectory()) {
        dirent = new Directory(this.#getFile, srcPath, relPath);
        this.#direntList.push(dirent);
        loading.push(dirent.load());
      }
    }

    await Promise.all(loading);
    this.#stats.loaded += fileCount;

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

    let fileCount = 0;
    const preparing = [];
    for (let dirent of this.#direntList) {
      preparing.push(
        dirent.prepare(
          isConfigModified,
          distPath,
          reportDirectory,
          additionalDirectories,
        ),
      );

      if (!dirent.isDir) {
        fileCount++;
      }
    }

    await Promise.all(preparing);
    this.#stats.prepared += fileCount;

    getLogger().log(
      6,
      `Directory ${this.src.rel} prepared (${this.#stats.prepared} files)`,
    );
    return this;
  }

  async reset() {
    getLogger().log(6, `Reseting directory ${this.src.rel}`);

    let fileCount = 0;
    const reseting = [];
    const newDirentList = [];
    for (let dirent of this.#direntList) {
      if (dirent.isDir) {
        reseting.push(dirent.reset());
      } else if (!dirent.modified) {
        newDirentList.push(dirent);
      } else {
        reseting.push(deleteFile(dirent.src.abs));
        fileCount++;
      }
    }

    const resetingResults = await Promise.all(reseting);
    this.#direntList = [...newDirentList, ...resetingResults];

    getLogger().log(
      6,
      `Directory ${this.src.rel} reset (${fileCount} files deleted)`,
    );
    return this;
  }

  async process(rootDirectory) {
    getLogger().log(6, `Processing directory ${this.src.rel}`);

    let fileCount = 0;
    const processing = [];
    for (let dirent of this.#direntList) {
      if (dirent.isDir) {
        processing.push(dirent.process(rootDirectory || this));
      } else if (dirent.shouldBeProcessed()) {
        processing.push(dirent.process(rootDirectory || this));
        fileCount++;
      }
    }

    await Promise.all(processing);
    this.#stats.processed += fileCount;

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

    if (this.#direntList.length > 0) {
      root.direntList = [];
      for (let dirent of this.#direntList) {
        root.direntList.push(dirent.serialize(src, dist, content));
      }
    }

    return root;
  }

  deserialize({ src = {}, direntList = [] }) {
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
    const allStats = {
      loaded: this.#stats.loaded,
      prepared: this.#stats.prepared,
      processed: this.#stats.processed,
    };
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
