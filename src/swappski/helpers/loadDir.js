import fs from "fs/promises";
import createDir from "./createDir.js";

export async function loadDir(absPath, options = { withFileTypes: true }) {
  try {
    return await fs.readdir(absPath, options);
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw e;
    }
    await createDir(absPath);
    return await fs.readdir(absPath, options);
  }
}

export default loadDir;
