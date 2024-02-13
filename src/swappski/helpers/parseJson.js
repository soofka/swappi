import tryCatch from "./tryCatch.js";
import { getLogger } from "../utils/index.js";

export function parseJson(json) {
  return tryCatch(
    () => JSON.parse(json),
    (e) =>
      getLogger().warn(
        `Failed to parse JSON ${json} (${e.name}: ${e.message})`,
      ),
  );
}

export default parseJson;
