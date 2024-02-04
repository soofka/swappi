import path from "path";
import { argv } from "process";
import { performance } from "perf_hooks";
import { parseArgs } from "node:util";
import packageJson from "../package.json" assert { type: "json" };
import Builder from "./Builder.js";
import { isObject, isInObject, loadModule } from "./helpers/index.js";

init({
  config: {
    type: "string",
    short: "c",
    default: "swapp.config.js",
    description: "Config file path",
  },
  force: {
    type: "boolean",
    short: "f",
    default: false,
    description: "Force processing all files",
  },
  silent: {
    type: "boolean",
    short: "s",
    default: false,
    description: "Do not print any logs to console",
  },
  logfile: {
    type: "string",
    short: "l",
    default: "",
    description: "Print all logs to given file path",
  },
  help: {
    type: "boolean",
    short: "h",
    default: false,
    description: "Print help",
  },
});

async function init(args) {
  const startTime = performance.now();

  const config = await processArgs(getArgs(args), args);
  if (config) {
    if (config.options.verbosity !== 0) {
      console.log(`${packageJson.name} v${packageJson.version}`);
      console.log("---");
    }

    const builder = new Builder(config);
    await builder.init();
    await builder.build();

    const endTime = performance.now();
    if (config.options.verbosity !== 0) {
      console.log(`Done in ${Math.round(endTime - startTime)}ms`);
      console.log("---");
    }
  }
}

function getArgs(argsOptions) {
  return parseArgs({
    args: argv.slice(2),
    options: argsOptions,
  }).values;
}

async function processArgs(args, argsOptions) {
  if (args.help === true) {
    return printHelp(argsOptions);
  } else {
    let config = await loadModule(path.resolve(args.config));
    if (!isObject(config)) {
      config = {};
    }
    if (!isInObject(config, "options")) {
      config.options = {};
    }
    if (args.force === true) {
      config.options.force = true;
    }
    if (args.silent === true) {
      config.options.verbosity = 0;
    }
    if (args.logfile !== "") {
      config.options.logfile = path.resolve(args.logfile);
    }
    return config;
  }
}

function printHelp(argsOptions) {
  console.log(`${packageJson.name} v${packageJson.version}`);
  console.log("---");
  for (let key of Object.keys(argsOptions)) {
    const arg = argsOptions[key];
    console.log(
      `-${key}, --${arg.short} (${arg.type}, default: ${arg.type === "string" ? '"' : ""}${arg.default}${arg.type === "string" ? '"' : ""}): ${arg.description}`,
    );
  }
  console.log("---");
  console.log(
    `For more information, please refer to ${packageJson.repository.url}/README.md`,
  );
}
