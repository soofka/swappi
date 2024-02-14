import path from "path";
import express from "express";
import { getLogger } from "../utils/index.js";

export class Server {
  #app;
  server;

  constructor() {
    this.#app = express();
    // process.on("SIGTERM", this.close);
    // process.on("SIGINT", this.close);
  }

  serve(distAbsPath, port = 3000) {
    getLogger()
      .log(
        `Starting server on port ${port} with content of ${path.resolve(distAbsPath)}`,
      )
      .logLevelUp();

    this.#app.use(express.static(path.resolve(distAbsPath)));
    // this.#app.get("*", (req) => getLogger().log(`Request: ${req}`));
    this.server = this.#app.listen(port, () =>
      getLogger().log(`Server running on port ${port}`),
    );
  }

  // close() {
  //   getLogger().logLevelDown().log("Closing server");

  //   this.server.close();
  // }
}

export default Server;
