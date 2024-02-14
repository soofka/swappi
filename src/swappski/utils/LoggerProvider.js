import decorateWithSingleton from "./decorateWithSingleton.js";

class LoggerProvider {
  #verbosity = 3;
  #logFile = "";
  #logLevel = 0;
  #prefix = "-";

  #logs = [];
  get logs() {
    return this.#logs;
  }

  constructor(verbosity = 3, logFile = "") {
    this.#verbosity = verbosity;
    this.#logFile = logFile;
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
    const isMegaLog = logLevel >= 10 && withPrefix;
    const standardText = `${method.toUpperCase()}\t${this.#prefix.repeat(logLevel)}> ${text}`;
    let fullText = "";
    fullText += isMegaLog ? `${this.#prefix.repeat(10)}\r\n` : "";
    fullText += isMegaLog ? text : standardText;
    fullText += isMegaLog ? `\r\n${this.#prefix.repeat(10)}` : "";
    if (logLevel <= this.#verbosity) {
      console[method](fullText);
    }
    if (this.#logFile !== "") {
      this.#logs.push(`${Date.now()}: ${standardText}`);
    }
  }
}

const { init: initLoggerProvider, get: getLogger } =
  decorateWithSingleton(LoggerProvider);
export { initLoggerProvider, getLogger };
export default getLogger;
