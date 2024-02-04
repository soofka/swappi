import fs from "fs/promises";

export async function deleteFile(absPath, options = { force: true }) {
  return await fs.rm(absPath, options);
}

export default deleteFile;
