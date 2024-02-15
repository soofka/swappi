import path from "path";
import express from "express";
import open from "open";
import { getLogger } from "../utils/index.js";

export class Server {
  #app;
  #server;

  constructor() {
    this.#app = express();
    process.on("SIGTERM", () => this.close());
    process.on("SIGINT", () => this.close());
  }

  serve(distAbsPath, port = 3000) {
    getLogger()
      .log(
        `Starting server on port ${port} with content of ${path.resolve(distAbsPath)}`,
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
    this.#app.use(express.static(path.resolve(distAbsPath)));
    this.#server = this.#app.listen(port, async () => {
      await open(`http://localhost:${port}`);
      getLogger().log(`Server running on port ${port}`);
    });
  }

  close() {
    getLogger().logLevelDown().log("Closing server");
    this.#server.close();
  }
}

export default Server;
