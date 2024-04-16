import loadDir from "./loadDir.js";

export async function findInDir(dirAbsPath, searchFunction) {
  return (await loadDir(dirAbsPath)).find(searchFunction);
}

export default findInDir;
