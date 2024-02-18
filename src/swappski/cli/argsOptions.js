export const argsOptions = {
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
  mode: {
    type: "string",
    short: "m",
    default: "prod",
    description: 'Build mode ("dev" or "prod")',
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
};

export default argsOptions;
