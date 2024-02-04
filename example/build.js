import { config } from "./config.js";
import { Swapp } from "../src/index.js";

await new Swapp(config).build();
