import fs from "fs/promises";

export async function createDir(absPath, options = { recursive: true }) {
  const dir = await fs.mkdir(absPath, options);
  return dir;
}

export default createDir;
