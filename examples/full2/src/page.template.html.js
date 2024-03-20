const page = (data, dists, pageName, lang, url, type, meta, content) => {
  const name = pageName.substring(0, pageName.length - lang.length - 1);
  const isIndex = name === "index";
  const mailLink = '<a href="mailto:j@swn.ski">j[at]swn.ski</a>';
  const getMenuLink = (page) =>
    `<li class="${name === page ? "active" : ""}"><partial name="link" data="${encodeURI(JSON.stringify({ page: `${page}-${lang}`, content: data.labels[lang].nav[page] }))}"></partial></li>`;
  return `
    <!doctype html>
    <html lang="${lang}">
      <partial name="head" data="${encodeURI(JSON.stringify({ lang, url, meta, isIndex }))}"></partial>
      <body class="${type}">
        <header>
          <div class="wrapper">
            <nav>
              <div id="controls">
                <partial name="link" data="${encodeURI(
                  JSON.stringify({
                    id: "logo",
                    page: `index-${lang}`,
                    content:
                      '<h4><span class="architect-fg">s</span><span class="developer-fg">w</span><span class="leader-fg">n</span><span class="teacher-fg">.</span>ski</h4>',
                  }),
                )}"></partial>
                <button id="menu-toggle" aria-label="Menu"> </button>
              </div>
              <div id="menu">
                <ul class="horizontal-list">
                  ${getMenuLink("projects")}
                  ${getMenuLink("courses")}
                  ${getMenuLink("talks")}
                  ${getMenuLink("articles")}
                  ${getMenuLink("blog")}
                  ${data.langs
                    .filter((tempLang) => tempLang !== lang)
                    .map(
                      (otherLang) =>
                        `<li><a href="${url.replace(`/${lang}/`, `/${otherLang}/`)}">${otherLang}</a></li>`,
                    )}
                  <li><a href="" id="theme-toggle"> </a></li>
                </ul>
              </div>
            </nav>
          </div>
        </header>
        <partial name="main-${type}" data="${encodeURI(JSON.stringify({ lang, content }))}"></partial>
        <footer>
          <section id="contact">
            <div class="wrapper">
              <article>
                <h2>${data.labels[lang].pages.home.contact.head}</h2>
                <div>
                  ${isIndex ? `<h3>${data.labels[lang].pages.home.contact.lead} ${mailLink}</h3>` : ""}
                  ${isIndex ? `<p>${data.labels[lang].pages.home.contact.text}</p>` : ""}
                  <ul>
                    ${isIndex ? "" : `<li>${mailLink}</li>`}
                    <li><a href="https://linkedin.com/in/jakub-sowi%C5%84ski/" target="_blank">linkedin.com/in/jakub-sowiński</a></li>
                    <li><a href="https://github.com/soofka/" target="_blank">github.com/soofka</a<></li>
                    <li><a href="https://last.fm/user/soofka/" target="_blank">last.fm/soofka</a></li>
                  </ul>
                </div>
                <p><small>swn.ski 2007-2024 | powered by <a href="#">swappi</a> | <a href="#">repo</a></small></p>
                </article>
              </div>
          </section>
        </footer>
        ${dists
          .filter(
            (dist) =>
              (dist.name === "script" ||
                (isIndex && dist.name === "script-index")) &&
              dist.ext === ".js",
          )
          .map((script) => `<script src="${script.rel}"> </script>`)
          .join("")}
      </body>
    </html>
  `;
};

export default {
  generate: (data) => {
    const dists = [];
    for (let pageName of Object.keys(data.pages)) {
      const { lang, url, type, meta, content } = data.pages[pageName];
      dists.push({
        name: pageName,
        content: (data, dists) =>
          page(data, dists, pageName, lang, url, type, meta, content),
        resetContentHash: true,
        contentHashSalt: JSON.stringify({
          name: pageName,
          lang,
          url,
          type,
          meta,
          content,
        }),
      });
    }
    return dists;
  },
};
