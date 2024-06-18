import path from "path";

export async function loadModuleFromFile(absPath) {
  const { default: module } = await import(path.join("file:///", absPath));
  return module;
}

export default loadModuleFromFile;
