import { minify } from "terser";
import Processor from "./Processor.js";

export class JsMinifier extends Processor {
  constructor(options) {
    super(options, {
      test: (direntData) => direntData.ext === ".js",
      minifierOptions: {},
    });
  }

  async process(dist) {
    const contentMinified = await minify(
      dist.content,
      this.options.minifierOptions,
    );
    dist.content = contentMinified.code;
    return dist;
  }
}

export default JsMinifier;
