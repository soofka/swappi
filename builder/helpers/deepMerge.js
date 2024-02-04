import isObject from "./isObject.js";

export function deepMerge(target, source) {
  if (Array.isArray(target) && Array.isArray(source)) {
    for (let index in source) {
      target[index] = deepMerge(target[index], source[index]);
    }
    return target;
  } else if (isObject(target) && isObject(source)) {
    for (let key of Object.keys(source)) {
      target[key] = deepMerge(target[key], source[key]);
    }
    return target;
  }
  return source;
}

// export function deepMerge(target, source) {
//   if (!isObject(target) || !isObject(source)) {
//     return source;
//   }

//   for (let key of Object.keys(source)) {
//     const targetValue = target[key];
//     const sourceValue = source[key];

//     target[key] =
//       isObject(targetValue) && isObject(sourceValue)
//         ? deepMerge(Object.assign({}, targetValue), sourceValue)
//         : sourceValue;
//   }

//   return target;
// }

export default deepMerge;
