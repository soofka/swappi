import path from "path";
import Provider from "./Provider.js";
import { DirentData, File } from "../core/index.js";
import { getConfig } from "../../utils/index.js";

export class RoutingProvider extends Provider {
  constructor(options) {
    super(options, {
      formats: { json: "routing.json", plaintext: "_redirects" },
    });
  }

  provide(src) {
    const routing = {};
    for (let route of Object.keys(getConfig().routes)) {
      const { template, pageId, alts = [] } = getConfig().routes[route];
      const srcFile = src.files.find((file) => file.src.name === template);
      if (srcFile) {
        const dist = srcFile.dists.find((dist) => dist.name === pageId);
        if (dist) {
          routing[route] = dist.full;
          for (let alt of alts) {
            routing[alt] = dist.full;
          }
        }
      }
    }
    for (let format of Object.keys(this.options.formats)) {
      const routingFile = new File();
      const routingFileDist = new DirentData(
        path.join(getConfig().dist, this.options.formats[format]),
      );
      switch (format) {
        case "plaintext":
          routingFileDist.content = Object.keys(routing)
            .map((route) => `${route} /${routing[route]} 200!`)
            .join("\r\n");
          break;

        case "json":
          routingFileDist.content = JSON.stringify(routing);
          break;

        default:
          routingFileDist.content = routing;
          break;
      }
      routingFile.dists = [routingFileDist];
      routingFile.distsToProcess = routingFile.dists;
      src.dirents = [...src.dirents, routingFile];
    }
    return src;
  }
}

export default RoutingProvider;
