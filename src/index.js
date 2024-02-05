import Swappski from "./swappski/index.js";
import esMain from "es-main";
import swappskiCli from "./cli.js";

if (esMain(import.meta)) {
  swappskiCli();
}

export { Swappski };
export default Swappski;
