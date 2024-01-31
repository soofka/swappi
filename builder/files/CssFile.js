import css from "css";
import CleanCSS from "clean-css";
import FileWithPartials from "./FileWithPartials.js";
import { isObject } from "../helpers/index.js";
import { getConfig, getLogger } from "../utils/index.js";

export class CssFile extends FileWithPartials {
  #cssParser;

  async prepare(
    isConfigModified,
    distPath,
    reportDirectory = undefined,
    additionalDirectories = undefined,
  ) {
    getLogger().log(
      7,
      `Preparing css file ${this.src.rel} [isConfigModified=${isConfigModified}, distPath=${distPath}, reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`,
    );
    super.prepare(
      isConfigModified,
      distPath,
      reportDirectory,
      additionalDirectories,
    );

    if (
      isObject(additionalDirectories) &&
      additionalDirectories.hasOwnProperty("partials")
    ) {
      this.#cssParser = css.parse(this.content);
      const partials = {};

      for (let rule of this.#cssParser.stylesheet.rules.filter(
        (rule) => rule.type === "rule",
      )) {
        for (let declaration of rule.declarations.filter(
          (declaration) =>
            declaration.type === "declaration" &&
            declaration.property ===
              getConfig().constants.cssPartialDeclaration,
        )) {
          const name = declaration.value.substring(1).split(":")[0];
          if (partials.hasOwnProperty(name)) {
            partials[name].elements.push(declaration);
          } else {
            partials[name] = { elements: [declaration] };
          }
        }
      }

      await this.preparePartials(additionalDirectories.partials, partials);
    }

    getLogger().log(
      7,
      `Css file ${this.src.rel} prepared (modified: ${this.modified}, dist length: ${this.dist.length})`,
    );
    return this;
  }

  async execute(dist, index, rootDirectory) {
    let content = this.content;

    if (this.#cssParser) {
      await this.executePartials(
        (element, content) => (element = content),
        rootDirectory,
      );
      content = css.stringify(this.#cssParser);
    }

    return new CleanCSS(getConfig().options.optimize.css).minify(content)
      .styles;
  }
}

export default CssFile;
