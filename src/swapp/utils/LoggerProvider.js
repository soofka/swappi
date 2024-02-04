import decorateWithSingleton from "./decorateWithSingleton.js";

class LoggerProvider {
  #verbosity;
  #prefix = "-";

  constructor(verbosity) {
    this.#verbosity = verbosity;
  }

  log(verbosity, message) {
    this.#console(verbosity, "log", message);
  }

  warn(verbosity, message) {
    this.#console(verbosity, "warn", message);
  }

  error(verbosity, message) {
    this.#console(verbosity, "error", message);
  }

  #console(verbosity, method, text, withPrefix = true) {
    if (verbosity <= this.#verbosity) {
      console[method](
        withPrefix
          ? `${method.toUpperCase()}\t${this.#prefix.repeat(verbosity)}${text}`
          : text,
      );
    }
  }
}

const { init: initLoggerProvider, get: getLogger } =
  decorateWithSingleton(LoggerProvider);
export { initLoggerProvider, getLogger };
export default getLogger;
