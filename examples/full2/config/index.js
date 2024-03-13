import path from "path";
import { getRouting } from "./routing.js";
import { getTheming } from "./theming.js";

const url = "https://swn.ski";
const langs = ["en", "pl"];
const labels = {};
for (let lang of langs) {
  labels[lang] = (
    await import(`../translations/${lang}.json`, {
      assert: { type: "json" },
    })
  ).default;
}
const data = {
  articles: (
    await import("../data/articles.json", {
      assert: { type: "json" },
    })
  ).default,
  blog: (
    await import("../data/blog.json", {
      assert: { type: "json" },
    })
  ).default,
  courses: (
    await import("../data/courses.json", {
      assert: { type: "json" },
    })
  ).default,
  projects: (
    await import("../data/projects.json", {
      assert: { type: "json" },
    })
  ).default,
  talks: (
    await import("../data/talks.json", {
      assert: { type: "json" },
    })
  ).default,
};
const { colors, themes } = getTheming();
const { routes, pages } = getRouting(url, langs, labels, data);

const appPath = path.resolve(path.join("examples", "full2"));

export const config = {
  src: path.join(appPath, "src"),
  dist: path.join(appPath, "dist"),
  reportFile: path.join(appPath, "report.json"),
  routes,

  data: {
    name: "swn.ski",
    type: "website",
    author: "Jakub Sowiński <j@swn.ski> (https://swn.ski)",
    url,
    langs,
    themes,
    colors,
    labels,
    pages,
  },
};

export default config;
