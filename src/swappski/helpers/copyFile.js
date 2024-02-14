import fs from "fs/promises";

export async function copyFile(srcAbsPath, distAbsPath) {
  return await fs.copyFile(srcAbsPath, distAbsPath);
}

export default copyFile;
