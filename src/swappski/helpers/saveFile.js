import fs from "fs/promises";
import createDir from "./createDir.js";
import getDirentObject from "./getDirentObject.js";

export async function saveFile(absPath, content) {
  // console.log("saving", absPath, content);
  try {
    return await fs.writeFile(absPath, content);
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw e;
    }
    await createDir(getDirentObject(absPath).dir);
    return await fs.writeFile(absPath, content);
  }
}

export default saveFile;
