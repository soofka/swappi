import { minify } from "terser";
import File from "./File.js";
import { getConfig } from "../utils/index.js";

export class JsFile extends File {
  async execute(dist, index) {
    const contentMinified = await minify(
      this.content,
      getConfig().options.optimize.js,
    );
    return contentMinified.code;
  }
}

export default JsFile;
