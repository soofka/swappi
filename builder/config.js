import path from "path";

export const config = {
  paths: {
    public: {
      src: path.resolve(path.join("src", "public")),
      dist: path.resolve("dist"),
    },
    partials: {
      src: path.resolve(path.join("src", "partials")),
      dist: path.resolve("src", "public", "partials"),
    },
    templates: {
      src: path.resolve(path.join("src", "templates")),
      dist: path.resolve(path.join("src", "public", "templates")),
    },
    report: path.resolve("report.json"),
  },

  options: {
    verbosity: 9,
    hash: true,
    force: false,

    optimize: {
      js: {},
      img: {
        widths: [320, 640, 1280, 1920, 2560],
        types: ["webp", "avif", "jpeg"],
        keepOriginal: true,
      },
      html: {
        includeAutoGeneratedTags: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        sortClassName: true,
        useShortDoctype: true,
        collapseWhitespace: true,
      },
      css: {},
    },
  },

  constants: {
    hashAlgorithm: "shake256",
    hashAlgorithmOptions: { outputLength: 8 },
    hashSeparator: "+",
    htmlPartialAttribute: "data-swapp-partial",
    cssPartialDeclaration: "-swapp-partial",
    jsonPartialField: "_swapp_partial",
    filesGroupMap: {
      html: [".html"],
      css: [".css"],
      js: [".js"],
      json: [".json", ".webmanifest"],
      img: [".avif", ".webp", ".gif", ".png", ".jpg", ".jpeg", ".svg"],
    },
  },

  data: {},
};

export default config;
