import path from "path";
import Processor from "./Processor.js";
import {
  isFunction,
  isInObject,
  isObject,
  loadModuleFromFile,
} from "../../helpers/index.js";
import { getConfig } from "../../utils/index.js";

export class ModuleProcessor extends Processor {
  async prepareFile(file) {
    file.src.content = await loadModuleFromFile(
      path.join(file.src.absDir, `${file.src.name}${file.src.ext}`),
    );
    if (isFunction(file.src.content) || isObject(file.src.content)) {
      file.isStatic = false;
    }

    const nameArray = file.src.name.split(".");
    if (nameArray.length > 2) {
      file.dists[0].name = nameArray.slice(0, nameArray.length - 2).join(".");
      file.dists[0].ext = `.${nameArray[nameArray.length - 1]}`;
    }

    if (isFunction(file.src.content)) {
      file.dists[0].content = file.src.content;
    } else if (isObject(file.src.content)) {
      if (isInObject(file.src.content, "generate")) {
        file.dists = file.src.content.generate(getConfig().data).map((dist) => {
          const newDist = file.dists[0].clone();
          newDist.name = dist.name;
          newDist.content = dist.content;
          if (dist.resetContentHash) {
            newDist.resetContentHash(dist.contentHashSalt);
          }
          return newDist;
        });
      } else {
        file.dists = Object.keys(file.src.content)
          .filter((key) => isFunction(file.src.content[key]))
          .map((key) => {
            const newDist = file.dists[0].clone();
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
