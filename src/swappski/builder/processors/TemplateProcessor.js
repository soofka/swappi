import ModuleProcessor from "./ModuleProcessor.js";
import { getConfig } from "../../utils/index.js";

export class TemplateProcessor extends ModuleProcessor {
  constructor(options) {
    super(options, {
      test: (direntData) =>
        direntData.name.split(".").includes("template") &&
        direntData.ext === ".js",
    });
  }

  async process(dist) {
    dist.content = dist.content(getConfig().data);
    return dist;
  }
}

export default TemplateProcessor;
