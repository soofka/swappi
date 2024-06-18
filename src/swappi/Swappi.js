import Builder from "./builder/index.js";
import Generator from "./generator/index.js";
import Server from "./server/index.js";
// import Tester from "./tester/index.js";
import Watcher from "./watcher/index.js";
import { initConfigProvider, initLoggerProvider } from "./utils/index.js";

class Swappi {
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
  // #tester;
  // get tester() {
  //   return this.#tester;
  // }
  #watcher;
  get watcher() {
    return this.#watcher;
  }

  init(config = {}) {
    initConfigProvider(config);
    initLoggerProvider();

    this.#builder = new Builder();
    this.#generator = new Generator();
    this.#server = new Server();
    // this.#tester = new Tester();
    this.#watcher = new Watcher(this.#builder);

    return this;
  }
}

const swappi = new Swappi();
const SwappiBuilder = swappi.builder;
const SwappiGenerator = swappi.generator;
const SwappiServer = swappi.server;
// const SwappiTester = swappi.tester;
const SwappiWatcher = swappi.watcher;

export {
  swappi as Swappi,
  SwappiBuilder,
  SwappiGenerator,
  SwappiServer,
  // SwappiTester,
  SwappiWatcher,
};

export default swappi;
