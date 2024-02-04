import fs from "fs/promises";

export async function createDir(absPath, options = { recursive: true }) {
  return await fs.mkdir(absPath, options);
}

export default createDir;
