import fs from "fs/promises";
import createDir from "./createDir.js";
import tryCatch from "./tryCatch.js";
import { getLogger } from "../utils/index.js";

export function loadDir(absPath, options = { withFileTypes: true }) {
  const loadDirFunction = async () => await fs.readdir(absPath, options);
  return tryCatch(
    loadDirFunction,
    async (e) => {
      getLogger().warn(
        8,
        `Failed to load dir ${absPath}, attempting to create missing directories and load again (${e.name}: ${e.message})`,
      );
      await createDir(absPath);
      return await loadDirFunction();
    },
    (e) => e.code !== "ENOENT",
  );
}

export default loadDir;
