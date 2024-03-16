import path from "path";
import { getContent } from "./content.js";
import { getRouting } from "./routing.js";
import { getTheming } from "./theming.js";

const langs = ["en", "pl"];
const { colors, themes } = getTheming();
const { data, labels } = await getContent(langs);
const { routes, pages } = getRouting(langs, labels, data);

const appPath = path.resolve(path.join("examples", "full2"));

export const config = {
  src: path.join(appPath, "src"),
  dist: path.join(appPath, "dist"),
  reportFile: path.join(appPath, "report.json"),
  routes,

  data: {
    name: "swn.ski",
    type: "website",
    url: "https://swn.ski",
    author: "Jakub Sowiński <j@swn.ski> (https://swn.ski)",
    langs,
    themes,
    colors,
    labels,
    pages,
  },
};

export default config;
