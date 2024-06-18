import path from "path";
import { performance } from "perf_hooks";
import { copyDir } from "../helpers/index.js";
import { getLogger } from "../utils/index.js";

export class Generator {
  async generate(distAbsPath, template) {
    const startTime = performance.now();
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

    const endTime = performance.now();
    getLogger()
      .logLevelDown()
      .log(
        `Template ${template} generated in ${Math.round(endTime - startTime)}ms`,
      );
  }
}

export default Generator;
