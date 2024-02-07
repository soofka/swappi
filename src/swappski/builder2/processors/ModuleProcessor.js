export class ModuleProcessor extends Processor {
  async prepareFile(file) {
    const nameArray = file.src.name.split(".");
    if (nameArray.length > 0) {
      let name;
      let ext = "";

      if (nameArray.length === 1) {
        name = nameArray[0];
      } else {
        name = nameArray.slice(0, nameArray.length - 1).join(".");
        ext = `.${nameArray[nameArray.length - 1]}`;
      }

      // make it load from memory
      file.content = await loadModule(file.src.abs);
      if (isFunction(file.content)) {
        file.dist[0].name = name;
        file.dist[0].ext = ext;
      } else if (isObject(file.content)) {
        if (isInObject(file.content, "generate")) {
          file.dist = file.content.generate(getConfig().data);
        } else {
          file.dist = Object.keys(file.content)
            .filter((key) => key !== "render")
            .map((key) => {
              const newDist = file.dist[0].clone();
              newDist.name = `${name}${key}`;
              newDist.ext = ext;
              return newDist;
            });
        }
      }
    }
    return file;
  }
}
