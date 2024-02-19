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
    return this.#getElements(cheerio.load(file.src.content)).length > 0;
  }

  async processPartials(content, files) {
    const htmlParser = cheerio.load(content);
    for (let element of this.#getElements(htmlParser)) {
      const elementParsed = htmlParser(element);
      const partialName = elementParsed.attr(this.options.attribute);

      if (isInObject(this.partials, partialName)) {
        const partial = this.partials[partialName];
        elementParsed.replaceWith(
          this.executePartial(partial, files, elementParsed),
        );
      }
    }
    return htmlParser.html();
  }

  #getElements(htmlParser) {
    return htmlParser(`[${this.options.attribute}]`);
  }
}

export default HtmlPartialInjector;
