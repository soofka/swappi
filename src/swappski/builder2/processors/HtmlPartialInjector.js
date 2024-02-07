export class HtmlPartialInjector extends ModuleProcessor {
  #partials = {};

  test(file) {
    return file.full.endsWith(".partial.html.js") || file.ext === ".html";
  }

  async prepare(file) {
    if (file.full.endsWith("partial.html.js")) {
      file = super.prepare(file);

      const partialName = file.name.substring(file.name.length - 9);
      if (isInObject(this.#partials, partialName)) {
        this.partials[partialName].file = file;
      } else {
        this.partials[partialName] = { file };
      }
    } else {
      const htmlParser = cheerio.load(this.content);

      for (let element of htmlParser(
        `[${getConfig().constants.htmlPartialAttribute}]`,
      )) {
        const elementParsed = htmlParser(element);
        const partialName = elementParsed.attr(
          getConfig().constants.htmlPartialAttribute,
        );

        if (isInObject(this.#partials, partialName)) {
          this.partials[partialName].elements.push(elementParsed);
        } else {
          this.partials[partialName] = { elements: [elementParsed] };
        }
      }
    }
    return file;
  }

  async process(file) {
    // if
    // else
    const executing = [];
    for (let partialName of Object.keys(this.#partials)) {
      for (let element of this.#partials[partialName].elements) {
      }
    }

    return await Promise.all(executing);
  }

  replacePartial() {}
}
