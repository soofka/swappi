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
    verbosity: 10,
    hash: true,
    force: false,

    optimize: {
      js: {},
      img: {},
      html: {},
      css: {},
    },
  },

  constants: {
    hashAlgorithm: "shake256",
    hashAlgorithmOptions: { outputLength: 8 },
    hashSeparator: "+",
    htmlPartialAttribute: "data-swapp-partial",
    cssPartialDeclaration: "-swapp-partial",
    jsonPartialField: "_partial",
    filesGroupMap: {
      html: [".html"],
      css: [".css"],
      js: [".js"],
      json: [".json", ".webmanifest"],
      img: [".avif", ".webp", ".gif", ".png", ".jpg", ".jpeg", ".svg"],
    },
  },
};

export default config;
