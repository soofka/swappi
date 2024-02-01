import File from "./File.js";
import {
  findInArray,
  isFunction,
  isInArray,
  isInObject,
  tryCatch,
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
      this.partials[name].elements.push(partial);
    } else {
      this.partials[name] = { elements: [partial] };
    }
  }

  preparePartials(partialsDirectory) {
    getLogger().log(
      7,
      `Preparing partials for file ${this.src.rel} [partialsDirectory=${partialsDirectory}]`,
    );

    for (let key of Object.keys(this.#partials)) {
      this.#partials[key].file = findInArray(
        partialsDirectory.allFiles,
        (fileElement) =>
          isInArray(
            fileElement.dist,
            (distElement) =>
              distElement.ext === this.src.ext && distElement.name === key,
          ),
      );
    }

    getLogger().log(
      7,
      `Preparing partials for file ${this.src.rel} finished (partials length: ${Object.keys(this.#partials).length})`,
    );
    return this;
  }

  checkForModifications(isConfigModified, reportDirectory, oldDistDirectory) {
    getLogger().log(
      7,
      `Checking file with partials ${this.src.rel} for modifications [isConfigModified=${isConfigModified}. reportDirectory=${reportDirectory}, oldDistDirectory=${oldDistDirectory}]`,
    );
    super.checkForModifications(
      isConfigModified,
      reportDirectory,
      oldDistDirectory,
    );

    if (!this.modified) {
      this.modified = (() => {
        for (let key of Object.keys(this.#partials)) {
          if (this.#partials[key].file && this.#partials[key].file.modified) {
            return true;
          }
        }
        return false;
      })();
    }

    getLogger().log(
      7,
      `File with partials ${this.src.rel} checked for modifications (modified=${this.modified})`,
    );
    return this;
  }

  async executePartials(replaceFunction, rootDirectory) {
    for (let key of Object.keys(this.#partials).filter(
      (key) => this.#partials[key].file,
    )) {
      for (let element of this.#partials[key].elements) {
        let elementContent;

        if (isFunction(this.#partials[key].file.module)) {
          elementContent = this.#partials[key].file.module(
            element,
            getConfig().data,
            rootDirectory,
          );
        } else if (isInObject(this.#partials[key].file.module, "render")) {
          elementContent = this.#partials[key].file.module.render(
            element,
            getConfig().data,
            rootDirectory,
          );
        }

        if (elementContent) {
          await tryCatch(
            () => replaceFunction(element, elementContent),
            (e) =>
              getLogger().warn(
                8,
                `Failed to substitute partial in file ${this.src.rel} (key: ${key}, element: ${element}, elementContent: ${elementContent})`,
                `(${e.name}: ${e.message})`,
              ),
            (e) => e.name !== "TypeError",
          );
        }
      }
    }
  }
}

export default FileWithPartials;
