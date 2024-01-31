import path from "path";

export function getDirentObject(...absPathElements) {
  return path.parse(path.join(...absPathElements));
}

export default getDirentObject;
