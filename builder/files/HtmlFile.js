import * as cheerio from "cheerio";
import { minify } from "html-minifier";
import FileWithPartials from "./FileWithPartials.js";
import { getConfig } from "../utils/index.js";

export class HtmlFile extends FileWithPartials {
  #htmlParser;

  collectPartials() {
    this.#htmlParser = cheerio.load(this.content);

    for (let element of this.#htmlParser(
      `[${getConfig().constants.htmlPartialAttribute}]`,
    )) {
      const elementParsed = this.#htmlParser(element);
      this.addPartial(
        elementParsed.attr(getConfig().constants.htmlPartialAttribute),
        elementParsed,
      );
    }
  }

  async execute(dist, index, rootDirectory) {
    let content = this.content;

    if (this.#htmlParser) {
      this.executePartials(
        (element, content) => this.#htmlParser(element).replaceWith(content),
        rootDirectory,
      );
      content = this.#htmlParser.html();
    }

    return minify(content, getConfig().options.optimize.html);
  }
}

export default HtmlFile;
