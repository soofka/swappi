const img = (data, dists, { src, alt = "", withCaption = false }) => {
  const imgName = src.split(".")[0];
  const imgDists = dists.filter(
    (element) =>
      element.name === imgName ||
      element.name.substring(0, imgName.length + 1) === `${imgName}-`,
  );

  let imgDist;
  const srcSetDists = [];
  for (let dist of imgDists) {
    const nameArray = dist.name.split("-");
    const distObj = { dist };
    if (nameArray.length > 1) {
      const dimensions = nameArray[1].split("x");
      distObj.width = parseInt(dimensions[0]);
      distObj.height = parseInt(dimensions[1]);

      if (!imgDist || imgDist.width < distObj.width) {
        if (imgDist) {
          srcSetDists.push(imgDist);
        }
        imgDist = distObj;
      } else {
        srcSetDists.push(distObj);
      }
    }
  }

  const picture = `<picture>
      ${srcSetDists.map(({ dist, width }) => `<source srcset="${dist.rel} ${width}w" type="image/${dist.ext.substring(1)}">`).join("")}
      ${imgDist && `<img src="${imgDist.dist.rel}" alt="${alt}" width="${imgDist.width}" height="${imgDist.height}">`}
    </picture>`;

  return withCaption
    ? `<figure>${picture}<figcaption>${alt}</figcaption></figure>`
    : picture;
};

export default img;
