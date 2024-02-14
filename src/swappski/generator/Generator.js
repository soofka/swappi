import path from "path";
import { copyDir } from "../helpers/index.js";

export class Generator {
  #srcAbsPath;

  constructor() {
    this.#srcAbsPath = path.resolve("../../templates");
  }

  generate(distAbsPath, template) {
    return copyDir(path.join(this.#srcAbsPath, template), distAbsPath);
  }
}

export default Generator;
