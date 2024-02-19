import * as cheerio from "cheerio";
import PartialInjector from "./PartialInjector.js";
import { isInObject } from "../../helpers/index.js";

export class HtmlPartialInjector extends PartialInjector {
  constructor(options) {
    super(
      options,
      {
        test: (direntData) =>
          (direntData.name.endsWith(".partial") &&
            direntData.ext === ".html") ||
          (direntData.name.endsWith(".partial.html") &&
            direntData.ext === ".js"),
        attribute: "data-swapp-partial",
      },
      ".html",
    );
  }

  testIfHasPartials(file) {
    return (
      cheerio.load(file.src.content)(`[${this.options.attribute}]`).length > 0
    );
  }

  async processPartials(content, dists) {
    const htmlParser = cheerio.load(content);
    for (let element of htmlParser(`[${this.options.attribute}]`)) {
      const elementParsed = htmlParser(element);
      const partialName = elementParsed.attr(this.options.attribute);

      if (isInObject(this.partials, partialName)) {
        const partial = this.partials[partialName];
        elementParsed.html(this.executePartial(partial, dists, elementParsed));
      }
    }
    return htmlParser.html();
  }
}

export default HtmlPartialInjector;
