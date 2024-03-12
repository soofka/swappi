import * as cheerio from "cheerio";
import PartialInjector from "./PartialInjector.js";
import { isInObject } from "../../helpers/index.js";
import { getLogger } from "../../utils/index.js";

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
        selector: "partial",
      },
      ".html",
    );
  }

  testIfHasPartials(content) {
    return cheerio.load(content)(this.options.selector).length > 0;
  }

  async processPartials(content, dists) {
    const htmlParser = cheerio.load(content);
    for (let element of htmlParser(this.options.selector)) {
      const elementParsed = htmlParser(element);
      const partialName = elementParsed.attr("name");
      let partialData = elementParsed.attr("data");

      try {
        partialData = JSON.parse(decodeURI(partialData));
      } catch (e) {
        getLogger().warn(`Cannot parse partial data: ${partialData}`);
        partialData = {};
      }

      if (isInObject(this.partials, partialName)) {
        const partial = this.partials[partialName];
        elementParsed.replaceWith(
          this.executePartial(partial, dists, partialData),
        );
      }
    }
    return htmlParser.html();
  }
}

export default HtmlPartialInjector;
