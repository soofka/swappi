import { minify } from "html-minifier";
import Processor from "./Processor.js";

export class HtmlMinifier extends Processor {
  test(direntData) {
    return direntData.ext === ".html";
  }

  async process(content) {
    return minify(content, this.options);
  }
}

export default HtmlMinifier;
