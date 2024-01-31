import path from "path";

export async function loadModule(absPath) {
  const { default: module } = await import(path.join("file:///", absPath));
  return module;
}

export default loadModule;
