import path from "path";
import http from "http";
import open from "open";
import mimeTypes from "mime-db";
import { isInObject, loadFile, loadJson } from "../helpers/index.js";
import { getConfig, getLogger } from "../utils/index.js";

export class Server {
  #server;

  async serve() {
    const hostname = process.env.HOST || "127.0.0.1";
    const port = process.env.PORT || getConfig().port || 3000;
    const url = `http://${hostname}:${port}/`;

    getLogger()
      .log(`Starting server at ${url} with content of ${getConfig().dist}`)
      .logLevelUp();

    let routing = { "/": "index.html" };
    const routingPath = path.join(getConfig().dist, "routing.json");
    try {
      routing = await loadJson(routingPath);
    } catch (e) {
      getLogger().warn(
        `Routing table not found at ${routingPath} (error: ${e})`,
      );
    }

    this.#server = http
      .createServer(async (req, res) => {
        getLogger().log(
          `Server received request: ${req.method} ${req.url} (body: ${req.body || "empty"})`,
        );

        const url = req.url.substring(1);
        const filePath = isInObject(routing, url) ? routing[url] : url;
        const mimeType = Object.keys(mimeTypes).find(
          (key) =>
            Object.hasOwn(mimeTypes[key], "extensions") &&
            mimeTypes[key].extensions.includes(
              path.extname(filePath).substring(1).toLowerCase(),
            ),
        );

        let status;
        let headers;
        let content;
        let encoding;
        try {
          status = 200;
          headers = { "Content-Type": mimeType };
          content = await loadFile(path.join(getConfig().dist, filePath));
          encoding = "utf-8";
        } catch (e) {
          headers = { "Content-Type": "text/html" };
          if (e.code === "ENOENT") {
            status = 404;
            content = "404 Not found";
          } else {
            status = 500;
            content = "500 Internal server error";
          }
        }

        res.writeHead(status, headers);
        res.end(content, encoding);

        getLogger().log(
          `Server responded to request ${req.method} ${req.url} with ${status}`,
        );
      })
      .listen(port);

    getLogger().log(`Server running at ${url}`);
    open(url);
  }

  close() {
    getLogger().logLevelDown().log("Terminating server");

    if (this.#server) {
      this.#server.close();
    }

    getLogger().log("Server terminated");
  }
}

export default Server;
