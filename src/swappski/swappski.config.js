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
import { RoutingProvider } from "./builder/providers/index.js";

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

  port: 3000,

  mode: "prod",
  processors: {
    dev: [
      new TemplateProcessor(),
      new HtmlPartialInjector(),
      new CssPartialInjector(),
    ],
    prod: [
      new TemplateProcessor(),
      new HtmlPartialInjector(),
      new CssPartialInjector(),
      new HtmlMinifier(),
      new CssMinifier(),
      new JsMinifier(),
      new ImgProcessor(),
    ],
  },
  providers: [new RoutingProvider()],

  data: {},
};

export default config;
