import ModuleProcessor from "./ModuleProcessor.js";
import { deepMerge, isFunction, isInObject } from "../../helpers/index.js";
import { getConfig } from "../../utils/index.js";

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
    super(
      options,
      deepMerge(defaultOptions, { shouldFileBeRendered: () => false }),
    );
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
    if (this.#testIfPartial(file.src)) {
      file = await super.prepareFile(file);
      this.addPartial(file.dists[0].name, file);

      const shouldBeRendered = isInObject(file.src.content, "renderToFile")
        ? file.src.content.renderToFile
        : this.options.shouldFileBeRendered(file);
      if (!shouldBeRendered) {
        file.dists = [];
      }
    }
    return file;
  }

  async process(dist, files) {
    if (this.#testIfPartial(dist)) {
      if (isFunction(dist.content)) {
        dist.content = dist.content(getConfig().data, files);
      } else if (
        isInObject(dist.content, "render") &&
        isFunction(dist.content.render)
      ) {
        dist.content = dist.content.render(getConfig().data, files);
      }
    } else {
      dist.content = await this.processPartials(dist.content, files);
    }
    return dist;
  }

  executePartial(partial, element, files) {
    return isFunction(partial.src.content)
      ? partial.src.content(getConfig().data, files, element)
      : isInObject(partial.src.content, "render") &&
          isFunction(partial.src.content.render)
        ? partial.src.content.render(getConfig().data, files, element)
        : partial.src.content;
  }
}

export default PartialInjector;
