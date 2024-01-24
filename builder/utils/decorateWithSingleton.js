export function decorateWithSingleton(className) {
    let instance;
    const init = (...args) => instance = new className(...args);
    const get = (...args) => {
        if (!instance) {
            instance = new className(...args);
        }
        return instance;
    }
    return { init, get };
}

export default decorateWithSingleton;
