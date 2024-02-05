import fs from "fs/promises";

export class Generator {
  static async generate(copyPath) {
    return await fs.cp(path.resolve("example"), copyPath, { recursive: true });
  }
}

export default Generator;
