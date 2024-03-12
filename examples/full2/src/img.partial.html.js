const img = (data, dists, partialData) => {
  let picture = "<picture>";
  // for (let key of Object.keys(htmlElement.attr)) {
  //   if (key !== "name" && key !== "src") {
  //     picture += ` ${key}="${htmlElement.attr(key)}"`;
  //   }
  // }
  // picture += ">";

  const valueArray = [];
  const imgName = partialData.src.split(".")[0];
  const imgDists = dists.filter((element) => element.name === imgName);
  for (let dist of imgDists) {
    valueArray.push(`${dist.full} 400w`);
  }
  picture += `<source srcet="${valueArray.join(",")}" type="image/dupa">`;

  return picture + "</picture>";
};

export default img;
