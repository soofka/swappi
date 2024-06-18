import fs from "fs/promises";

export async function loadFile(absPath, options = {}) {
  return await fs.readFile(absPath, options);
}

export default loadFile;
