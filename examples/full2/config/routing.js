export const getRouting = (langs, labels, data) => {
  const routes = {};
  const pages = [];
  const template = "page.template.html";

  const indexPageName = "index";
  const articlesPageName = "articles";
  const articlePageName = "article";
  const blogPageName = "blog";
  const blogPostPageName = "post";
  const coursesPageName = "courses";
  const projectsPageName = "projects";
  const talksPageName = "talks";

  for (let index in langs) {
    const lang = langs[index];

    const indexPageUrl = `/${lang}/${indexPageName}`;
    const indexPageId = `${indexPageName}-${lang}`;
    const indexPageObject = {
      template,
      pageId: indexPageId,
      alts: [`/${lang}`],
    };
    if (index == 0) {
      indexPageObject.alts.push("/");
    }
    routes[indexPageUrl] = indexPageObject;
    pages.push({
      id: indexPageId,
      url: indexPageUrl,
      name: indexPageName,
      lang,
      type: "cover",
    });

    const articlesPageUrl = `/${lang}/${articlesPageName}`;
    const articlesPageId = `${articlesPageName}-${lang}`;
    routes[articlesPageUrl] = {
      template,
      pageId: articlesPageId,
    };
    pages.push({
      id: articlesPageId,
      url: articlesPageUrl,
      name: articlesPageName,
      lang,
      type: "list",
      meta: {
        title: labels[lang].pages.articles.meta.title,
        description: labels[lang].pages.articles.meta.description,
      },
      content: data.articles,
    });

    for (let article of data.articles) {
      const articlePageUrl = `/${lang}/${articlePageName}/${parseTitleToUrl(article.title)}`;
      const articlePageId = `${articlePageName}-${lang}-${article.id}`;
      routes[articlePageUrl] = {
        template,
        pageId: articlePageId,
      };
      pages.push({
        id: articlePageId,
        url: articlePageUrl,
        name: articlePageName,
        lang,
        type: "item",
        meta: {
          title: article.title,
          description: article.description,
          image: article.image,
        },
        content: article,
      });
    }

    const blogPageUrl = `/${lang}/${blogPageName}`;
    const blogPageId = `${blogPageName}-${lang}`;
    routes[blogPageUrl] = {
      template,
      pageId: blogPageId,
    };
    pages.push({
      id: blogPageId,
      url: blogPageUrl,
      name: blogPageName,
      lang,
      type: "list",
      meta: {
        title: labels[lang].pages.blog.meta.title,
        description: labels[lang].pages.blog.meta.description,
      },
      content: data.blog,
    });

    for (let post of data.blog) {
      const blogPostPageUrl = `/${lang}/${blogPostPageName}/${parseTitleToUrl(post.title)}`;
      const blogPostPageId = `${blogPostPageName}-${lang}-${post.id}`;
      routes[blogPostPageUrl] = {
        template,
        pageId: blogPostPageId,
      };
      pages.push({
        id: blogPostPageId,
        url: blogPostPageUrl,
        name: blogPostPageName,
        lang,
        type: "item",
        meta: {
          title: post.title,
          description: post.description,
        },
        content: post,
      });
    }

    const coursesPageUrl = `/${lang}/${coursesPageName}`;
    const coursesPageId = `${coursesPageName}-${lang}`;
    routes[coursesPageUrl] = {
      template,
      pageId: coursesPageId,
    };
    pages.push({
      id: coursesPageId,
      url: coursesPageUrl,
      name: coursesPageName,
      lang,
      type: "list",
      meta: {
        title: labels[lang].pages.courses.meta.title,
        description: labels[lang].pages.courses.meta.description,
      },
      content: data.courses,
    });

    const projectsPageUrl = `/${lang}/${projectsPageName}`;
    const projectsPageId = `${projectsPageName}-${lang}`;
    routes[projectsPageUrl] = {
      template,
      pageId: projectsPageId,
    };
    pages.push({
      id: projectsPageId,
      url: projectsPageUrl,
      name: projectsPageName,
      lang,
      type: "list",
      meta: {
        title: labels[lang].pages.projects.meta.title,
        description: labels[lang].pages.projects.meta.description,
      },
      content: data.projects,
    });

    const talksPageUrl = `/${lang}/${talksPageName}`;
    const talksPageId = `${talksPageName}-${lang}`;
    routes[talksPageUrl] = {
      template,
      pageId: talksPageId,
    };
    pages.push({
      id: talksPageId,
      url: talksPageUrl,
      name: talksPageName,
      lang,
      type: "list",
      meta: {
        title: labels[lang].pages.talks.meta.title,
        description: labels[lang].pages.talks.meta.description,
      },
      content: data.talks,
    });
  }

  for (let route of Object.keys(routes)) {
    if (!route.endsWith("/")) {
      routes[`${route}/`] = { ...routes[route] };
    }
  }

  return { routes, pages };
};

const parseTitleToUrl = (title) =>
  title
    ? title
        .trim()
        .toLowerCase()
        .replaceAll(new RegExp("[^a-zA-Z0-9]", "g"), "-")
    : title;
