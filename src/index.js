import Swapp from "./swapp/Swapp.js";
import * as files from "./swapp/files/index.js";
import * as helpers from "./swapp/helpers/index.js";
import * as utils from "./swapp/utils/index.js";

import esMain from "es-main";
import swappCli from "./cli.js";

if (esMain(import.meta)) {
  swappCli();
}

export { Swapp, files, helpers, utils };
export default Swapp;
