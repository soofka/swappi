import path from "path";
import { isObject, loadModuleFromFile } from "../helpers/index.js";

export async function getConfigFromArgs(args, params) {
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

export default getConfigFromArgs;
