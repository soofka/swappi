import path from "path";
import Processor from "./Processor.js";
import { DirentData, File } from "../core/index.js";
import { getConfig } from "../../utils/index.js";

export class RoutingProvider extends Processor {
  constructor(options) {
    super(options, {
      test: () => false,
    });
  }

  close(src) {
    const routing = {};
    for (let route of Object.keys(getConfig().routes)) {
      const srcFile = src.files.find(
        (file) => file.src.name === getConfig().routes[route],
      );
      const dist = srcFile.dists.find((dist) => dist.name === route);
      routing[route] = dist.full;
    }
    const routingFile = new File();
    const routingFileDist = new DirentData(
      path.join(getConfig().dist, "routing.json"),
    );
    routingFileDist.content = JSON.stringify(routing);
    routingFile.dists = [routingFileDist];
    routingFile.distsToProcess = routingFile.dists;
    src.dirents = [...src.dirents, routingFile];
    return src;
  }
}

export default RoutingProvider;
