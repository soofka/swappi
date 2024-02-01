import File from "./File.js";
import {
  findInArray,
  isFunction,
  isInArray,
  isInObject,
} from "../helpers/index.js";
import { getConfig, getLogger } from "../utils/index.js";

export class FileWithPartials extends File {
  #partials = {};
  get partials() {
    return this.#partials;
  }
  set partials(value) {
    this.#partials = value;
  }

  addPartial(name, partial) {
    if (isInObject(this.#partials, name)) {
      partial && this.partials[name].elements.push(partial);
    } else {
      this.partials[name] = { elements: partial ? [partial] : [] };
    }
  }

  async prepareForProcessing(distPath, reportDirectory, additionalDirectories) {
    getLogger().log(
      7,
      `Preparing file with partials ${this.src.rel} for processing [distPath=${distPath}, reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`,
    );
    await super.prepareForProcessing(
      distPath,
      reportDirectory,
      additionalDirectories,
    );

    if (isInObject(additionalDirectories, "partials")) {
      this.collectPartials();
      this.preparePartials(additionalDirectories.partials);
    }

    getLogger().log(
      7,
      `File with partials ${this.src.rel} prepared for processing (partials length: ${Object.keys(this.#partials).length})`,
    );
    return this;
  }

  preparePartials(partialsDirectory) {
    getLogger().log(
      7,
      `Preparing partials for file ${this.src.rel} [partialsDirectory=${partialsDirectory}]`,
    );

    const newPartials = {};
    for (let key of Object.keys(this.#partials)) {
      const partialFile = findInArray(
        partialsDirectory.allFiles,
        (fileElement) =>
          isInArray(
            fileElement.dist,
            (distElement) =>
              distElement.ext === this.src.ext && distElement.name === key,
          ),
      );

      if (partialFile) {
        newPartials[key] = this.#partials[key];
        newPartials[key].file = partialFile;
      }
    }
    this.#partials = newPartials;

    getLogger().log(
      7,
      `Preparing partials for file ${this.src.rel} finished (partials length: ${Object.keys(this.#partials).length})`,
    );
    return this;
  }

  async executePartials(rootDirectory) {
    const executing = [];
    for (let partial of Object.keys(this.partials)) {
      for (let element of this.partials[partial].elements) {
        executing.push(
          this.executePartial(
            this.#partials[partial].file.module,
            element,
            rootDirectory,
          ),
        );
      }
    }

    return await Promise.all(executing);
  }

  async executePartial(module, element, rootDirectory) {
    if (isFunction(module)) {
      return await module(element, getConfig().data, rootDirectory);
    } else if (isInObject(module, "render")) {
      return await module.render(element, getConfig().data, rootDirectory);
    }
  }

  shouldBeProcessed() {
    if (!this.modified) {
      for (let key of Object.keys(this.#partials)) {
        if (
          this.#partials[key].file &&
          !this.#partials[key].file.foundInReport
        ) {
          return true;
        }
      }
      return false;
    }
    return true;
  }
}

export default FileWithPartials;
