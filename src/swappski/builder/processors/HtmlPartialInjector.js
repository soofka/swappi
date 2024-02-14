import * as cheerio from "cheerio";
import PartialInjector from "./PartialInjector.js";
import { isFunction, isInObject } from "../../helpers/index.js";
import { getConfig } from "../../utils/index.js";

export class HtmlPartialInjector extends PartialInjector {
  constructor(options) {
    super(
      options,
      {
        test: (direntData) =>
          direntData.name.endsWith(".partial.html") && direntData.ext === ".js",
        attribute: "data-swapp-partial",
      },
      ".html",
    );
  }

  async processPartials(content, files) {
    const htmlParser = cheerio.load(content);
    for (let element of htmlParser(`[${this.options.attribute}]`)) {
      const elementParsed = htmlParser(element);
      const partialName = elementParsed.attr(this.options.attribute);

      if (isInObject(this.partials, partialName)) {
        const partial = this.partials[partialName];
        elementParsed.replaceWith(
          isFunction(partial.src.content)
            ? partial.src.content(getConfig().data, files, elementParsed)
            : partial.src.content.render(
                getConfig().data,
                files,
                elementParsed,
              ),
        );
      }
    }
    return htmlParser.html();
  }
}

export default HtmlPartialInjector;
