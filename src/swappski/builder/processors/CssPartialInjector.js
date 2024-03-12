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

  testIfHasPartials(content) {
    return (
      css
        .parse(content)
        .stylesheet.rules.filter((rule) => rule.type === "rule")
        .map((rule) => {
          rule.declarations = rule.declarations.filter(
            (declaration) =>
              declaration.type === "declaration" &&
              declaration.property === this.options.declaration,
          );
          return rule;
        })
        .filter((rule) => rule.declarations.length > 0).length > 0
    );
  }

  async processPartials(content, dists) {
    const cssParser = css.parse(content);
    cssParser.stylesheet.rules = cssParser.stylesheet.rules.map((rule) => {
      if (rule.type === "rule") {
        rule.declarations = rule.declarations.map((declaration) => {
          if (
            declaration.type === "declaration" &&
            declaration.property === this.options.declaration
          ) {
            const declarationArray = declaration.value.substring(1).split(":");
            if (isInObject(this.partials, declarationArray[0])) {
              const partial = this.partials[declarationArray[0]];
              declaration = this.executePartial(partial, dists, declaration);
            }
          }
          return declaration;
        });
      }
      return rule;
    });
    return css.stringify(cssParser);
  }
}

export default CssPartialInjector;
