import Processor from "./Processor.js";
import { isFunction, isInObject, isObject } from "../../helpers/index.js";
import { getConfig } from "../../utils/index.js";

export class ModuleProcessor extends Processor {
  async prepareFile(file) {
    // make it load from memory
    file.src.content = await loadModule(file.src.abs);

    const nameArray = file.src.name.split(".");
    if (nameArray.length > 3) {
      file.dist[0].name = nameArray.slice(0, nameArray.length - 3).join(".");
      file.dist[0].ext = `.${nameArray[nameArray.length - 2]}`;
    }

    if (isFunction(file.src.content)) {
      file.dist[0].content = file.src.content;
    } else if (isObject(file.src.content)) {
      if (isInObject(file.src.content, "generate")) {
        file.dist = file.src.content.generate(getConfig().data);
      } else {
        file.dist = Object.keys(file.src.content)
          .filter((key) => isFunction(file.src.content[key]))
          .map((key) => {
            const newDist = file.dist[0].clone();
            newDist.name = `${newDist.name}${key}`;
            newDist.content = file.src.content[key];
            return newDist;
          });
      }
    }

    return file;
  }
}

export default ModuleProcessor;