import path from "path";
import { getConfig } from "../utils/index.js";

export function getDirentObject(...absPathElements) {
  const obj = path.parse(
    path.join(
      ...absPathElements.filter((element) => typeof element === "string"),
    ),
  );
  const hashSeparatorIndex = obj.name.lastIndexOf(
    getConfig().constants.hashSeparator,
  );
  if (hashSeparatorIndex >= 0) {
    obj.hash = obj.name.substring(hashSeparatorIndex + 1);
    obj.name = obj.name.substring(0, hashSeparatorIndex);
  } else {
    obj.hash = "";
  }
  return obj;
}

export default getDirentObject;
