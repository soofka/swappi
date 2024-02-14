import path from "path";
import { copyDir } from "../helpers/index.js";

export class Generator {
  generate(distAbsPath, template) {
    console.log(
      path.join(
        path.dirname(import.meta.url.substring(8)),
        "templates",
        template,
      ),
    );
    return copyDir(
      path.join(
        path.dirname(import.meta.url.substring(8)),
        "templates",
        template,
      ),
      distAbsPath,
    );
  }
}

export default Generator;
