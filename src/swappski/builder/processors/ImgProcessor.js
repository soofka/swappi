import Processor from "./Processor.js";

export class ImgProcessor extends Processor {
  #variants = [];

  constructor(options) {
    super(options, {
      test: (direntData) =>
        ["avif", "gif", "jpg", "jpeg", "png", "svg", "webp"].includes(
          direntData.ext,
        ),
      resize: true,
      resizeWidths: [320, 640, 1280, 1920, 2560],
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
  }

  async process(dist) {
    let width;
    const widthArray = dist.name.split("-");
    if (widthArray.length > 0) {
      width = widthArray[1];
    }
    const type = dist.ext.substring(1);
    const isValidWidth = !!width;
    const isValidType = isInObject(image, type) && isFunction(image[type]);

    if (isValidWidth || isValidType) {
      let image = await sharp(content);
      if (isValidWidth) {
        image = image.resize(width);
      }
      if (isValidType) {
        image = image[type]();
      }
      dist.content = image;
    }

    return dist;
  }
}

export default ImgProcessor;
