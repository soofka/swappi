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

  async process(dist, dists) {
    dist.content = dist.content(getConfig().data, dists);
    return dist;
  }
}

export default TemplateProcessor;
