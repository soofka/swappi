const img = (data, dists, { src }) => {
  let picture = "<picture>";
  const imgName = src.split(".")[0];
  const imgDists = dists.filter(
    (element) => element.name.substring(0, imgName.length) === imgName,
  );
  for (let index in imgDists) {
    const dist = imgDists[index];
    const nameArray = dist.name.split("-");
    if (nameArray.length > 1) {
      picture += `<source srcset="/${dist.full} ${nameArray[1]}w" type="image/${dist.ext.substring(1)}">`;
    } else {
      picture += `<img src="/${dist.full}">`;
    }
  }

  return picture + "</picture>";
};

export default img;
