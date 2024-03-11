import path from "path";

const en = (
  await import("./translations/en.json", {
    assert: { type: "json" },
  })
).default;
const pl = (
  await import("./translations/pl.json", {
    assert: { type: "json" },
  })
).default;
const articles = (
  await import("./data/articles.json", {
    assert: { type: "json" },
  })
).default;
const blog = (
  await import("./data/blog.json", {
    assert: { type: "json" },
  })
).default;
const courses = (
  await import("./data/courses.json", {
    assert: { type: "json" },
  })
).default;
const projects = (
  await import("./data/projects.json", {
    assert: { type: "json" },
  })
).default;
const talks = (
  await import("./data/talks.json", {
    assert: { type: "json" },
  })
).default;

const appPath = path.resolve(path.join("examples", "full2"));
const langs = ["en", "pl"];
const labels = { en, pl };
const colors = {
  grayscale: [
    "#000000",
    "#080808",
    "#111111",
    "#333333",
    "#CCCCCC",
    "#EEEEEE",
    "#F9F9F9",
    "#FFFFFF",
  ],
  accents: {
    architect: {
      light: "#c60f2d",
      dark: "#a50d26",
    },
    developer: {
      light: "#0083d6",
      dark: "#006db2",
    },
    leader: {
      light: "#00c9d6",
      dark: "#00a8b2",
    },
  },
};
const themes = [
  { name: "light", color: colors.grayscale[7] },
  { name: "dark", color: colors.grayscale[0] },
];

const metaSeparator = " | ";
const pages = {};
for (let lang of langs) {
  pages[`index-${lang}`] = {
    type: "cover",
    meta: {
      title: labels[lang].meta.title,
      description: labels[lang].meta.description,
    },
  };
  pages[`articles-${lang}`] = {
    type: "list",
    meta: {
      title: `${labels[lang].pages.articles.meta.title}${metaSeparator}${labels[lang].meta.title}`,
      description: `${labels[lang].pages.articles.meta.description}${metaSeparator}${labels[lang].meta.description}`,
    },
    content: articles,
  };
  for (let article of articles) {
    pages[`article/${article.id}`] = {
      type: "item",
      meta: {
        title: `${article.title}${metaSeparator}${labels[lang].meta.title}`,
        description: `${article.description}${metaSeparator}${labels[lang].meta.description}`,
      },
    };
  }
  pages[`blog-${lang}`] = {
    type: "list",
    meta: {
      title: `${labels[lang].pages.blog.meta.title}${metaSeparator}${labels[lang].meta.title}`,
      description: `${labels[lang].pages.blog.meta.description}${metaSeparator}${labels[lang].meta.description}`,
    },
    content: blog,
  };
  for (let post of blog) {
    pages[`blog/${post.id}`] = {
      type: "item",
      meta: {
        title: `${post.title}${metaSeparator}${labels[lang].meta.title}`,
        description: `${post.description}${metaSeparator}${labels[lang].meta.description}`,
      },
    };
  }
  pages[`courses-${lang}`] = {
    type: "list",
    meta: {
      title: `${labels[lang].pages.courses.meta.title}${metaSeparator}${labels[lang].meta.title}`,
      description: `${labels[lang].pages.courses.meta.description}${metaSeparator}${labels[lang].meta.description}`,
    },
    content: courses,
  };
  pages[`projects-${lang}`] = {
    type: "list",
    meta: {
      title: `${labels[lang].pages.projects.meta.title}${metaSeparator}${labels[lang].meta.title}`,
      description: `${labels[lang].pages.projects.meta.description}${metaSeparator}${labels[lang].meta.description}`,
    },
    content: projects,
  };
  pages[`talks-${lang}`] = {
    type: "list",
    meta: {
      title: `${labels[lang].pages.talks.meta.title}${metaSeparator}${labels[lang].meta.title}`,
      description: `${labels[lang].pages.talks.meta.description}${metaSeparator}${labels[lang].meta.description}`,
    },
    content: talks,
  };
}

export const config = {
  src: path.join(appPath, "src"),
  dist: path.join(appPath, "dist"),
  reportFile: path.join(appPath, "report.json"),

  data: {
    name: "swn.ski",
    type: "website",
    url: "https://swn.ski",
    author: "Jakub Sowiński <j@swn.ski> (https://swn.ski)",
    langs,
    pages,
    themes,
    colors,
    labels,
  },
};

export default config;
