import sharp from "sharp";
import File from "./File.js";
import { getConfig, getLogger } from "../utils/index.js";

export class ImgFile extends File {
  #variants = [];

  constructor(srcAbsPath, relPath, hashable = true) {
    super(srcAbsPath, relPath, hashable);
    this.encoding = null;
  }

  async prepareForProcessing(distPath, reportDirectory, additionalDirectories) {
    getLogger().log(
      7,
      `Preparing img file ${this.src.rel} for processing [distPath=${distPath}, reportDirectory=${reportDirectory}, additionalDirectories=${additionalDirectories}]`,
    );
    await super.prepareForProcessing(
      distPath,
      reportDirectory,
      additionalDirectories,
    );

    const newDists = [];

    if (getConfig().options.optimize.img.keepOriginal) {
      newDists.push(this.dist[0]);
      this.#variants.push({});
    }

    for (let width of getConfig().options.optimize.img.widths) {
      for (let type of getConfig().options.optimize.img.types) {
        const newDist = this.dist[0].clone();
        newDist.name = `${newDist.name}-${width}`;
        newDist.ext = `.${type}`;
        newDists.push(newDist);
        this.#variants.push({ width, type });
      }
    }

    this.dist = newDists;

    getLogger().log(
      7,
      `Img file ${this.src.rel} prepared for processing (dist length: ${this.dist.length})`,
    );
    return this;
  }

  async execute(dist, index) {
    let content = this.content;
    const { width, type } = this.#variants[index];

    if (width && type) {
      content = await sharp(content).resize(width)[type]().toBuffer();
    }

    return content;
  }
}

export default ImgFile;
