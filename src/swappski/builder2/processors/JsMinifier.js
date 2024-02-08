import { minify } from "terser";
import Processor from "./Processor.js";

export class JsMinifier extends Processor {
  test(direntData) {
    return direntData.ext === ".js";
  }

  async process(content) {
    const contentMinified = await minify(content, this.options);
    return contentMinified.code;
  }
}

export default JsMinifier;
