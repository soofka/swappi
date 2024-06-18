export function parseJson(json, silent = true) {
  try {
    return JSON.parse(json);
  } catch (e) {
    if (!silent) {
      throw e;
    }
  }
}

export default parseJson;
