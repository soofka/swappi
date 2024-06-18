export async function loadModuleFromJsString(content) {
  const { default: module } = await import(
    `data:text/javascript,${encodeURIComponent(content)}`
  );
  return module;
}

export default loadModuleFromJsString;
