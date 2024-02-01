import css from "css";
import CleanCSS from "clean-css";
import FileWithPartials from "./FileWithPartials.js";
import { isInObject } from "../helpers/index.js";
import { getConfig, getLogger } from "../utils/index.js";

export class CssFile extends FileWithPartials {
  #cssParser;

  async prepareForProcessing(distPath, reportDirectory, additionalDirectories) {
    getLogger().log(
      7,
      `Preparing css file ${this.src.rel} for processing [distPath=${distPath}. reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`,
    );
    await super.prepareForProcessing(
      distPath,
      reportDirectory,
      additionalDirectories,
    );

    if (isInObject(additionalDirectories, "partials")) {
      this.#cssParser = css.parse(this.content);

      for (let rule of this.#cssParser.stylesheet.rules.filter(
        (rule) => rule.type === "rule",
      )) {
        for (let declaration of rule.declarations.filter(
          (declaration) =>
            declaration.type === "declaration" &&
            declaration.property ===
              getConfig().constants.cssPartialDeclaration,
        )) {
          this.addPartial(
            declaration.value.substring(1).split(":")[0],
            declaration,
          );
        }
      }

      this.preparePartials(additionalDirectories.partials);
    }

    getLogger().log(
      7,
      `Css file ${this.src.rel} prepared for processing (dist length: ${this.dist.length})`,
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
