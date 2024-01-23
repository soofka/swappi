export class Logger {

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

export default Logger;
