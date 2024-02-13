import { helpers } from "../../../dist/index.js"; //fix this

const backgroundImage = (cssDeclaration, data, rootDirectory) => {
  const valueArray = [];
  const { name, ext } = helpers.getDirentObject(
    cssDeclaration.value.split(":")[1],
  );
  const imgFile = helpers.findInArray(
    rootDirectory.allFiles,
    (element) => element.src.name === name && element.src.ext === ext,
  );

  if (imgFile) {
    for (let distIndex in file.dists) {
      const dist = file.dists[distIndex];
      // figure out values for x
      valueArray.push(
        `url("${dist.full}") type("image/${dist.ext.substring(1)}") ${parseInt(distIndex) + 1}x`,
      );
    }
  }

  cssDeclaration.property = "background-image";
  cssDeclaration.value = `image-set(${valueArray.join(",")})`;
  return cssDeclaration;
};

export default backgroundImage;
