import path from "path";
import argsOptions from "./argsOptions.js";
import getConfigFromArgs from "./getConfigFromArgs.js";
import printHeader from "./printHeader.js";
import printHelp from "./printHelp.js";
import processArgs from "./processArgs.js";
import Swappi from "../index.js";
import { loadJson } from "../helpers/index.js";

export function swappiCli() {
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

    Swappi.init(config);

    if (args.generate) {
      await Swappi.generator.generate(
        params.generate.target,
        params.generate.template,
      );
    }

    if (args.build || args.watch) {
      if (args.watch) {
        (await Swappi.watcher.init()).watch();
      } else {
        await Swappi.builder.init();
        await Swappi.builder.build();
        await Swappi.builder.close();
      }
    }

    if (args.run) {
      Swappi.server.serve();
    }

    const closeFunction = () => {
      Swappi.builder.close();
      Swappi.server.close();
      Swappi.watcher.close();
    };
    process.on("SIGINT", closeFunction);
    process.on("SIGTERM", closeFunction);
  }
}

export default swappiCli;
