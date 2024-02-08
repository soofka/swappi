import ModuleProcessor from "./ModuleProcessor.js";
import { deepMerge, isFunction, isInObject } from "../../helpers/index.js";

export class PartialInjector extends ModuleProcessor {
  #ext;
  #partials = {};
  get partials() {
    return this.#partials;
  }
  set partials(value) {
    this.#partials = value;
  }

  constructor(options, defaultOptions, ext) {
    super(options, deepMerge(defaultOptions, { renderToFile: false }));
    this.#ext = ext;
  }

  test(direntData) {
    return (
      this.#testIfPartial(direntData) ||
      this.#testIfFileWithPartials(direntData)
    );
  }

  #testIfPartial(direntData) {
    return this.options.test(direntData);
  }

  #testIfFileWithPartials(direntData) {
    return direntData.ext === this.#ext;
  }

  addPartial(name, file) {
    if (!isInObject(this.#partials, name)) {
      this.#partials[name] = file;
    }
  }

  async prepareFile(file) {
    if (this.#testIfPartial(file)) {
      file = await super.prepare(file);
      this.addPartial(file.dist[0].name, file);

      const shouldBeRendered = isInObject(file.src.content, "renderToFile")
        ? file.src.content.renderToFile
        : this.options.renderToFile;

      if (!shouldBeRendered) {
        file.dist = [];
      }
    }
    return file;
  }

  async process(dist) {
    if (this.#testIfPartial(dist)) {
      if (isFunction(dist.content)) {
        dist.content = dist.content(getConfig().data);
      } else if (
        isInObject(dist.content, "render") &&
        isFunction(dist.content.render)
      ) {
        dist.content = dist.content.render(getConfig().data);
      }
    } else {
      dist.content = await this.processPartials(dist.content);
    }
    return dist;
  }
}

export default PartialInjector;