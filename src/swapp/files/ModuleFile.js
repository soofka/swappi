import File from "./File.js";
import {
  isFunction,
  isObject,
  isInObject,
  loadModule,
} from "../helpers/index.js";
import { getConfig, getLogger } from "../utils/index.js";

export class ModuleFile extends File {
  #module;
  get module() {
    return this.#module;
  }

  constructor(absPath, relPath, hashable = false) {
    super(absPath, relPath, hashable);
  }

  async prepareForProcessing(distPath, reportDirectory, additionalDirectories) {
    getLogger().log(
      7,
      `Preparing module file ${this.src.rel} for processing [distPath=${distPath}. reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`,
    );
    await super.prepareForProcessing(
      distPath,
      reportDirectory,
      additionalDirectories,
    );

    const nameArray = this.src.name.split(".");
    if (nameArray.length > 0) {
      let name;
      let ext = "";

      if (nameArray.length === 1) {
        name = nameArray[0];
      } else {
        name = nameArray.slice(0, nameArray.length - 1).join(".");
        ext = `.${nameArray[nameArray.length - 1]}`;
      }

      // make it load from memory
      this.#module = await loadModule(this.src.abs);
      if (isFunction(this.#module)) {
        this.dist[0].name = name;
        this.dist[0].ext = ext;
      } else if (isObject(this.#module)) {
        const newDists = Object.keys(this.#module).map((key) => {
          const newDist = this.dist[0].clone();
          newDist.name = `${name}${key}`;
          newDist.ext = ext;
          return newDist;
        });
        this.dist = newDists;
      }
    }

    getLogger().log(
      7,
      `Module file ${this.src.rel} prepared for processing (dist length: ${this.dist.length})`,
    );
    return this;
  }

  async execute(dist, index) {
    if (isFunction(this.#module)) {
      return this.#module(getConfig().data);
    } else if (isObject(this.#module)) {
      for (let key of Object.keys(this.#module)) {
        if (
          dist.name.split(getConfig().constants.hashSeparator)[0].endsWith(key)
        ) {
          return this.#module[key](getConfig().data);
        }
      }
    }
  }
}

export default ModuleFile;
