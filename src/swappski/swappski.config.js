export const config = {
  force: false,
  verbosity: 3,
  logFile: "",
  reportFile: "",

  src: "",
  dist: "",

  processors: [
    new TemplatesProcessor(),
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
