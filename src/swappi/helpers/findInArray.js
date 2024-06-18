export function findInArray(array, searchFunction) {
  return array && Array.isArray(array) && array.find(searchFunction);
}

export default findInArray;
