import ModuleFile from "./ModuleFile.js";
import { isFunction, isInObject } from "../helpers/index.js";

export class PartialFile extends ModuleFile {
  shouldBeProcessed() {
    if (
      this.module &&
      isInObject(this.module, "render") &&
      isFunction(this.module.render)
    ) {
      return this.modified;
    }
    return false;
  }
}

export default PartialFile;
