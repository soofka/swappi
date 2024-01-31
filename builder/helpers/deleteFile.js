import fs from "fs/promises";

export async function deleteFile(absPath, options = { force: true }) {
  await fs.rm(absPath, options);
}

export default deleteFile;
