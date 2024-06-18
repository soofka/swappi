import path from "path";
import http from "http";
import open from "open";
import mimeTypes from "mime-db";
import { isInObject, findInDir, loadFile, loadJson } from "../helpers/index.js";
import { getConfig, getLogger } from "../utils/index.js";

export class Server {
  #server;
  #routing = { "/": "index.html" };

  async serve() {
    const hostname = process.env.HOST || "127.0.0.1";
    const port = process.env.PORT || getConfig().port || 3000;
    const url = `http://${hostname}:${port}/`;

    getLogger()
      .log(`Starting server at ${url} with content of ${getConfig().dist}`)
      .logLevelUp();

    const routingPath = path.join(getConfig().dist, "routing.json");
    try {
      this.#routing = await loadJson(routingPath);
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

        let responseStatus;
        let responseHeaders;
        let responseContent;

        let fileFound = false;
        let serverError = false;

        const qsIndex = req.url.indexOf("?");
        const url = qsIndex === -1 ? req.url : req.url.substring(0, qsIndex);
        const filePath = isInObject(this.#routing.static, url)
          ? this.#routing.static[url]
          : url;
        const mimeType = Object.keys(mimeTypes).find(
          (key) =>
            Object.hasOwn(mimeTypes[key], "extensions") &&
            mimeTypes[key].extensions.includes(
              path.extname(filePath).substring(1).toLowerCase(),
            ),
        );

        try {
          responseStatus = 200;
          responseHeaders = { "Content-Type": mimeType };
          responseContent = await loadFile(
            path.join(getConfig().dist, filePath),
          );
          fileFound = true;
        } catch (e) {
          if (e.code !== "ENOENT") {
            serverError = true;
          }
        }

        if (serverError) {
          responseStatus = 500;
          responseHeaders = { "Content-Type": "text/html" };
          responseContent =
            (await this.#loadErrorContent(responseStatus, url)) ||
            "500 Internal server error";
        } else if (!fileFound) {
          responseStatus = 404;
          responseHeaders = { "Content-Type": "text/html" };
          responseContent =
            (await this.#loadErrorContent(responseStatus, url)) ||
            "404 Page not found";
        }

        res.writeHead(responseStatus, responseHeaders);
        res.end(responseContent, "utf-8");

        getLogger().log(
          `Server responded to request ${req.method} ${req.url} with ${responseStatus}`,
        );
      })
      .listen(port);

    getLogger().log(`Server running at ${url}`);
    open(url);
  }

  async #loadErrorContent(statusCode, url) {
    let errorContent;
    const errorObjectKey = Object.keys(this.#routing.errors).find(
      (errorId) =>
        url.startsWith(this.#routing.errors[errorId].scope) &&
        this.#routing.errors[errorId].statusCode == statusCode,
    );
    if (errorObjectKey && isInObject(this.#routing.errors, errorObjectKey)) {
      try {
        errorContent = await loadFile(
          path.join(
            getConfig().dist,
            this.#routing.errors[errorObjectKey].filePath,
          ),
        );
      } catch (e) {}
    }
    return errorContent;
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
