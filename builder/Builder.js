import defaultConfig from "./config.js";
import { Directory } from "./files/index.js";
import {
  deepMerge,
  isDeepEqual,
  isInObject,
  isObject,
  loadFile,
  parseJson,
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

export class Builder {
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

  async init() {
    getLogger().log(1, "Initializing build");
    getLogger().log(4, "Config:", JSON.stringify(getConfig()));

    await this.#initReport();
    await this.#initTemplates();
    await this.#initPartials();
    await this.#initPublic();

    getLogger().log(1, "Build initialized");
  }

  async #initReport() {
    getLogger().log(
      2,
      `Initializing previous build report (path: ${getConfig().paths.report})`,
    );

    getLogger().log(3, "Loading previous build report");
    const reportJson = await loadFile(getConfig().paths.report);
    if (reportJson) {
      const report = await parseJson(reportJson);
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
          this.#files.report.templates = new Directory((dirent) =>
            getFileProvider().getTemplateFile(),
          ).deserialize(report.files.templates);
        }

        if (isInObject(report.files, "partials")) {
          this.#files.report.partials = new Directory((dirent) =>
            getFileProvider().getPartialFile(),
          ).deserialize(report.files.partials);
        }

        if (isInObject(report.files, "public")) {
          this.#files.report.public = new Directory((dirent) =>
            getFileProvider().getFileFromDirentData(dirent.src),
          ).deserialize(report.files.public);
        }

        getLogger().log(3, "Loading previous build report finished");
        getLogger().log(4, "Previous bulid report:", reportJson);
      } else {
        getLogger().warn(
          3,
          `Invalid previous build report content (content: ${reportJson})`,
        );
      }
    } else {
      getLogger().warn(
        3,
        `Previous build report not found (path: ${getConfig().paths.report})`,
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
    await this.#files.templates.dist.load();

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
      4,
      "Templates:",
      JSON.stringify(this.#files.templates.src.serialize()),
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
    await this.#files.partials.dist.load();

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
      4,
      "Partials:",
      JSON.stringify(this.#files.partials.src.serialize()),
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
    await this.#files.public.dist.load();

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
      4,
      "Public:",
      JSON.stringify(this.#files.public.src.serialize()),
    );
  }

  async build() {
    getLogger().log(1, "Building");

    await this.#buildTemplates();
    await this.#buildPartials();
    await this.#buildPublic();
    await this.#buildReport();

    getLogger().log(1, "Building finished");
  }

  async #buildTemplates() {
    getLogger().log(2, "Building templates");

    await this.#files.templates.dist.reset();
    await this.#files.templates.src.process();

    getLogger().log(2, "Building templates finished");
  }

  async #buildPartials() {
    getLogger().log(2, "Building partials");

    await this.#files.partials.dist.reset();
    await this.#files.partials.src.process();

    getLogger().log(2, "Building partials finished");
  }

  async #buildPublic() {
    getLogger().log(2, "Building public");

    await this.#files.public.dist.reset();
    await this.#files.public.src.process();

    getLogger().log(2, "Building public finished");
  }

  async #buildReport() {
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

    getLogger().log(1, "Templates:", this.#files.templates.src.allStats);
    getLogger().log(1, "Partials:", this.#files.partials.src.allStats);
    getLogger().log(1, "Public:", this.#files.public.src.allStats);
  }
}

export default Builder;
