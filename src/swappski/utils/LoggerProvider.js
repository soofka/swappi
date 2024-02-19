import decorateWithSingleton from "./decorateWithSingleton.js";
import { isArray } from "../helpers/index.js";
import { getConfig } from "./ConfigProvider.js";

class LoggerProvider {
  #verbosity = 3;
  #logFile = "";
  #logLevel = 0;
  #prefix = "-";

  #logs = [];
  get logs() {
    return this.#logs;
  }

  constructor() {
    this.#verbosity = getConfig().verbosity || 3;
    this.#logFile = getConfig().logFile || "";
  }

  log(log, logLevel) {
    this.#console("log", log, logLevel);
    return this;
  }

  warn(log, logLevel) {
    this.#console("warn", log, logLevel);
    return this;
  }

  error(log, logLevel) {
    this.#console(
      "error",
      log.stack.split("\n").map((line) => line.trim()),
      logLevel,
    );
    return this;
  }

  table(data, columns) {
    console.table(data, columns);
    return this;
  }

  logLevelUp() {
    this.#logLevel++;
    return this;
  }

  logLevelDown() {
    this.#logLevel = this.#logLevel > 0 ? this.#logLevel - 1 : this.#logLevel;
    return this;
  }

  #console(method, logText, logLevel = this.#logLevel) {
    if (logLevel <= this.#verbosity) {
      console[method](this.#getLog(method, logText, logLevel));
    }
    if (this.#logFile !== "") {
      this.#logs.push(this.#getLog(method, logText, logLevel, true));
    }
  }

  #getLog(method, logText, logLevel, withDate = false) {
    let lineStart = `${method.toUpperCase()}${" ".repeat(6 - method.length)}${this.#prefix.repeat(logLevel)}> `;
    if (withDate) {
      const now = new Date().toISOString();
      lineStart = `${now} ${lineStart}`;
    }
    return `${lineStart}${
      isArray(logText)
        ? logText
            .map((line, index) =>
              index === 0 ? line : `${" ".repeat(lineStart.length)}${line}`,
            )
            .join("\r\n")
        : logText
    }`;
  }
}

const { init: initLoggerProvider, get: getLogger } =
  decorateWithSingleton(LoggerProvider);
export { initLoggerProvider, getLogger };
export default getLogger;
