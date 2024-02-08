import ModuleProcessor from "./ModuleProcessor.js";
import { isFunction, isInObject, isObject } from "../../helpers/index.js";

export class PartialInjector extends ModuleProcessor {
  #ext;
  #partials = {};
  get partials() {
    return this.#partials;
  }
  set partials(value) {
    this.#partials = value;
  }

  constructor(options, ext) {
    super(options);
    this.#ext = ext;
  }

  test(file) {
    return this.#testIfPartial(file) || this.#testIfFileWithPartials(file);
  }

  #testIfPartial(file) {
    return file.src.full.endsWith(`.partial${this.#ext}.js`);
  }

  #testIfFileWithPartials(file) {
    return file.src.ext === this.#ext;
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

      const renderAllowed = isInObject(file.src.content, "renderToFile")
        ? file.src.content.renderToFile
        : this.options.renderToFile;
      const renderPossible =
        (renderAllowed && isFunction(file.src.content)) ||
        (isInObject(file.src.content, "render") &&
          isFunction(file.src.content.render));

      if (!renderPossible) {
        file.dist = [];
      }
    }
    return file;
  }

  async process(content) {
    if (isFunction(content)) {
      return content(getConfig().data);
    } else if (isObject(content)) {
      return content.render(getConfig().data);
    }
    return content;
  }
}

export default PartialInjector;
