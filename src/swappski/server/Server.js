import express from "express";
import open from "open";
import { getConfig, getLogger } from "../utils/index.js";

export class Server {
  #app;
  #server;

  constructor() {
    this.#app = express();
  }

  serve() {
    getLogger()
      .log(
        `Starting server on port ${getConfig().port} with content of ${getConfig().dist}`,
      )
      .logLevelUp();

    this.#app.use((req, res, next) => {
      getLogger().log(
        `Server received request: ${req.method} ${req.url} (body: ${req.body || "empty"})`,
      );
      res.on("finish", () =>
        getLogger().log(
          `Server responded to request ${req.method} ${req.url} with ${res.statusCode}`,
        ),
      );
      next();
    });
    this.#app.use(express.static(getConfig().dist));
    this.#server = this.#app.listen(getConfig().port, async () => {
      await open(`http://localhost:${getConfig().port}`);
      getLogger().log(`Server running on port ${getConfig().port}`);
    });

    process.on("SIGTERM", () => this.close());
    process.on("SIGINT", () => this.close());
  }

  close() {
    getLogger().logLevelDown().log("Terminating server");
    this.#server.close();
  }
}

export default Server;
