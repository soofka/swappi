import { performance } from "perf_hooks";
import Builder from "./builder/index.js";
import Generator from "./generator/index.js";
import Server from "./server/index.js";
import Tester from "./tester/index.js";
import Watcher from "./watcher/index.js";

import {
  initConfigProvider,
  getConfig,
  initLoggerProvider,
  getLogger,
} from "./utils/index.js";

export class Swappski {
  #builder;
  get builder() {
    return this.#builder;
  }
  #generator;
  get generator() {
    return this.#generator;
  }
  #server;
  get server() {
    return this.#server;
  }
  #tester;
  get tester() {
    return this.#tester;
  }
  #watcher;
  get watcher() {
    return this.#watcher;
  }

  constructor(config) {
    return this.init(config);
  }
  init(config) {
    initConfigProvider(config);
    initLoggerProvider(getConfig().options.verbosity);
    getLogger().log("Swappski initialized").logLevelUp();
    return this;
  }
  async initBuilder() {
    this.#builder = new Builder();
    return this.#builder;
  }
  async build() {
    const startTime = performance.now();
    getLogger().log("Swappski builder starting").logLevelUp();

    if (!this.#builder) {
      this.initBuilder();
    }
    const result = await this.#builder.build();

    const endTime = performance.now();
    getLogger()
      .logLevelDown()
      .log(`Swappski builder finished in ${startTime - endTime}ms`);

    return result;
  }
  async initGenerator(targetPath) {
    this.#generator = new Generator(targetPath);
    return this.#generator;
  }
  async generate(targetPath, template = "basic") {
    const startTime = performance.now();
    getLogger().log("Swappski generator starting").logLevelUp();

    if (targetPath && !this.#builder) {
      this.initGenerator(targetPath);
    }
    const result = await this.#builder.generate(template);

    const endTime = performance.now();
    getLogger()
      .logLevelDown()
      .log(`Swappski generator finished in ${startTime - endTime}ms`);

    return result;
  }
  async initServer() {
    this.#server = new Server();
    return this.#server;
  }
  async serve() {
    const startTime = performance.now();
    getLogger().log("Swappski server starting").logLevelUp();

    if (!this.#server) {
      this.initServer();
    }
    const result = await this.#server.serve();

    const endTime = performance.now();
    getLogger()
      .logLevelDown()
      .log(`Swappski server finished after ${startTime - endTime}ms`);

    return result;
  }
  async initTester() {
    this.#tester = new Tester();
    return this.#tester;
  }
  async test() {
    const startTime = performance.now();
    getLogger().log("Swappski tester starting").logLevelUp();

    if (!this.#tester) {
      this.initTester();
    }
    const result = await this.#tester.test();

    const endTime = performance.now();
    getLogger()
      .logLevelDown()
      .log(`Swappski tester finished in ${startTime - endTime}ms`);

    return result;
  }
  async initWatcher() {
    this.#watcher = new Watcher();
    return this.#watcher;
  }
  async watch() {
    const startTime = performance.now();
    getLogger().log("Swappski watcher starting").logLevelUp();

    if (!this.#watcher) {
      this.initWatcher(config);
    }
    const result = await this.#watcher.watch();

    const endTime = performance.now();
    getLogger()
      .logLevelDown()
      .log(`Swappski watcher finished after ${startTime - endTime}ms`);
  }
  // async run(config) {
  //   if (!this.#server) {
  //     this.#server = express();
  //     this.#server.use(express.static(config.paths.public.dist));
  //     this.#server.listen(config.options.port, () =>
  //       console.log(`Swapp served on port ${config.options.port}`),
  //     );
  //   }
  // }
}

export default Swappski;