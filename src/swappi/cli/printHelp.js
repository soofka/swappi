import printHeader from "./printHeader.js";
import { getLogger } from "../utils/index.js";

export function printHelp(argsOptions, packageJson) {
  printHeader(packageJson);
  const records = {};
  for (let key in argsOptions) {
    const arg = argsOptions[key];
    records[key] = new Record(
      arg.short,
      arg.type,
      `${arg.type === "string" ? '"' : ""}${arg.default}${arg.type === "string" ? '"' : ""}`,
      arg.description,
    );
  }
  getLogger().table(records);
  if (packageJson) {
    getLogger()
      .log("---")
      .log(
        `For more information, please refer to ${packageJson.repository.url}/README.md`,
      );
  }
}

class Record {
  constructor(short, type, defaultValue, description) {
    this.short = short;
    this.type = type;
    this.defaultValue = defaultValue;
    this.description = description;
  }
}

export default printHelp;
