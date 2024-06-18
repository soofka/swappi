import isObject from "./isObject.js";

export const ArrayStrategies = {
  OVERWRITE: "overwrite",
  CONCAT: "concat",
  MERGE: "merge",
};

export function deepMerge(
  target,
  source,
  arrayStrategy = ArrayStrategies.OVERWRITE,
) {
  if (Array.isArray(target) && Array.isArray(source)) {
    if (arrayStrategy === ArrayStrategies.CONCAT) {
      return [...target, ...source];
    } else if (arrayStrategy === ArrayStrategies.MERGE) {
      for (let index in source) {
        target[index] = deepMerge(target[index], source[index], arrayStrategy);
      }
      return target;
    }
    return source;
  } else if (isObject(target) && isObject(source)) {
    for (let key in source) {
      target[key] = deepMerge(target[key], source[key], arrayStrategy);
    }
    return target;
  }
  return source;
}

export default deepMerge;
