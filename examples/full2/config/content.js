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

  for (let article of data.articles) {
    article.meta = { links: [article.publication], stats: [article.date] };
  }

  for (let project of data.projects) {
    const meta = { links: [], stats: [] };
    if (project.demo) {
      meta.links.push(project.demo);
    }
    if (project.github) {
      const { forks_count: forks = 0, stargazers_count: stars = 0 } = await (
        await fetch(`https://api.github.com/repos/soofka/${project.github}`)
      ).json();
      meta.links.push(`https://github.com/soofka/${project.github}`);
      meta.stats.push(`${stars} stars`, `${forks} forks`);
    }
    if (project.npm) {
      const { downloads = 0 } = await (
        await fetch(
          `https://api.npmjs.org/downloads/point/2000-01-01:2050-01-01/${project.npm}`,
        )
      ).json();
      project.downloads = downloads;
      meta.stats.push(`${downloads} npm installs`);
    }
    project.meta = meta;
  }

  for (let talk of data.talks) {
    talk.meta = {
      links: [`https://youtube.com/watch?v=${talk.youtubeId}`],
      stats: [talk.conference, talk.place, talk.date],
    };
    talk.alt = {
      name: "youtube",
      data: { id: talk.youtubeId, title: talk.title, width: 320, height: 190 },
    };
  }

  return { data, labels };
};
