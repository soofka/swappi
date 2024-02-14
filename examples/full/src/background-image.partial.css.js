const backgroundImage = (cssDeclaration, data, rootDirectory) => {
  const valueArray = [];
  const fileArray = cssDeclaration.value.split(":")[1].split(".");
  const fileName = fileArray[0];
  const fileExt = fileArray[1];
  const imgFile = rootDirectory.allFiles.find(
    (element) => element.src.name === fileName && element.src.ext === fileExt,
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