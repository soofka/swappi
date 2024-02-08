import ModuleProcessor from "./ModuleProcessor.js";

export class PartialInjector extends ModuleProcessor {
  #partials = {};
  get partials() {
    return this.#partials;
  }
  set partials(value) {
    this.#partials = value;
  }

  async prepareFile(file) {
    if (this.testIfPartial(file)) {
      file = super.prepare(file);

      const partialName = file.name.substring(file.name.length - 9);
      if (isInObject(this.#partials, partialName)) {
        this.partials[partialName].file = file;
      } else {
        this.partials[partialName] = { file };
      }
    }
  }
}

export default PartialInjector;
