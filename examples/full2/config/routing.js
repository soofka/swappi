export const getRouting = (langs, labels, data) => {
  const routes = {};
  const pages = {};
  const template = "page.template.html";
  const metaSeparator = " | ";

  for (let index in langs) {
    const lang = langs[index];

    const indexPageUrl = `/${lang}/index`;
    const indexPageName = `index-${lang}`;
    const indexPageObject = {
      template,
      pageName: indexPageName,
    };
    if (index == 0) {
      indexPageObject.alts = ["/"];
    }
    routes[indexPageUrl] = indexPageObject;
    pages[indexPageName] = {
      lang,
      url: indexPageUrl,
      type: "cover",
      meta: {
        title: labels[lang].meta.title,
        description: labels[lang].meta.description,
      },
    };

    const articlesPageUrl = `/${lang}/articles`;
    const articlesPageName = `articles-${lang}`;
    routes[articlesPageUrl] = {
      template,
      pageName: articlesPageName,
    };
    pages[articlesPageName] = {
      lang,
      url: articlesPageUrl,
      type: "list",
      meta: {
        title: `${labels[lang].pages.articles.meta.title}${metaSeparator}${labels[lang].meta.title}`,
        description: `${labels[lang].pages.articles.meta.description}${metaSeparator}${labels[lang].meta.description}`,
      },
      content: data.articles,
    };

    for (let article of data.articles) {
      const articlePageUrl = `/${lang}/article/${article.id}`;
      const articlePageName = `article-${lang}-${article.id}`;
      routes[articlePageUrl] = {
        template,
        pageName: articlePageName,
      };
      pages[articlePageName] = {
        lang,
        url: articlePageUrl,
        type: "item",
        meta: {
          title: `${article.title}${metaSeparator}${labels[lang].meta.title}`,
          description: `${article.description}${metaSeparator}${labels[lang].meta.description}`,
        },
      };
    }

    const blogPageUrl = `/${lang}/blog`;
    const blogPageName = `blog-${lang}`;
    routes[blogPageUrl] = {
      template,
      pageName: blogPageName,
    };
    pages[blogPageName] = {
      lang,
      url: blogPageUrl,
      type: "list",
      meta: {
        title: `${labels[lang].pages.blog.meta.title}${metaSeparator}${labels[lang].meta.title}`,
        description: `${labels[lang].pages.blog.meta.description}${metaSeparator}${labels[lang].meta.description}`,
      },
      content: data.blog,
    };

    for (let post of data.blog) {
      const blogPostPageUrl = `/${lang}/blog/${post.id}`;
      const blogPostPageName = `blog-${lang}-${post.id}`;
      routes[blogPostPageUrl] = {
        template,
        pageName: blogPostPageName,
      };
      pages[blogPostPageName] = {
        lang,
        url: blogPostPageUrl,
        type: "item",
        meta: {
          title: `${post.title}${metaSeparator}${labels[lang].meta.title}`,
          description: `${post.description}${metaSeparator}${labels[lang].meta.description}`,
        },
      };
    }

    const coursesPageUrl = `/${lang}/courses`;
    const coursesPageName = `courses-${lang}`;
    routes[coursesPageUrl] = {
      template,
      pageName: coursesPageName,
    };
    pages[coursesPageName] = {
      lang,
      url: coursesPageUrl,
      type: "list",
      meta: {
        title: `${labels[lang].pages.courses.meta.title}${metaSeparator}${labels[lang].meta.title}`,
        description: `${labels[lang].pages.courses.meta.description}${metaSeparator}${labels[lang].meta.description}`,
      },
      content: data.courses,
    };

    const projectsPageUrl = `/${lang}/projects`;
    const projectsPageName = `projects-${lang}`;
    routes[projectsPageUrl] = {
      template,
      pageName: projectsPageName,
    };
    pages[projectsPageName] = {
      lang,
      url: projectsPageUrl,
      type: "list",
      meta: {
        title: `${labels[lang].pages.projects.meta.title}${metaSeparator}${labels[lang].meta.title}`,
        description: `${labels[lang].pages.projects.meta.description}${metaSeparator}${labels[lang].meta.description}`,
      },
      content: data.projects,
    };

    const talksPageUrl = `/${lang}/talks`;
    const talksPageName = `talks-${lang}`;
    routes[talksPageUrl] = {
      template,
      pageName: talksPageName,
    };
    pages[talksPageName] = {
      lang,
      url: talksPageUrl,
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
