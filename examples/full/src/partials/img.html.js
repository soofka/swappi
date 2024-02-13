import { helpers } from "../../../dist/index.js"; //fix this

const img = (htmlElement, data, rootDirectory) => {
  let picture = "<picture";
  // for (let key of Object.keys(htmlElement.attribs)) {
  //   if (key !== "name" && key !== "src") {
  //     picture += ` ${key}="${htmlElement.attr(key)}"`;
  //   }
  // }
  picture += ">";

  const valueArray = [];
  const { name, ext } = helpers.getDirentObject(htmlElement.attr("src"));
  const imgFile = helpers.findInArray(
    rootDirectory.allFiles,
    (element) => element.src.name === name && element.src.ext === ext,
  );

  if (imgFile) {
    for (let dist of imgFile.dists) {
      // figure out values for w
      // figure out types???
      valueArray.push(`${dist.full} 400w`);
    }
    picture += `<source srcet="${valueArray.join(",")}" type="image/dupa">`;
  }

  return picture + "</picture>";
};

export default img;
