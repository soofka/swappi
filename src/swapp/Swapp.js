import { performance } from "perf_hooks";
import defaultConfig from "./swapp.config.js";
import { Directory } from "./files/index.js";
import {
  deepMerge,
  isDeepEqual,
  isInObject,
  isObject,
  loadJson,
  saveFile,
} from "./helpers/index.js";
import {
  initConfigProvider,
  getConfig,
  initFileProvider,
  getFileProvider,
  initLoggerProvider,
  getLogger,
} from "./utils/index.js";

export class Swapp {
  #files = {
    public: { src: {}, dist: {} },
    partials: { src: {}, dist: {} },
    templates: { src: {}, dist: {} },
    report: {
      public: undefined,
      partials: undefined,
      templates: undefined,
    },
  };
  #isConfigModified = true;

  constructor(config) {
    initConfigProvider(deepMerge(defaultConfig, config));
    initLoggerProvider(getConfig().options.verbosity);
    initFileProvider(getConfig().constants.filesGroupMap);
  }

  async build() {
    await this.init();
    await this.process();
    return this;
  }

  async run() {
    getLogger().log(1, "Run not yet implemented");
    return this;
  }

  async watch() {
    getLogger().log(1, "Watch not yet implemented");
    return this;
  }

  async generate() {
    getLogger().log(1, "Generate not yet implemented");
    return this;
  }

  async init() {
    const startTime = performance.now();
    getLogger().log(1, "Initializing build");
    getLogger().log(10, `Config: ${JSON.stringify(getConfig())}`);

    await this.#initReport();
    await Promise.all([this.#initTemplates(), this.#initPartials()]);
    await this.#initPublic();

    const endTime = performance.now();
    getLogger().log(
      1,
      `Build initialized in ${Math.round(endTime - startTime)}ms`,
    );
  }

  async #initReport() {
    getLogger().log(
      2,
      `Initializing previous build report (path: ${getConfig().paths.report})`,
    );

    getLogger().log(3, "Loading previous build report");
    const report = loadJson(getConfig().paths.report);
    if (
      report &&
      isInObject(report, "config") &&
      isObject(report.config) &&
      isInObject(report, "files") &&
      isObject(report.files)
    ) {
      this.#isConfigModified = !isDeepEqual(getConfig(), report.config);
      getLogger().log(
        4,
        `Config has ${this.#isConfigModified ? "" : "not "}changed`,
      );

      if (isInObject(report.files, "templates")) {
        this.#files.report.templates = new Directory(() =>
          getFileProvider().getTemplateFile(),
        ).deserialize(report.files.templates);
      }

      if (isInObject(report.files, "partials")) {
        this.#files.report.partials = new Directory(() =>
          getFileProvider().getPartialFile(),
        ).deserialize(report.files.partials);
      }

      if (isInObject(report.files, "public")) {
        this.#files.report.public = new Directory((dirent) => {
          return getFileProvider().getFileFromDirentData(dirent.src);
        }).deserialize(report.files.public);
      }

      getLogger().log(3, "Loading previous build report finished");
      getLogger().log(10, `Previous bulid report: ${report}`);
    } else {
      getLogger().warn(
        3,
        `Invalid previous build report content (content: ${report})`,
      );
    }

    getLogger().log(2, "Previous bulid report initialized");
  }

  async #initTemplates() {
    getLogger().log(
      2,
      `Initializing templates (path: ${JSON.stringify(getConfig().paths.templates)})`,
    );

    this.#files.templates.dist = new Directory(
      (nodeDirent) => getFileProvider().getFileFromNodeDirent(nodeDirent),
      getConfig().paths.templates.dist,
    );
    await this.#files.templates.dist.load(false);

    this.#files.templates.src = new Directory(
      () => getFileProvider().getTemplateFile(),
      getConfig().paths.templates.src,
    );
    await this.#files.templates.src.load();
    await this.#files.templates.src.prepare(
      this.#isConfigModified,
      getConfig().paths.templates.dist,
      this.#files.report.templates,
      { oldDist: this.#files.templates.dist },
    );

    getLogger().log(2, "Initializing templates finished");
    getLogger().log(
      10,
      `Templates: ${JSON.stringify(this.#files.templates.src.serialize())}`,
    );
  }

  async #initPartials() {
    getLogger().log(
      2,
      `Initializing partials (path: ${JSON.stringify(getConfig().paths.partials)})`,
    );

    this.#files.partials.dist = new Directory(
      (nodeDirent) => getFileProvider().getFileFromNodeDirent(nodeDirent),
      getConfig().paths.partials.dist,
    );
    await this.#files.partials.dist.load(false);

    this.#files.partials.src = new Directory(
      () => getFileProvider().getPartialFile(),
      getConfig().paths.partials.src,
    );
    await this.#files.partials.src.load();
    await this.#files.partials.src.prepare(
      this.#isConfigModified,
      getConfig().paths.partials.dist,
      this.#files.report.partials,
      { oldDist: this.#files.partials.dist },
    );

    getLogger().log(2, "Initializing partials finished");
    getLogger().log(
      10,
      `Partials: ${JSON.stringify(this.#files.partials.src.serialize())}`,
    );
  }

  async #initPublic() {
    getLogger().log(
      2,
      `Initializing public (path: ${JSON.stringify(getConfig().paths.public)})`,
    );

    this.#files.public.dist = new Directory(
      (nodeDirent) => getFileProvider().getFileFromNodeDirent(nodeDirent),
      getConfig().paths.public.dist,
    );
    await this.#files.public.dist.load(false);

    this.#files.public.src = new Directory(
      (nodeDirent) => getFileProvider().getFileFromNodeDirent(nodeDirent),
      getConfig().paths.public.src,
    );
    await this.#files.public.src.load();
    await this.#files.public.src.prepare(
      this.#isConfigModified,
      getConfig().paths.public.dist,
      this.#files.report.public,
      {
        oldDist: this.#files.public.dist,
        partials: this.#files.partials.src,
      },
    );

    getLogger().log(2, "Initializing public finished");
    getLogger().log(
      10,
      `Public: ${JSON.stringify(this.#files.public.src.serialize())}`,
    );
  }

  async process() {
    const startTime = performance.now();
    getLogger().log(1, "Processing");

    await Promise.all([this.#processTemplates(), this.#processPartials()]);
    await this.#processPublic();
    await this.#buildReport();

    const endTime = performance.now();
    getLogger().log(
      1,
      `Processing finished in ${Math.round(endTime - startTime)}ms`,
    );
  }

  async #processTemplates() {
    getLogger().log(2, "Processing templates");

    await this.#files.templates.dist.reset();
    await this.#files.templates.src.process();

    getLogger().log(2, "Processing templates finished");
  }

  async #processPartials() {
    getLogger().log(2, "Processing partials");

    await this.#files.partials.dist.reset();
    await this.#files.partials.src.process();

    getLogger().log(2, "Processing partials finished");
  }

  async #processPublic() {
    getLogger().log(2, "Processing public");

    await this.#files.public.dist.reset();
    await this.#files.public.src.process();

    getLogger().log(2, "Processing public finished");
  }

  async #buildReport() {
    if (
      this.#files.templates.src.allStats.processed +
        this.#files.partials.src.allStats.processed +
        this.#files.public.src.allStats.processed >
      0
    ) {
      getLogger().log(3, "Saving current build report");

      await saveFile(
        getConfig().paths.report,
        JSON.stringify({
          config: getConfig(),
          files: {
            templates: this.#files.templates.src.serialize(),
            partials: this.#files.partials.src.serialize(),
            public: this.#files.public.src.serialize(),
          },
        }),
      );

      getLogger().log(3, "Saving current build report finished");
    } else {
      getLogger().log(
        3,
        "No files were processed in this build; build report is not generated",
      );
    }

    getLogger().log("Build report:");
    getLogger().log(
      1,
      `Templates: ${JSON.stringify(this.#files.templates.src.allStats)}`,
    );
    getLogger().log(
      1,
      `Partials: ${JSON.stringify(this.#files.partials.src.allStats)}`,
    );
    getLogger().log(
      1,
      `Public: ${JSON.stringify(this.#files.public.src.allStats)}`,
    );
  }
}

export default Swapp;
