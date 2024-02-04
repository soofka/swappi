import fs from "fs/promises";
import path from "path";

await fs.cp(path.resolve("src"), path.resolve("dist"), { recursive: true });
