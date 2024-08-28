import path from "path";
import icoEndec from "ico-endec";
import Provider from "./Provider.js";
import { DirentData, File } from "../core/index.js";
import { getConfig } from "../../utils/index.js";

export class FaviconProvider extends Provider {
  constructor(options) {
    super(options, {
      iconFileName: "icon",
      iconDistNames: [
        "icon-16x16",
        "icon-32x32",
        "icon-48x48",
        "icon-76x76",
        "icon-120x120",
      ],
    });
  }

  provide(src) {
    const favicon = new File();
    const faviconDist = new DirentData(
      path.join(getConfig().dist, "favicon.ico"),
    );
    faviconDist.content = icoEndec.encode(
      src.files
        .find((file) => file.src.name === this.options.iconFileName)
        .dists.filter((dist) => this.options.iconDistNames.includes(dist.name))
        .map((dist) => dist.content),
    );
    favicon.dists = [faviconDist];
    favicon.distsToProcess = favicon.dists;
    src.dirents = [...src.dirents, favicon];
    return src;
  }
}

export default FaviconProvider;
