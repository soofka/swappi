import * as cheerio from "cheerio";
import { minify } from "html-minifier";
import FileWithPartials from "./FileWithPartials.js";
import { isInObject } from "../helpers/index.js";
import { getConfig, getLogger } from "../utils/index.js";

export class HtmlFile extends FileWithPartials {
  #htmlParser;

  async prepare(
    isConfigModified,
    distPath,
    reportDirectory = undefined,
    additionalDirectories = undefined,
  ) {
    getLogger().log(
      7,
      `Preparing html file ${this.src.rel} [isConfigModified=${isConfigModified}, distPath=${distPath}, reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`,
    );
    await super.prepare(
      isConfigModified,
      distPath,
      reportDirectory,
      additionalDirectories,
    );

    if (isInObject(additionalDirectories, "partials")) {
      this.#htmlParser = cheerio.load(this.content);
      const partials = {};

      for (let element of this.#htmlParser(
        `[${getConfig().constants.htmlPartialAttribute}]`,
      )) {
        const elementParsed = this.#htmlParser(element);
        const name = elementParsed.attr(
          getConfig().constants.htmlPartialAttribute,
        );
        if (isInObject(partials, name)) {
          partials[name].elements.push(elementParsed);
        } else {
          partials[name] = { elements: [elementParsed] };
        }
      }

      this.preparePartials(additionalDirectories.partials, partials);
    }

    getLogger().log(
      7,
      `Html file ${this.src.rel} prepared (modified: ${this.modified}, dist length: ${this.dist.length})`,
    );
    return this;
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
