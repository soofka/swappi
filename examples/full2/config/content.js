export const getContent = async (langs) => {
  const labels = {};
  for (let lang of langs) {
    labels[lang] = (
      await import(`../src/data/translations/${lang}.json`, {
        assert: { type: "json" },
      })
    ).default;
  }

  const data = {
    articles: (
      await import("../src/data/articles.json", {
        assert: { type: "json" },
      })
    ).default,
    blog: (
      await import("../src/data/blog.json", {
        assert: { type: "json" },
      })
    ).default,
    courses: (
      await import("../src/data/courses.json", {
        assert: { type: "json" },
      })
    ).default,
    projects: (
      await import("../src/data/projects.json", {
        assert: { type: "json" },
      })
    ).default,
    talks: (
      await import("../src/data/talks.json", {
        assert: { type: "json" },
      })
    ).default,
  };

  // for (let project of data.projects) {
  //   const meta = { links: [], stats: [] };
  //   if (project.demo) {
  //     meta.links.push(`<a href="${project.demo}" target="_blank">demo</a>`);
  //   }
  //   if (project.github) {
  //     const { forks_count: forks = 0, stargazers_count: stars = 0 } = await (
  //       await fetch(`https://api.github.com/repos/soofka/${project.github}`)
  //     ).json();
  //     meta.links.push(
  //       `<a href="https://github.com/soofka/${project.github}" target="_blank">github.com/soofka/${project.github}</a>`,
  //     );
  //     meta.stats.push(`${stars} stars`, `${forks} forks`);
  //   }
  //   if (project.npm) {
  //     const { downloads = 0 } = await (
  //       await fetch(
  //         `https://api.npmjs.org/downloads/point/2000-01-01:2050-01-01/${project.npm}`,
  //       )
  //     ).json();
  //     project.downloads = downloads;
  //     meta.stats.push(`${downloads} npm installs`);
  //   }
  //   project.meta = meta;
  // }

  return { data, labels };
};
