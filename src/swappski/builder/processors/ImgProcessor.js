import sharp from "sharp";
import Processor from "./Processor.js";
import { isFunction, isImage, isInObject } from "../../helpers/index.js";

export class ImgProcessor extends Processor {
  constructor(options) {
    super(options, {
      test: (direntData) => isImage(direntData),
      getVariants: (src) => {
        if (src.name === "icon") {
          return [
            [16, "png"],
            [32, "png"],
            [48, "ico", "favicon"],
            [76, "png"],
            [120, "png"],
            [152, "png"],
            [192, "png"],
            [512, "png"],
          ];
        } else {
          const variants = [];
          for (let width of [320, 640, 1280]) {
            for (let type of ["avif", "webp", "jpg"]) {
              variants.push([width, type]);
            }
          }
          return variants;
        }
      },
    });
  }

  async prepareFile(file) {
    const ogDist = file.dists[0].clone();
    const { width: ogWidth, height: ogHeight } = await sharp(
      Buffer.from(ogDist.content),
    ).metadata();
    const aspectRatio = ogHeight / ogWidth;

    const newDists = [];
    for (let [width, type, name] of this.options.getVariants(file.src)) {
      const newDist = ogDist.clone();
      const dimensions = `${width}x${Math.round(width * aspectRatio)}`;
      newDist.name = name || `${newDist.name}-${dimensions}`;
      newDist.ext = `.${type}`;
      newDists.push(newDist);
    }
    file.dists = newDists;
    return file;
  }

  async process(dist) {
    let width;
    let height;
    const nameArray = dist.name.split("-");
    if (nameArray.length > 1) {
      [width, height] = nameArray[1].split("x").map((e) => parseInt(e));
    }
    const type = dist.ext.substring(1);
    const isValidWidth = !isNaN(width);
    const isValidType = isInObject(sharp, type) && isFunction(sharp[type]);

    if (isValidWidth || isValidType) {
      let image = sharp(Buffer.from(dist.content));
      if (isValidWidth) {
        image = image.resize(width);
      }
      if (isValidType) {
        image = image[type]();
      }
      dist.content = await image.toBuffer();
    }

    return dist;
  }
}

export default ImgProcessor;
