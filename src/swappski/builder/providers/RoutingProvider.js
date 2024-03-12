import path from "path";
import Provider from "./Provider.js";
import { DirentData, File } from "../core/index.js";
import { isObject } from "../../helpers/index.js";
import { getConfig } from "../../utils/index.js";

export class RoutingProvider extends Provider {
  constructor(options) {
    super(options, { fileName: "routing.json", fileFormat: "json" });
  }

  provide(src) {
    const routing = {};
    for (let route of Object.keys(getConfig().routes)) {
      const { template, pageName, alts = [] } = getConfig().routes[route];
      const srcFile = src.files.find((file) => file.src.name === template);
      if (srcFile) {
        const dist = srcFile.dists.find((dist) => dist.name === pageName);
        if (dist) {
          routing[route] = dist.full;
          for (let alt of alts) {
            routing[alt] = dist.full;
          }
        }
      }
    }
    const routingFile = new File();
    const routingFileDist = new DirentData(
      path.join(getConfig().dist, this.options.fileName),
    );
    routingFileDist.content =
      this.options.fileFormat === "json" ? JSON.stringify(routing) : routing;
    routingFile.dists = [routingFileDist];
    routingFile.distsToProcess = routingFile.dists;
    src.dirents = [...src.dirents, routingFile];
    return src;
  }
}

export default RoutingProvider;
