import fs from "fs/promises";

export async function copyDir(
  srcAbsPath,
  distAbsPath,
  options = { force: true, recursive: true },
) {
  console.log("copyDir", srcAbsPath, distAbsPath, options);
  return await fs.cp(srcAbsPath, distAbsPath, options);
}

export default copyDir;
