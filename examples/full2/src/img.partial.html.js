const img = (data, dists, { src, alt = "" }) => {
  let picture = "<picture>";
  const imgName = src.split(".")[0];
  const imgDists = dists.filter(
    (element) =>
      element.name === imgName ||
      element.name.substring(0, imgName.length + 1) === `${imgName}-`,
  );
  let imgString = "";
  for (let index in imgDists) {
    const dist = imgDists[index];
    const nameArray = dist.name.split("-");
    console.log("img partial", nameArray, dist.ext);
    if (
      nameArray.length < 2 ||
      (nameArray[1] === "1280" && dist.ext === ".jpg")
    ) {
      imgString = `<img src="/${dist.full}" alt="${alt}">`;
    } else {
      picture += `<source srcset="/${dist.full} ${nameArray[1]}w" type="image/${dist.ext.substring(1)}">`;
    }
  }

  return picture + imgString + "</picture>";
};

export default img;
