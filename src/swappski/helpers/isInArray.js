export function isInArray(array, searchFunction) {
  return array && Array.isArray(array) && array.some(searchFunction);
}

export default isInArray;
