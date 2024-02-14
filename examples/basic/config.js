import path from "path";
const appPath = path.resolve(path.join("examples", "basic"));

export const config = {
  src: path.join(appPath, "src"),
  dist: path.join(appPath, "dist"),
};

export default config;
