import isObject from "./isObject.js";

export function isInObject(object, key) {
  return isObject(object) && Object.hasOwn(object, key);
}

export default isInObject;
