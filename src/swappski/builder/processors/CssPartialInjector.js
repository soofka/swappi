import css from "css";
import PartialInjector from "./PartialInjector.js";
import { isInObject } from "../../helpers/index.js";

export class CssPartialInjector extends PartialInjector {
  constructor(options) {
    super(
      options,
      {
        test: (direntData) =>
          (direntData.name.endsWith(".partial") && direntData.ext === ".css") ||
          (direntData.name.endsWith(".partial.css") &&
            direntData.ext === ".js"),
        declaration: "-swapp-partial",
      },
      ".css",
    );
  }

  testIfHasPartials(file) {
    return this.#getElements(css.parse(file.src.content)).length > 0;
  }

  async processPartials(content, dists) {
    const cssParser = css.parse(content);
    const elements = this.#getElements(cssParser);
    for (let rule of elements) {
      for (let declaration of rule.declarations) {
        const declarationArray = declaration.value.substring(1).split(":");
        if (isInObject(this.partials, declarationArray[0])) {
          const partial = this.partials[declarationArray[0]];
          declaration = this.executePartial(partial, dists, declaration);
        }
      }
    }
    return css.stringify(cssParser);
  }

  #getElements(cssParser) {
    return cssParser.stylesheet.rules
      .filter((rule) => rule.type === "rule")
      .map((rule) => {
        rule.declarations = rule.declarations.filter(
          (declaration) =>
            declaration.type === "declaration" &&
            declaration.property === this.options.declaration,
        );
        return rule;
      })
      .filter((rule) => rule.declarations.length > 0);
  }
}

export default CssPartialInjector;
