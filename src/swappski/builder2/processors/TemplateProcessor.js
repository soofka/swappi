import ModuleProcessor from "./ModuleProcessor.js";
import { getConfig } from "../../utils/index.js";

export class TemplateProcessor extends ModuleProcessor {
  test(direntData) {
    return (
      direntData.name.split(".").includes("template") &&
      direntData.ext === ".js"
    );
  }

  async process(content) {
    return content(getConfig().data);
  }
}

export default TemplateProcessor;
