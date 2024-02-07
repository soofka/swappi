import { Directory } from "./core/index.js";
import {
  isDeepEqual,
  isInObject,
  isObject,
  loadJson,
  saveFile,
} from "../helpers/index.js";
import { getConfig, getLogger } from "../utils/index.js";

export class Builder {
  #dirs = {
    src: {},
    dist: {},
  };
  #report;
  #controller;
  #isConfigModified = true;

  async build() {
    getLogger()
      .log(`Config: ${JSON.stringify(getConfig())}`, 10)
      .logLevelUp();

    await this.#initReport();
    await this.#initProcessors();

    await this.#processDirs();
    await this.#buildReport();

    getLogger().logLevelDown();
    return this;
  }

  async #initReport() {
    getLogger()
      .log(
        `Initializing previous build report (config.reportFile: ${getConfig().reportFile})`,
      )
      .logLevelUp();

    if (getConfig().reportFile && getConfig().reportFile.length > 0) {
      getLogger().log("Loading previous build report");

      const report = loadJson(getConfig().paths.report);
      if (
        report &&
        isInObject(report, "config") &&
        isObject(report.config) &&
        isInObject(report, "dirs") &&
        isObject(report.dirs)
      ) {
        this.#isConfigModified = !isDeepEqual(getConfig(), report.config);

        getLogger().log(
          `Config has ${this.#isConfigModified ? "" : "not "}changed`,
        );

        this.#report = new Directory().deserialize(report.dirs);

        getLogger()
          .log("Loading previous build report finished")
          .log(`Previous bulid report: ${report}`, 10);
      } else {
        getLogger().warn(
          `Invalid previous build report content (content: ${report})`,
        );
      }
    } else {
      getLogger().log("Previous build report is disabled in config");
    }

    getLogger().logLevelDown().log("Previous bulid report initialized");
  }

  async #initProcessors() {
    getLogger()
      .log(
        `Initializing processors (config.src: ${getConfig().src}, config.dist: ${getConfig().dist})`,
      )
      .logLevelUp();

    this.#controller = new Controller();
    // this.#report = this.getReport();
    this.#files = this.#controller.prepare(
      await new Directory(getConfig().src).load(),
      await new Directory(getConfig().dist).load(false),
      this.#report,
      getConfig().dist,
      this.#isConfigModified,
    );
    // this.#dirs.dist = await new Directory(getConfig().dist).load(false);
    // this.#dirs.src = await new Directory(getConfig().src).load();

    // this.#processors.prepare(
    //   this.#dirs.src,
    //   getConfig().dist,
    //   this.#report,
    //   this.#dirs.dist,
    // );

    // // for (let processor of this.#processors) {
    // //   await processor.load(this.#dirs);
    // // }

    // this.#dirs.src.prepare(
    //   this.#isConfigModified,
    //   getConfig().dist,
    //   this.#report,
    //   {
    //     oldDist: this.#dirs.base.dist,
    //   },
    // );

    // for (let processor of this.#processors) {
    //   await processor.prepare(this.#dirs);
    // }

    getLogger().log(`Files: ${JSON.stringify(this.#dirs.serialize())}`, 10);
    getLogger().logLevelDown().log("Initializing files finished");
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

  async #process() {
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

export default Builder;
