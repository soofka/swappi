import fs from "fs/promises";
import readline from "readline/promises";
import { stdin, stdout } from "process";
import { getConfig, getLogger } from "../utils/index.js";

export class Watcher {
  #builder;
  #readline;
  #abortController;
  #events = [];
  #processEventsTimeout;

  constructor(builder) {
    this.#builder = builder;
  }

  async init() {
    await this.#builder.init();
    await this.#build();
    return this;
  }

  async watch() {
    getLogger()
      .log(`Starting watcher on directory ${getConfig().src}`)
      .logLevelUp();
    try {
      this.#readline = readline.createInterface({
        input: stdin,
        output: stdout,
      });
      this.#abortController = new AbortController();
      this.#readline.on("line", (line) => {
        switch (line.toLowerCase()) {
          case "r":
            getLogger().log("Rebuilding on demand");
            this.#build();
            break;

          case "exit":
            getLogger().log("Terminating");
            process.exit(1);
            break;

          default:
            getLogger().log(`Unrecognized command: ${line}`);
            break;
        }
      });

      const watcher = fs.watch(getConfig().src, {
        signal: this.#abortController.signal,
      });
      for await (let event of watcher) {
        getLogger().log(
          `Watcher detected event: ${event.eventType} ${event.filename}"`,
        );
        this.#events.push(event);

        clearTimeout(this.#processEventsTimeout);
        this.#processEventsTimeout = setTimeout(
          async () => await this.#processEvents(),
          200,
        );
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        throw e;
      }
    }
  }

  async #processEvents() {
    getLogger().log("Processing watcher events");
    await this.#build();
    this.#events = [];
  }

  async #build() {
    try {
      await this.#builder.build();
    } catch (e) {
      getLogger().error(e);
    }
  }

  close() {
    getLogger().logLevelDown().log("Terminating watcher");

    clearTimeout(this.#processEventsTimeout);
    if (this.#readline) {
      this.#readline.close();
    }
    if (this.#abortController) {
      this.#abortController.abort();
    }

    getLogger().log("Watcher terminated");
  }
}

export default Watcher;
