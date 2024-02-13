import fs from "fs/promises";
import tryCatch from "./tryCatch.js";
import { getLogger } from "../utils/index.js";

export function loadFile(absPath, options = "utf8") {
  return tryCatch(
    async () => await fs.readFile(absPath, options),
    (e) =>
      getLogger().warn(
        `Failed to load file ${absPath} (${e.name}: ${e.message})`,
      ),
    (e) => e.code !== "ENOENT",
  );
}

export default loadFile;
