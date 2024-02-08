import Processor from "./Processor.js";

export class CssMinifier extends Processor {
  test(file) {
    return file.ext === ".css";
  }
}

export default CssMinifier;
