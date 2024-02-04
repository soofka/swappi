import path from "path";
import { argv } from "process";
import { performance } from "perf_hooks";
import { parseArgs } from "node:util";
import Swapp from "./swapp/index.js";
import {
  isObject,
  isInObject,
  loadJson,
  loadModule,
} from "./swapp/helpers/index.js";

export function swappCli() {
  return cli({
    build: {
      type: "boolean",
      short: "b",
      default: true,
      description: "Builds application",
    },
    run: {
      type: "boolean",
      short: "r",
      default: false,
      description: "Serves application on localhost",
    },
    port: {
      type: "string",
      short: "p",
      default: "3000",
      description: "Port for application server",
    },
    watch: {
      type: "boolean",
      short: "w",
      default: false,
      description: "Continuously builds application whenever a change occurs",
    },
    generate: {
      type: "string",
      short: "g",
      default: "",
      description: "Generates application template at given path",
    },
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
      description: "Forces processing all files",
    },
    silent: {
      type: "boolean",
      short: "s",
      default: false,
      description: "Prevents printing of any logs to console",
    },
    logfile: {
      type: "string",
      short: "l",
      default: "",
      description: "Prints all logs to given file path",
    },
    help: {
      type: "boolean",
      short: "h",
      default: false,
      description: "Prints help",
    },
  });
}

async function cli(argsOptions) {
  const startTime = performance.now();
  const args = getArgs(argsOptions);
  const packageJson = await loadJson(path.resolve("package.json"));

  if (args.help) {
    printHelp(argsOptions, packageJson);
  } else {
    const config = await processArgs(args, argsOptions, packageJson);

    if (config) {
      if (config.options.verbosity !== 0) {
        printHeader(packageJson);
      }

      const swapp = new Swapp(config);
      const operations = [];
      if (args.build) {
        operations.push(swapp.build());
      }
      if (args.run) {
        operations.push(swapp.run(args.port));
      }
      if (args.watch) {
        operations.push(swapp.watch());
      }
      if (args.generate) {
        operations.push(swapp.generate());
      }
      await Promise.all(operations);

      const endTime = performance.now();
      if (config.options.verbosity !== 0) {
        console.log(`Done in ${Math.round(endTime - startTime)}ms`);
        console.log("---");
      }
    } else {
      throw ("Invalid config", config);
    }
  }
}

function getArgs(argsOptions) {
  return parseArgs({
    args: argv.slice(2),
    options: argsOptions,
  }).values;
}

async function processArgs(args) {
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

function printHelp(argsOptions, packageJson) {
  printHeader(packageJson);
  for (let key of Object.keys(argsOptions)) {
    const arg = argsOptions[key];
    console.log(
      `-${key}, --${arg.short} (${arg.type}, default: ${arg.type === "string" ? '"' : ""}${arg.default}${arg.type === "string" ? '"' : ""}): ${arg.description}`,
    );
  }
  if (packageJson) {
    console.log("---");
    console.log(
      `For more information, please refer to ${packageJson.repository.url}/README.md`,
    );
  }
}

function printHeader(packageJson) {
  if (packageJson) {
    console.log(`${packageJson.name} v${packageJson.version}`);
    console.log("---");
  }
}

export default swappCli;
