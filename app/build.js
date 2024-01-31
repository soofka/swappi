import { config } from "./config.js";
import Builder from "../builder/Builder.js";

const builder = new Builder(config);
await builder.init();
await builder.build();
