import ModuleFile from "./ModuleFile.js";
import { isFunction, isInObject } from "../helpers/index.js";
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
    await super.prepare(
      isConfigModified,
      distPath,
      reportDirectory,
      additionalDirectories,
    );

    if (
      this.module &&
      isInObject(this.module, "render") &&
      isFunction(this.module.render)
    ) {
      this.#executable = true;
    } else {
      this.checkForModifications(isConfigModified, reportDirectory);
    }

    getLogger().log(
      7,
      `Partial file ${this.src.rel} prepared (modified: ${this.modified}, executable: ${this.#executable})`,
    );
    return this;
  }

  shouldBeProcessed() {
    return this.modified && this.#executable;
  }
}

export default PartialFile;
