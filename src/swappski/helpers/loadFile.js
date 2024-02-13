import fs from "fs/promises";

export async function loadFile(absPath, options = "utf8") {
  return await fs.readFile(absPath, options);
}

export default loadFile;
