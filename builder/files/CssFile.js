import css from "css";
import CleanCSS from "clean-css";
import FileWithPartials from "./FileWithPartials.js";
import { getConfig } from "../utils/index.js";

export class CssFile extends FileWithPartials {
  #cssParser;

  collectPartials() {
    this.#cssParser = css.parse(this.content);

    for (let rule of this.#cssParser.stylesheet.rules.filter(
      (rule) => rule.type === "rule",
    )) {
      for (let declaration of rule.declarations.filter(
        (declaration) =>
          declaration.type === "declaration" &&
          declaration.property === getConfig().constants.cssPartialDeclaration,
      )) {
        this.addPartial(
          declaration.value.substring(1).split(":")[0],
          declaration,
        );
      }
    }
  }

  async execute(dist, index, rootDirectory) {
    let content = this.content;

    if (this.#cssParser) {
      this.executePartials(
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
