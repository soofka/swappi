import path from "path";
import { argv } from "process";
import { parseArgs } from "node:util";
import Swappski from "./swappski/index.js";
import {
  isObject,
  loadJson,
  loadModuleFromFile,
} from "./swappski/helpers/index.js";

export function swappskiCli() {
  return cli({
    build: {
      type: "boolean",
      short: "b",
      default: false,
      description: "Builds application",
    },
    generate: {
      type: "string",
      short: "g",
      default: "",
      description:
        'Generates application template at given path (basic by default, full if provided with option "full")',
    },
    run: {
      type: "string",
      short: "r",
      default: "",
      description: "Serves application from given folder on localhost",
    },
    port: {
      type: "string",
      short: "p",
      default: "3000",
      description: "Port for application server",
    },
    test: {
      type: "boolean",
      short: "t",
      default: false,
      description: "Runs application tests",
    },
    watch: {
      type: "boolean",
      short: "w",
      default: false,
      description: "Continuously builds application whenever a change occurs",
    },
    config: {
      type: "string",
      short: "c",
      default: "swappski.config.js",
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
  const { args, positionals } = getArgs(argsOptions);
  const packageJson = await loadJson(path.resolve("package.json"));

  if (args.help) {
    printHelp(argsOptions, packageJson);
  } else {
    const config = await processArgs(args, argsOptions, packageJson);
    if (config.verbosity > 0) {
      printHeader(packageJson);
    }

    Swappski.init(config);

    if (args.generate) {
      await Swappski.generator.generate(
        args.generate,
        positionals.length > 0 && positionals[0] === "full" ? "full" : "basic",
      );
    }
    const operations = [];
    if (args.build) {
      operations.push(Swappski.builder.build());
    }
    if (args.run) {
      operations.push(Swappski.server.serve(args.run, args.port));
    }
    if (args.test) {
      operations.push(Swappski.tester.test());
    }
    if (args.watch) {
      operations.push(Swappski.watcher.watch());
    }
    await Promise.all(operations);
  }
}

function getArgs(argsOptions) {
  const obj = parseArgs({
    args: argv.slice(2),
    options: argsOptions,
  });
  console.log("");
  return { args: obj.values, positionals: obj.positionals };
}

async function processArgs(args) {
  let config;
  try {
    config = await loadModuleFromFile(path.resolve(args.config));
  } catch (e) {
    if (e.code !== "ERR_MODULE_NOT_FOUND") {
      throw e;
    }
    config = {};
  }
  if (!isObject(config)) {
    config = {};
  }
  if (args.force === true) {
    config.force = true;
  }
  if (args.silent === true) {
    config.verbosity = 0;
  }
  if (args.logfile !== "") {
    config.logFile = path.resolve(args.logfile);
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

export default swappskiCli;
