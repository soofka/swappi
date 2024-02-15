import fs from "fs/promises";
import { getConfig, getLogger } from "../utils/index.js";

export class Watcher {
  #builder;
  #abortController;
  #events = [];
  #processEventsTimeout;

  constructor(builder) {
    this.#builder = builder;
    this.#abortController = new AbortController();
  }

  async watch() {
    getLogger()
      .log(`Starting watcher on directory ${getConfig().src}`)
      .logLevelUp();
    try {
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
          () => this.#processEvents(),
          200,
        );
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        throw e;
      }
    }

    process.on("SIGTERM", () => this.close());
    process.on("SIGINT", () => this.close());
  }

  #processEvents() {
    getLogger().log("Processing watcher events");
    this.#builder.build();
    this.#events = [];
  }

  close() {
    getLogger().logLevelDown().log("Terminating watcher");
    this.#abortController.abort();
  }
}

export default Watcher;
