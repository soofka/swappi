import path from "path";
import { getConfig } from "../utils/index.js";

export function getDirentObject(...absPathElements) {
  const obj = path.parse(
    path.join(
      ...absPathElements.filter((element) => typeof element === "string"),
    ),
  );

  obj.contentHash = "";
  const hashSeparatorIndex = obj.name.lastIndexOf(
    getConfig().hashOptions.separator,
  );
  if (hashSeparatorIndex >= 0) {
    obj.contentHash = obj.name.substring(hashSeparatorIndex + 1);
    obj.name = obj.name.substring(0, hashSeparatorIndex);
  }

  return obj;
}

export default getDirentObject;
