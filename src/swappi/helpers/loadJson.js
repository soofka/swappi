import loadFile from "./loadFile.js";
import parseJson from "./parseJson.js";

export async function loadJson(absPath) {
  const json = await loadFile(absPath);
  if (json) {
    return parseJson(json);
  }
  return json;
}

export default loadJson;
