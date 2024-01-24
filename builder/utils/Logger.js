import { decorateWithSingleton } from './decorateWithSingleton.js';

class Logger {

    #verbosity;

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
            console[method](...messageArgs);
        }
    }

}

const { init: initLogger, get: getLogger } = decorateWithSingleton(Logger);
export { initLogger, getLogger };
export default getLogger;
