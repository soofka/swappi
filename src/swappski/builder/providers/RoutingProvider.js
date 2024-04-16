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
    for (let route in getConfig().routes) {
      const { template, pageId, alts = [] } = getConfig().routes[route];
      routing[route] = src.files
        .find((file) => file.src.name === template)
        .dists.find((dist) => dist.name === pageId).full;
      for (let alt of alts) {
        routing[alt] = routing[route];
      }
    }
    for (let format in this.options.formats) {
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
