import CleanCSS from "clean-css";
import Processor from "./Processor.js";

export class CssMinifier extends Processor {
  #minifier;

  constructor(options) {
    super(options, {
      test: (direntData) => direntData.ext === ".css",
      minifierOptions: {},
    });
    this.#minifier = new CleanCSS(this.options.minifierOptions);
  }

  async process(dist) {
    dist.content = this.#minifier.minify(dist.content).styles;
    return dist;
  }
}

export default CssMinifier;
