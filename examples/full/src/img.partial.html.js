const img = (data, dists, htmlElement) => {
  let picture = "<picture";
  // for (let key of Object.keys(htmlElement.attribs)) {
  //   if (key !== "name" && key !== "src") {
  //     picture += ` ${key}="${htmlElement.attr(key)}"`;
  //   }
  // }
  // picture += ">";

  // const valueArray = [];
  // const srcArray = htmlElement.attr("src").split(".");
  // const imgName = srcArray[0];
  // const imgExt = srcArray[1];
  // const imgFile = files.find(
  //   (element) => element.src.name === imgName && element.src.ext === imgExt,
  // );

  // if (imgFile) {
  //   for (let dist of imgFile.dists) {
  //     // figure out values for w
  //     // figure out types???
  //     valueArray.push(`${dist.full} 400w`);
  //   }
  //   picture += `<source srcet="${valueArray.join(",")}" type="image/dupa">`;
  // }

  return picture + "</picture>";
};

export default img;
