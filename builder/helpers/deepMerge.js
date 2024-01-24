import isObject from './isObject.js';

export function deepMerge(target, source) { 
    if (!isObject(target) || !isObject(source)) {
        return source;
    }

    for (let key of Object.keys(source)) {
        const targetValue = target[key];
        const sourceValue = source[key];

        target[key] = isObject(targetValue) && isObject(sourceValue)
            ? deepMerge(Object.assign({}, targetValue), sourceValue)
            : sourceValue;
    }

    return target;
}

export default deepMerge;
