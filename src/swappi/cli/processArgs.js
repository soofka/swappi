import { argv } from "process";
import { parseArgs } from "node:util";

export function processArgs(argsOptions) {
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

export default processArgs;
