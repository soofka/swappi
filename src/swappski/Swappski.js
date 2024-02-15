import { performance } from "perf_hooks";
import Builder from "./builder/index.js";
import Generator from "./generator/index.js";
import Server from "./server/index.js";
import Tester from "./tester/index.js";
import Watcher from "./watcher/index.js";
import { initConfigProvider, initLoggerProvider } from "./utils/index.js";

class Swappski {
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

  init(config = {}) {
    initConfigProvider(config);
    initLoggerProvider(config.verbosity, config.logFile);

    this.#builder = new Builder();
    this.#generator = new Generator();
    this.#server = new Server();
    this.#tester = new Tester();
    this.#watcher = new Watcher(this.#builder);

    return this;
  }
}

const swappski = new Swappski();
const SwappskiBuilder = swappski.builder;
const SwappskiGenerator = swappski.generator;
const SwappskiServer = swappski.server;
const SwappskiTester = swappski.tester;
const SwappskiWatcher = swappski.watcher;

export {
  swappski as Swappski,
  SwappskiBuilder,
  SwappskiGenerator,
  SwappskiServer,
  SwappskiTester,
  SwappskiWatcher,
};

export default swappski;
