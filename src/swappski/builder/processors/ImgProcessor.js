import sharp from "sharp";
import Processor from "./Processor.js";
import { isFunction, isImage, isInObject } from "../../helpers/index.js";

export class ImgProcessor extends Processor {
  #variants = [];

  constructor(options) {
    super(options, {
      test: (direntData) => isImage(direntData),
      resize: true,
      resizeWidths: [320, 640, 1280],
      convert: true,
      convertTypes: ["avif", "webp", "jpg"],
      keepOriginal: true,
    });
  }

  async prepareFile(file) {
    const newDists = [];
    if (this.options.keepOriginal) {
      newDists.push(file.dists[0]);
      this.#variants.push({});
    }
    for (let width of this.options.resizeWidths) {
      for (let type of this.options.convertTypes) {
        const newDist = file.dists[0].clone();
        newDist.name = `${newDist.name}-${width}`;
        newDist.ext = `.${type}`;
        newDists.push(newDist);
        this.#variants.push({ width, type });
      }
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
