import esMain from "es-main";
import swappiCli from "./swappi/cli/index.js";

if (esMain(import.meta)) {
  swappiCli();
}

export * from "./swappi/index.js";
