import CleanCSS from "clean-css";
import Processor from "./Processor.js";

export class CssMinifier extends Processor {
  #minifier;

  constructor(options) {
    super(options);
    this.#minifier = new CleanCSS(options);
  }

  test(direntData) {
    return direntData.ext === ".css";
  }

  async process(content) {
    return this.#minifier.minify(content).styles;
  }
}

export default CssMinifier;
