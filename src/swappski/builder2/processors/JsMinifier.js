import Processor from "./Processor.js";

export class JsMinifier extends Processor {
  test(file) {
    return file.ext === ".css";
  }
}

export default JsMinifier;
