import path from "path";
import Provider from "./Provider.js";
import { DirentData, File } from "../core/index.js";
import { getConfig } from "../../utils/index.js";

export class RoutingProvider extends Provider {
  constructor(options) {
    super(options, {
      formats: { json: "routing.json", plaintext: "_redirects", sitemap: "sitemap.txt" },
    });
  }

  provide(src) {
    const routing = {
      static: {},
      errors: {},
    };
    for (let route in getConfig().routes.static) {
      const { template, pageId, alts = [] } = getConfig().routes.static[route];
      routing.static[route] = this.#findFile(src.files, template, pageId);
      for (let alt of alts) {
        routing.static[alt] = routing.static[route];
      }
    }
    for (let errorId in getConfig().routes.errors) {
      const { template, statusCode, scope } =
        getConfig().routes.errors[errorId];
      routing.errors[errorId] = {
        filePath: this.#findFile(src.files, template, errorId),
        statusCode,
        scope,
      };
    }
    for (let format in this.options.formats) {
      const routingFile = new File();
      const routingFileDist = new DirentData(
        path.join(getConfig().dist, this.options.formats[format]),
      );
      switch (format) {
        case "sitemap":
          routingFileDist.content = Object.keys(routing.static)
            .map((route) => `${route} /${routing.static[route]} 200!`)
            .join("\r\n");

        case "plaintext":
          routingFileDist.content = Object.keys(routing.static)
            .map((route) => `${route} /${routing.static[route]} 200!`)
            .concat(
              Object.keys(routing.errors).map(
                (errorId) =>
                  `${routing.errors[errorId].scope}* /${routing.errors[errorId].filePath} ${routing.errors[errorId].statusCode}`,
              ),
            )
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

  #findFile(files, template, pageId) {
    return files
      .find((file) => file.src.name === template)
      .dists.find((dist) => dist.name === pageId).full;
  }
}

export default RoutingProvider;
