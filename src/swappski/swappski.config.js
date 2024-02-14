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
  src: path.resolve("src"),
  dist: path.resolve("dist"),

  force: false,
  verbosity: 8,
  logFile: "",
  reportFile: path.resolve("report.json"),

  hash: true,
  hashOptions: {
    separator: "+",
    algorithm: "shake256",
    algorithmOptions: { outputLength: 8 },
  },

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
