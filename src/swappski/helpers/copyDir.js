import fs from "fs/promises";

export async function copyDir(
  srcAbsPath,
  distAbsPath,
  options = { force: true, recursive: true },
) {
  return await fs.cp(srcAbsPath, distAbsPath, options);
}

export default copyDir;
