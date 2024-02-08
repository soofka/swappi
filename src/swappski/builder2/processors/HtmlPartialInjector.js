import * as cheerio from "cheerio";
import PartialInjector from "./PartialInjector.js";
import { getConfig } from "../../utils.js";

export class HtmlPartialInjector extends PartialInjector {
  constructor(options) {
    super(options, ".html");
  }

  async processPartials(content) {
    const htmlParser = cheerio.load(content);
    for (let element of htmlParser(`[${this.options.attribute}]`)) {
      const elementParsed = htmlParser(element);
      const partialName = elementParsed.attr(this.options.attribute);

      if (isInObject(this.partials, partialName)) {
        const partial = this.partials[partialName];
        elementParsed.replaceWith(
          isFunction(partial)
            ? partial(getConfig().data, elementParsed)
            : partial.render(getConfig().data, elementParsed),
        );
      }
    }
    return htmlParser.html();
  }
}

export default HtmlPartialInjector;
