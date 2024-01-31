import ModuleFile from "./ModuleFile.js";
import { isFunction, isObject } from "../helpers/index.js";
import { getLogger } from "../utils/index.js";

export class PartialFile extends ModuleFile {
  #executable = false;

  async prepare(
    isConfigModified,
    distPath,
    reportDirectory = undefined,
    additionalDirectories = undefined,
  ) {
    getLogger().log(
      7,
      `Preparing partial file ${this.src.rel} [isConfigModified=${isConfigModified}, distPath=${distPath}, reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`,
    );
    super.prepare(
      isConfigModified,
      distPath,
      reportDirectory,
      additionalDirectories,
    );

    if (
      this.module &&
      isObject(this.module) &&
      this.module.hasOwnProperty("render") &&
      isFunction(this.module.render)
    ) {
      this.#executable = true;
    }

    getLogger().log(
      7,
      `Partial file ${this.src.rel} prepared (executable: ${this.executable})`,
    );
    return this;
  }

  shouldBeProcessed() {
    return this.modified && this.#executable;
  }
}

export default PartialFile;
