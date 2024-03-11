import path from "path";
import argsOptions from "./argsOptions.js";
import getConfigFromArgs from "./getConfigFromArgs.js";
import printHeader from "./printHeader.js";
import printHelp from "./printHelp.js";
import processArgs from "./processArgs.js";
import Swappski from "../index.js";
import { loadJson } from "../helpers/index.js";

export function swappskiCli() {
  return cli(argsOptions);
}

async function cli(argsOptions) {
  const { args, params } = processArgs(argsOptions);
  const packageJson = await loadJson(path.resolve("package.json"));

  if (args.help) {
    printHelp(argsOptions, packageJson);
  } else {
    const config = await getConfigFromArgs(args, params);
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
        (await Swappski.watcher.init()).watch();
      } else {
        await Swappski.builder.init();
        await Swappski.builder.build();
        await Swappski.builder.close();
      }
    }

    if (args.run) {
      Swappski.server.serve();
    }

    const closeFunction = () => {
      Swappski.builder.close();
      Swappski.server.close();
      Swappski.watcher.close();
    };
    process.on("SIGINT", closeFunction);
    process.on("SIGTERM", closeFunction);
  }
}

export default swappskiCli;
