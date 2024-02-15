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
      description:
        "Builds application. Accepts additional parameters in following order: first string represents src directory path, second string represents dist directory path. If ommitted, these options will be taken from config.",
    },
    generate: {
      type: "boolean",
      short: "g",
      default: false,
      description:
        'Generates application template. Accepts additional parameters in following order: first string represents target directory, second string represents template (default: "full")',
    },
    run: {
      type: "boolean",
      short: "r",
      default: false,
      description:
        "Serves application on localhost. Accepts additional parameters: path of directory to serve and server port. If ommitted, these options will be taken from config.",
    },
    // test: {
    //   type: "boolean",
    //   short: "t",
    //   default: false,
    //   description: "Runs application tests",
    // },
    watch: {
      type: "boolean",
      short: "w",
      default: false,
      description:
        "Continuously builds application whenever a change occurs. Accepts additional parameters in following order: first string represents src directory path, second string represents dist directory path. If ommitted, these options will be taken from config.",
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
  const { args, params } = processArgs(argsOptions);
  const packageJson = await loadJson(path.resolve("package.json"));

  if (args.help) {
    printHelp(argsOptions, packageJson);
  } else {
    const config = await processConfig(args, params);
    if (config.verbosity > 0) {
      printHeader(packageJson);
    }

    Swappski.init(config);

    if (args.generate) {
      await Swappski.generator.generate(
        params.generate.target,
        params.generate.template,
      );
    }

    if (args.build || args.watch) {
      if (args.watch) {
        Swappski.watcher.watch();
      } else {
        await Swappski.builder.build();
      }
    }

    if (args.run) {
      Swappski.server.serve();
    }
  }
}

function processArgs(argsOptions) {
  const { values, tokens } = parseArgs({
    args: argv.slice(2),
    tokens: true,
    allowPositionals: true,
    options: argsOptions,
  });
  const params = {};

  let index = 0;
  for (let i in tokens) {
    if (parseInt(i, 10) < index) {
      continue;
    }
    index = parseInt(i, 10);

    const token = tokens[index];
    if (token.kind === "option") {
      if (token.name === "build" && values.build === true) {
        let src;
        let dist;
        if (
          index < tokens.length - 1 &&
          tokens[index + 1].kind === "positional"
        ) {
          src = tokens[++index].value;
          if (
            index < tokens.length - 1 &&
            tokens[index + 1].kind === "positional"
          ) {
            dist = tokens[++index].value;
          }
        }
        params.build = { src, dist };
      } else if (token.name === "generate" && values.generate === true) {
        let target;
        let template;
        console.log("generate", index, tokens.length, tokens[index + 1]);
        if (
          index < tokens.length - 1 &&
          tokens[index + 1].kind === "positional"
        ) {
          target = tokens[++index].value;
          if (
            index < tokens.length - 1 &&
            tokens[index + 1].kind === "positional"
          ) {
            template = tokens[++index].value;
          }
        }
        params.generate = { target, template };
      } else if (token.name === "run" && values.run === true) {
        let dist;
        let port;
        if (
          index < tokens.length - 1 &&
          tokens[index + 1].kind === "positional"
        ) {
          if (!isNaN(tokens[index + 1].value)) {
            port = tokens[++index].value;
          } else {
            dist = tokens[++index].value;
            if (
              index < tokens.length - 1 &&
              tokens[index + 1].kind === "positional" &&
              !isNaN(tokens[index + 1].value)
            ) {
              port = tokens[++index].value;
            }
          }
        }
        params.run = { dist, port };
      } else if (token.name === "watch" && values.watch === true) {
        let src;
        let dist;
        if (
          index < tokens.length - 1 &&
          tokens[index + 1].kind === "positional"
        ) {
          src = tokens[++index].value;
          if (
            index < tokens.length - 1 &&
            tokens[index + 1].kind === "positional"
          ) {
            dist = tokens[++index].value;
          }
        }
        params.watch = { src, dist };
      }
    }
  }

  return { args: values, params };
}

async function processConfig(args, params) {
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
  if (params.watch && params.watch.src) {
    config.src = params.watch.src;
  } else if (params.build && params.build.src) {
    config.src = params.build.src;
  }
  if (params.watch && params.watch.dist) {
    config.dist = params.watch.dist;
  } else if (params.build && params.build.dist) {
    config.dist = params.build.dist;
  } else if (params.run && params.run.dist) {
    config.dist = params.run.dist;
  }
  if (params.run && params.run.port) {
    config.port = params.run.port;
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
