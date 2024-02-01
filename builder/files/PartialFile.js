import ModuleFile from "./ModuleFile.js";
import { isFunction, isInObject } from "../helpers/index.js";
import { getLogger } from "../utils/index.js";

export class PartialFile extends ModuleFile {
  #executable = false;

  async prepareForProcessing(distPath, reportDirectory, additionalDirectories) {
    getLogger().log(
      7,
      `Preparing partial file ${this.src.rel} for processing [distPath=${distPath}. reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`,
    );
    await super.prepareForProcessing(
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
    }

    getLogger().log(
      7,
      `Partial file ${this.src.rel} prepared for processing (executable: ${this.#executable}, shouldBeProcessed: ${this.shouldBeProcessed()})`,
    );
    return this;
  }

  shouldBeProcessed() {
    return this.modified && this.#executable;
  }
}

export default PartialFile;
