export const getRouting = (langs, labels, data) => {
  const routes = {};
  const pages = {};
  const template = "page.template.html";
  const metaSeparator = " | ";

  for (let index in langs) {
    const lang = langs[index];
    if (!Object.hasOwn(pages, lang)) {
      pages[lang] = {};
    }

    const indexPageName = "index";
    const indexPageObject = {
      template,
      pageName: indexPageName,
    };
    if (index == 0) {
      indexPageObject.alts = ["/"];
    }
    routes[`/${lang}/index`] = indexPageObject;
    pages[lang][indexPageName] = {
      type: "cover",
      meta: {
        title: labels[lang].meta.title,
        description: labels[lang].meta.description,
      },
    };

    const articlesPageName = "articles";
    routes[`/${lang}/articles`] = {
      template,
      pageName: articlesPageName,
    };
    pages[lang][articlesPageName] = {
      type: "list",
      meta: {
        title: `${labels[lang].pages.articles.meta.title}${metaSeparator}${labels[lang].meta.title}`,
        description: `${labels[lang].pages.articles.meta.description}${metaSeparator}${labels[lang].meta.description}`,
      },
      content: data.articles,
    };

    for (let article of data.articles) {
      const articlePageName = `article/${article.id}`;
      routes[`/${lang}/article/${article.id}`] = {
        template,
        pageName: articlePageName,
      };
      pages[lang][articlePageName] = {
        type: "item",
        meta: {
          title: `${article.title}${metaSeparator}${labels[lang].meta.title}`,
          description: `${article.description}${metaSeparator}${labels[lang].meta.description}`,
        },
      };
    }

    const blogPageName = "blog";
    routes[`/${lang}/blog`] = {
      template,
      pageName: blogPageName,
    };
    pages[lang][blogPageName] = {
      type: "list",
      meta: {
        title: `${labels[lang].pages.blog.meta.title}${metaSeparator}${labels[lang].meta.title}`,
        description: `${labels[lang].pages.blog.meta.description}${metaSeparator}${labels[lang].meta.description}`,
      },
      content: data.blog,
    };

    for (let post of data.blog) {
      const blogPostPageName = `blog/${post.id}`;
      routes[`/${lang}/blog/${post.id}`] = {
        template,
        pageName: blogPostPageName,
      };
      pages[lang][blogPostPageName] = {
        type: "item",
        meta: {
          title: `${post.title}${metaSeparator}${labels[lang].meta.title}`,
          description: `${post.description}${metaSeparator}${labels[lang].meta.description}`,
        },
      };
    }

    const coursesPageName = "courses";
    routes[`/${lang}/courses`] = {
      template,
      pageName: coursesPageName,
    };
    pages[lang][coursesPageName] = {
      type: "list",
      meta: {
        title: `${labels[lang].pages.courses.meta.title}${metaSeparator}${labels[lang].meta.title}`,
        description: `${labels[lang].pages.courses.meta.description}${metaSeparator}${labels[lang].meta.description}`,
      },
      content: data.courses,
    };

    const projectsPageName = "projects";
    routes[`/${lang}/projects`] = {
      template,
      pageName: projectsPageName,
    };
    pages[lang][projectsPageName] = {
      template: "page.template.html",
      type: "list",
      meta: {
        title: `${labels[lang].pages.projects.meta.title}${metaSeparator}${labels[lang].meta.title}`,
        description: `${labels[lang].pages.projects.meta.description}${metaSeparator}${labels[lang].meta.description}`,
      },
      content: data.projects,
    };

    const talksPageName = "talks";
    routes[`/${lang}/talks`] = {
      template,
      pageName: talksPageName,
    };
    pages[lang][talksPageName] = {
      type: "list",
      meta: {
        title: `${labels[lang].pages.talks.meta.title}${metaSeparator}${labels[lang].meta.title}`,
        description: `${labels[lang].pages.talks.meta.description}${metaSeparator}${labels[lang].meta.description}`,
      },
      content: data.talks,
    };
  }

  return { routes, pages };
};
