import sharp from "sharp";
import Processor from "./Processor.js";
import { isFunction, isImage, isInObject } from "../../helpers/index.js";

export class ImgProcessor extends Processor {
  #variants = [];

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
    const newDists = [];
    if (this.options.keepOriginal) {
      newDists.push(file.dists[0]);
      this.#variants.push({});
    }
    for (let [width, type, name] of this.options.getVariants(file.src)) {
      const newDist = file.dists[0].clone();
      newDist.name = name || `${newDist.name}-${width}`;
      newDist.ext = `.${type}`;
      newDists.push(newDist);
      this.#variants.push({ width, type });
    }
    file.dists = newDists;
    return file;
  }

  async process(dist) {
    let width;
    const widthArray = dist.name.split("-");
    if (widthArray.length > 0) {
      width = parseInt(widthArray[1]);
    }
    const type = dist.ext.substring(1);
    const isValidWidth = !isNaN(width);
    const isValidType = isInObject(sharp, type) && isFunction(sharp[type]);

    if (isValidWidth || isValidType) {
      let image = sharp(Buffer.from(dist.content));
      if (isValidWidth) {
        image = image.resize(parseInt(width));
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
