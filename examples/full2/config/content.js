export const getContent = async (langs) => {
  const labels = {};
  for (let lang of langs) {
    labels[lang] = (
      await import(`../data/translations/${lang}.json`, {
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

  // for (let project of data.projects) {
  //   const meta = [];
  //   if (project.demo) {
  //     meta.push(`<a href="${project.demo}" target="_blank">demo</a>`);
  //   }
  //   if (project.github) {
  //     const { forks_count: forks = 0, stargazers_count: stars = 0 } = await (
  //       await fetch(`https://api.github.com/repos/soofka/${project.github}`)
  //     ).json();
  //     meta.push(
  //       `<a href="https://github.com/soofka/${project.github}" target="_blank">repo</a>`,
  //       `${stars} stars`,
  //       `${forks} forks`,
  //     );
  //   }
  //   if (project.npm) {
  //     const { downloads = 0 } = await (
  //       await fetch(
  //         `https://api.npmjs.org/downloads/point/2000-01-01:2050-01-01/${project.npm}`,
  //       )
  //     ).json();
  //     project.downloads = downloads;
  //     meta.push(`${downloads} npm installs`);
  //   }
  //   project.meta = meta.join(" | ");
  // }

  return { data, labels };
};
