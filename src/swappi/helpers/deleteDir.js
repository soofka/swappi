import fs from "fs/promises";

export async function deleteDir(
  absPath,
  options = { recursive: true, maxRetries: 3 },
) {
  return await fs.rm(absPath, options);
}

export default deleteDir;
