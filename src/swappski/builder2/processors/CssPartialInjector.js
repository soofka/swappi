import PartialInjector from "./PartialInjector.js";

export class CssPartialInjector extends PartialInjector {
  test(file) {
    return this.testIfPartial(file) || this.testIfFileWithPartial(file);
  }

  testIfPartial(file) {
    return file.full.endsWith(".partial.css.js");
  }

  testIfFileWithPartial(file) {
    return file.ext === ".css";
  }
}

export default CssPartialInjector;
