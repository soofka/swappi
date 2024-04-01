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

  for (let project of data.projects) {
    if (project.github) {
      const { forks_count = 0, stargazers_count = 0 } = await (
        await fetch(`https://api.github.com/repos/soofka/${project.github}`)
      ).json();
      project.stars = stargazers_count;
      project.forks = forks_count;
    }
    if (project.npm) {
      const { downloads = 0 } = await (
        await fetch(
          `https://api.npmjs.org/downloads/point/2000-01-01:2050-01-01/${project.npm}`,
        )
      ).json();
      project.installs = downloads;
    }
  }

  return { data, labels };
};
