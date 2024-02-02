import path from "path";
import { getConfig } from "../utils/index.js";

export function getDirentObject(...absPathElements) {
  const obj = path.parse(
    path.join(
      ...absPathElements.filter((element) => typeof element === "string"),
    ),
  );
  obj.dupatest = obj.name.lastIndexOf(getConfig().constants.hashSeparator);
  if (obj.dupatest >= 0) {
    obj.hash = obj.name.substring(obj.dupatest + 1);
    obj.name = obj.name.substring(0, obj.dupatest);
  } else {
    obj.hash = "";
  }
  return obj;
}

export default getDirentObject;
