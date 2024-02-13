import css from "css";
import PartialInjector from "./PartialInjector.js";
import { isInObject } from "../../helpers/index.js";
import { getConfig } from "../../utils/index.js";

export class CssPartialInjector extends PartialInjector {
  constructor(options) {
    super(
      options,
      {
        test: (direntData) => direntData.full.endsWith(".partial.css.js"),
        declaration: "-swapp-partial",
      },
      ".css",
    );
  }

  async processPartials(content) {
    const cssParser = css.parse(content);
    for (let rule of cssParser.stylesheet.rules.filter(
      (rule) => rule.type === "rule",
    )) {
      for (let declaration of rule.declarations.filter(
        (declaration) =>
          declaration.type === "declaration" &&
          declaration.property === this.options.declaration,
      )) {
        const declarationArray = declaration.value.substring(1).split(":");
        if (isInObject(this.partials, declarationArray[0])) {
          const partial = this.partials[declarationArray[0]];
          declaration = isFunction(partial)
            ? partial(getConfig().data, declarationArray[1])
            : partial.render(getConfig().data, declarationArray[1]);
        }
      }
    }
    return css.stringify(cssParser);
  }
}

export default CssPartialInjector;
