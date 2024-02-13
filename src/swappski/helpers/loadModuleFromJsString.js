import path from "path";

export async function loadModuleFromJsString(content) {
  const { default: module } = await import(`data:text/javascript,${content}`);
  return module;
}

export default loadModuleFromJsString;
