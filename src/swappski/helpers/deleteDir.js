import fs from "fs/promises";

export async function deleteDir(absPath, options = {}) {
  return await fs.rmdir(absPath, options);
}

export default deleteDir;
