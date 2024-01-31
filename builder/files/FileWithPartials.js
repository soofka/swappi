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

  preparePartials(partialsDirectory, partials) {
    getLogger().log(
      7,
      `Preparing partials for file ${this.src.rel} [partialsDirectory=${partialsDirectory}, partials=${partials}]`,
    );

    this.#partials = partials;

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

      if (this.#partials[key].file && this.#partials[key].file.modified) {
        this.modified = true;
      }
    }

    getLogger().log(7, `Preparing partials for file ${this.src.rel} finished`);
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
