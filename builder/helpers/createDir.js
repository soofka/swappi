import fs from "fs/promises";

export async function createDir(absPath, options = { recursive: true }) {
  console.log("CREATING DIR", absPath);
  return await fs.mkdir(absPath, options);
}

export default createDir;
