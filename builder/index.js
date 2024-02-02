import path from "path";
import { argv } from "process";
import { parseArgs } from "node:util";
import defaultConfig from "./config.js";
import Builder from "./Builder.js";
import { deepMerge, loadModule } from "./helpers/index.js";

const config = await processArgs(getArgs());
if (config) {
  console.log(config.constants.filesGroupMap);
  const builder = new Builder(config);
  await builder.init();
  await builder.build();
}

function getArgs() {
  const { values } = parseArgs({
    args: argv.slice(2),
    options: {
      config: {
        type: "string",
        short: "c",
        default: path.resolve("builder/config.js"),
      },
      force: {
        type: "boolean",
        short: "f",
        default: false,
      },
      silent: {
        type: "boolean",
        short: "s",
        default: false,
      },
      logfile: {
        type: "string",
        short: "l",
        default: "",
      },
      help: {
        type: "boolean",
        short: "h",
        default: false,
      },
    },
  });

  return values;
}

async function processArgs(args) {
  if (args.help === true) {
    return printHelp();
  } else {
    let finalConfig = defaultConfig;
    if (args.config !== "") {
      const argConfig = await loadModule(path.resolve(args.config));
      finalConfig = deepMerge(finalConfig, argConfig);
    }
    if (args.force === true) {
      finalConfig.options.force = true;
    }
    if (args.silent === true) {
      finalConfig.options.verbosity = 0;
    }
    if (args.logfile !== "") {
      finalConfig.options.logfile = path.resolve(args.logfile);
    }
    return finalConfig;
  }
}

function printHelp() {
  console.log("HELP");
}
