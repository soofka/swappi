import FileWithPartials from "./FileWithPartials.js";
import { isObject, parseJson } from "../helpers/index.js";
import { getConfig, getLogger } from "../utils/index.js";

export class JsonFile extends FileWithPartials {
  #contentJson;

  async prepareForProcessing(distPath, reportDirectory, additionalDirectories) {
    getLogger().log(
      7,
      `Preparing json file ${this.src.rel} for processing [distPath=${distPath}, reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`,
    );

    this.#contentJson = (await parseJson(this.content)) || {};

    await super.prepareForProcessing(
      distPath,
      reportDirectory,
      additionalDirectories,
    );

    getLogger().log(7, `Json file ${this.src.rel} prepared for processing`);
    return this;
  }

  collectPartials() {
    this.#collectPartialsDeep(this.#contentJson);
  }

  #collectPartialsDeep(obj) {
    for (let key of Object.keys(obj)) {
      const value = obj[key];
      if (key === getConfig().constants.jsonPartialField) {
        this.addPartial(value);
      } else if (isObject(value)) {
        this.#collectPartialsDeep(value);
      }
    }
  }

  async execute(dist, index, rootDirectory) {
    const content = await this.#executeDeep(this.#contentJson, rootDirectory);
    return JSON.stringify(content);
  }

  async #executeDeep(obj, rootDirectory) {
    const newObj = {};
    for (let key of Object.keys(obj)) {
      const value = obj[key];
      if (key === getConfig().constants.jsonPartialField) {
        for (let partial of Object.keys(this.partials)) {
          if (partial === value) {
            newObj[key] = this.executePartial(
              this.partials[partial].file.module,
              newObj,
              rootDirectory,
            );
            break;
          }
        }
      } else if (isObject(value)) {
        newObj[key] = await this.#executeDeep(value);
      } else {
        newObj[key] = value;
      }
    }
    return newObj;
  }
}

export default JsonFile;
