import decorateWithSingleton from "./decorateWithSingleton.js";

class LoggerProvider {
  #verbosity;
  #logLevel = 1;
  #prefix = "-";

  constructor(verbosity) {
    this.#verbosity = verbosity;
  }

  log(message, logLevel) {
    this.#console("log", message, logLevel);
    return this;
  }

  warn(message, logLevel) {
    this.#console("warn", message, logLevel);
    return this;
  }

  error(message, logLevel) {
    this.#console("error", message, logLevel);
    return this;
  }

  logLevelUp() {
    this.#logLevel++;
    return this;
  }

  logLevelDown() {
    this.#logLevel--;
    return this;
  }

  #console(method, text, logLevel = this.#logLevel, withPrefix = true) {
    if (logLevel <= this.#verbosity) {
      if (logLevel === 10 && withPrefix) {
        console[method](this.#prefix.repeat(10));
      }
      console[method](
        logLevel < 10 && withPrefix
          ? `${method.toUpperCase()}\t${this.#prefix.repeat(verbosity)}${text}`
          : text,
      );
      if (logLevel === 10 && withPrefix) {
        console[method](this.#prefix.repeat(10));
      }
    }
  }
}

const { init: initLoggerProvider, get: getLogger } =
  decorateWithSingleton(LoggerProvider);
export { initLoggerProvider, getLogger };
export default getLogger;
