import isObject from "./isObject.js";

export function isInObject(object, key, value) {
  if (isObject(object) && Object.hasOwn(object, key)) {
    return value !== undefined ? object[key] === value : true;
  }
  return false;
}

export default isInObject;
