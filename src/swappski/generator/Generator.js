import path from "path";
import { copyDir } from "../helpers/index.js";
import { getLogger } from "../utils/index.js";

export class Generator {
  async generate(distAbsPath, template) {
    getLogger()
      .log(`Generating template ${template} to ${distAbsPath}`)
      .logLevelUp();

    await copyDir(
      path.join(
        path.dirname(import.meta.url.substring(8)),
        "templates",
        template,
      ),
      distAbsPath,
    );

    getLogger().logLevelDown().log(`Template ${template} generated`);
  }
}

export default Generator;
