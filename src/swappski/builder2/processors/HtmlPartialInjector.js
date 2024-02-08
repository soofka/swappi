import PartialInjector from "./PartialInjector.js";

export class HtmlPartialInjector extends PartialInjector {
  test(file) {
    return this.testIfPartial(file) || this.testIfFileWithPartial(file);
  }

  testIfPartial(file) {
    return file.full.endsWith(".partial.html.js");
  }

  testIfFileWithPartial(file) {
    return file.ext === ".html";
  }

  async prepare(file) {
    super.prepare(file);
    if (this.testIfFileWithPartial(file)) {
      const htmlParser = cheerio.load(this.content);

      for (let element of htmlParser(
        `[${getConfig().constants.htmlPartialAttribute}]`,
      )) {
        const elementParsed = htmlParser(element);
        const partialName = elementParsed.attr(
          getConfig().constants.htmlPartialAttribute,
        );

        if (isInObject(this.partials, partialName)) {
          this.partials[partialName].elements.push(elementParsed);
        } else {
          this.partials[partialName] = { elements: [elementParsed] };
        }
      }
    }
    return file;
  }
}

export default HtmlPartialInjector;
