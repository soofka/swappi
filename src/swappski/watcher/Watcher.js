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

  close() {
    getLogger().logLevelDown().log("Terminating watcher");

    clearTimeout(this.#processEventsTimeout);
    this.#abortController.abort();

    getLogger().log("Watcher terminated");
  }

  async #build() {
    try {
      await this.#builder.build();
    } catch (e) {
      getLogger().error(e);
    }
  }

  async #processEvents() {
    getLogger().log("Processing watcher events");
    await this.#build();
    this.#events = [];
  }
}

export default Watcher;
