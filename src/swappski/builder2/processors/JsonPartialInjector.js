import PartialInjector from "./PartialInjector.js";

export class JsonPartialInjector extends PartialInjector {
  test(file) {
    return this.testIfPartial(file) || this.testIfFileWithPartial(file);
  }

  testIfPartial(file) {
    return file.full.endsWith(".partial.css.js");
  }

  testIfFileWithPartial(file) {
    try {
      JSON.parse(file.src.content);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export default JsonPartialInjector;
