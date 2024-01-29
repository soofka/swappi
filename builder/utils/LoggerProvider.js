import { decorateWithSingleton } from './decorateWithSingleton.js';

class LoggerProvider {

    #verbosity;
    #prefix = '-';

    constructor(verbosity) {
        this.#verbosity = verbosity;
    }

    log(verbosity, ...messageArgs) {
        this.#log(verbosity, 'log', messageArgs);
    }

    warn(verbosity, ...messageArgs) {
        this.#log(verbosity, 'warn', messageArgs);
    }

    error(verbosity, ...messageArgs) {
        this.#log(verbosity, 'error', messageArgs);
    }

    #log(verbosity, method, messageArgs) {
        if (verbosity <= this.#verbosity) {
            messageArgs[0] = `${this.#prefix.repeat(verbosity)}${messageArgs[0]}`;
            console[method](...messageArgs);
        }
    }

}

const { init: initLoggerProvider, get: getLogger } = decorateWithSingleton(LoggerProvider);
export { initLoggerProvider, getLogger };
export default getLogger;
