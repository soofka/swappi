import esMain from "es-main";
import swapp from "./swapp.js";
import Swapp from "./swapp/Swapp.js";
import * as files from "./swapp/files/index.js";
import * as helpers from "./swapp/helpers/index.js";
import * as utils from "./swapp/utils/index.js";

if (esMain(import.meta)) {
  swapp();
}

export { Swapp, files, helpers, utils };
