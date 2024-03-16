export const getContent = async (langs) => {
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

  for (let project of data.projects) {
    const meta = [];
    if (project.demo) {
      meta.push(`<a href="${project.demo}" target="_blank">demo</a>`);
    }
    if (project.github) {
      const { forks = 0, watchers = 0 } = await fetch(
        `https://api.github.com/repos/soofka/${project.github}`,
      );
      meta.push(
        `<a href="https://api.github.com/repos/soofka/${project.github}" target="_blank">repo</a>`,
        `${forks} forks`,
        `${watchers} watchers`,
      );
    }
    if (project.npm) {
      const { downloads = 0 } = await fetch(
        `https://api.npmjs.org/downloads/point/2000-01-01:2050-01-01/${project.npm}`,
      );
      project.downloads = downloads;
      meta.push(`${downloads} downloads`);
    }
    project.meta = meta.join(" | ");
  }

  return { data, labels };
};
