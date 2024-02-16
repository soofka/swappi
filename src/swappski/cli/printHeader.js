import { getLogger } from "../utils/index.js";

export function printHeader(packageJson) {
  if (packageJson) {
    getLogger().log(`${packageJson.name} v${packageJson.version}`).log("---");
  }
}

export default printHeader;
