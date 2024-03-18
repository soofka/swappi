const page = (data, dists, pageName, lang, url, type, meta, content) => {
  const name = pageName.substring(0, pageName.length - lang.length - 1);
  const isIndex = name === "index";
  const theOtherLang = lang === "pl" ? "en" : "pl";
  const getMenuLink = (page) =>
    // `<partial name="link" data="${encodeURI(JSON.stringify({ lang, page, content: `<li class="${name === page ? "active" : ""}"><partial name="label" data="${encodeURI(JSON.stringify({ lang, id: `nav.${page}` }))}"></partial></li>` }))}"></partial>`;
    `<li class="${name === page ? "active" : ""}"><partial name="link" data="${encodeURI(JSON.stringify({ lang, page, label: `nav.${page}` }))}"></partial></li>`;
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
                    lang,
                    page: "index",
                    content:
                      '<h4><span class="architect-fg">s</span><span class="developer-fg">w</span><span class="leader-fg">n</span><span class="teacher-fg">.</span>ski</h4>',
                  }),
                )}"></partial>
                <button id="menu-toggle">☰</button>
              </div>
              <div id="menu">
                <ul>
                  ${getMenuLink("projects")}
                  ${getMenuLink("courses")}
                  ${getMenuLink("talks")}
                  ${getMenuLink("articles")}
                  ${getMenuLink("blog")}
                  <li><a href="${url.replace(`/${lang}/`, `/${theOtherLang}/`)}">${theOtherLang}</a></li>
                  <li><a id="theme-toggle">&nbsp;</a></li>
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
                <h2><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.contact.head", lang }))}"></partial></h2>
                <div>
                  <h3><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.contact.lead", lang }))}"></partial></h3>
                  <p><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.contact.text", lang }))}"></partial></p>
                  <ul>
                    <li><a href="https://linkedin.com/in/jakub-sowi%C5%84ski/" target="_blank">linkedin.com/in/jakub-sowiński/</a></li>
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
