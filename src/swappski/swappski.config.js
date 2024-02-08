import path from "path";
import {
  CssMinifier,
  CssPartialInjector,
  HtmlMinifier,
  HtmlPartialInjector,
  ImgProcessor,
  JsMinifier,
  TemplateProcessor,
} from "./builder/processors/index.js";

export const config = {
  force: false,
  verbosity: 8,
  logFile: path.resolve("report.json"),
  reportFile: "",

  hash: true,
  hashOptions: {
    separator: "+",
    algorithm: "shake256",
    algorithmOptions: { outputLength: 8 },
  },

  src: path.resolve("src"),
  dist: path.resolve("dist"),

  processors: [
    new TemplateProcessor(),
    new HtmlPartialInjector(),
    new CssPartialInjector(),
    new HtmlMinifier(),
    new CssMinifier(),
    new JsMinifier(),
    new ImgProcessor(),
  ],

  data: {},
};

export default config;
