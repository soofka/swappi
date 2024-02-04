import isObject from "./isObject.js";

export function deepClone(source) {
  let result = source;
  if (Array.isArray(source)) {
    result = [];
    for (let element of source) {
      result.push(deepClone(element));
    }
  } else if (isObject(source)) {
    result = {};
    for (let key of Object.keys(source)) {
      result[key] = deepClone(source[key]);
    }
  }
  return result;
}

export default deepClone;
