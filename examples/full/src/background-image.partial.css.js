const backgroundImage = (data, files, cssDeclaration) => {
  const valueArray = [];
  const fileArray = cssDeclaration.value.substring(1).split(":")[1].split(".");
  const fileName = fileArray[0];
  const fileExt = fileArray[1];
  const imgFile = files.find(
    (element) => element.src.name === fileName && element.src.ext === fileExt,
  );

  if (imgFile) {
    for (let distIndex in imgFile.dists) {
      const dist = imgFile.dists[distIndex];
      // figure out values for x
      valueArray.push(
        `url("${dist.full}") type("image/${dist.ext.substring(1)}") ${parseInt(distIndex) + 1}x`,
      );
    }
  }

  cssDeclaration.property = "background-image";
  cssDeclaration.value = `image-setasd(${valueArray.join(",")})`;
  return cssDeclaration;
};

export default backgroundImage;
