import * as cheerio from "cheerio";
import { minify } from "html-minifier";
import FileWithPartials from "./FileWithPartials.js";
import { isInObject } from "../helpers/index.js";
import { getConfig, getLogger } from "../utils/index.js";

export class HtmlFile extends FileWithPartials {
  #htmlParser;

  async prepareForProcessing(distPath, reportDirectory, additionalDirectories) {
    getLogger().log(
      7,
      `Preparing html file ${this.src.rel} for processing [distPath=${distPath}. reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`,
    );
    await super.prepareForProcessing(
      distPath,
      reportDirectory,
      additionalDirectories,
    );

    if (isInObject(additionalDirectories, "partials")) {
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

      this.preparePartials(additionalDirectories.partials);
    }

    getLogger().log(
      7,
      `Html file ${this.src.rel} prepared for processing (dist length: ${this.dist.length})`,
    );
    return this;
  }

  async execute(dist, index, rootDirectory) {
    let content = this.content;

    if (this.#htmlParser) {
      await this.executePartials(
        (element, content) => this.#htmlParser(element).replaceWith(content),
        rootDirectory,
      );
      content = this.#htmlParser.html();
    }

    return minify(content, getConfig().options.optimize.html);
  }
}

export default HtmlFile;
