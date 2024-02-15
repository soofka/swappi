import esMain from "es-main";
import swappskiCli from "./swappski/cli/index.js";

if (esMain(import.meta)) {
  swappskiCli();
}

export * from "./swappski/index.js";
