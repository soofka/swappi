const page = (data, dists, { id, url, name, lang, type, meta, content }) => {
  const isIndex = name === "index";
  const getMailLink = (content) =>
    `<a href="mailto:j@swn.ski">${content || "j[at]swn.ski"}</a>`;
  const getMenuLink = (pageName) =>
    `<li class="${name === pageName ? "active" : ""}">
      <partial name="link" data="${encodeURI(
        JSON.stringify({
          pageId: `${pageName}-${lang}`,
          content: data.labels[lang].nav[pageName],
        }),
      )}"></partial>
    </li>`;

  return `
    <!doctype html>
    <html lang="${lang}">
      <partial name="head" data="${encodeURI(JSON.stringify({ url, lang, meta, isIndex }))}"></partial>
      <body class="${type}">
        <header>
          <div class="wrapper">
            <nav>
              <div id="controls">
                <partial name="link" data="${encodeURI(
                  JSON.stringify({
                    id: "logo",
                    pageId: `index-${lang}`,
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
        <partial name="main-${type}" data="${encodeURI(JSON.stringify({ id, name, lang, content }))}"></partial>
        <footer>
          <section id="contact">
            <div class="wrapper">
              <article>
                ${
                  isIndex
                    ? `<h2>${data.labels[lang].pages.home.contact.head}</h2>
                      <div>
                        <ul>
                          <li><h3 class="architect-fg" style="width:auto;margin:0;padding:0;">Architecture offer?</h3></li>
                          <li><h3 class="developer-fg" style="width:auto;margin:0;padding:0;">Development offer?</h3></li>
                          <li><h3 class="leader-fg" style="width:auto;margin:0;padding:0;">Leadership offer?</h3></li>
                          <li><h3 class="teacher-fg" style="width:auto;margin:0;padding:0;">Teachingship offer?</h3></li>
                        </ul>
                        ${getMailLink('<h3 id="contact-mail">j[at]swn.ski</h3>')}
                      </div>`
                    : ""
                }
                <div>
                  <p>
                    ${getMailLink()}
                    | <a href="https://linkedin.com/in/jakub-sowi%C5%84ski/" target="_blank">linkedin</a>
                    | <a href="https://github.com/soofka/" target="_blank">github</a>
                    | <a href="https://last.fm/user/soofka/" target="_blank">last.fm</a>
                  </p>
                  <p><small>
                    swn.ski 2007-2024
                    | <a href="https://europa.eu/youreurope/business/running-business/intellectual-property/copyright/index_en.htm" target="_blank">${data.labels[lang].misc.allRightsReserved}</a>
                    | <a href="#">repo</a>
                  </small></p>
                </div>
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
  generate: (data) =>
    data.pages.map((pageData) => ({
      name: pageData.id,
      content: (data, dists) => page(data, dists, pageData),
      resetContentHash: true,
      contentHashSalt: `${pageData.id}${JSON.stringify(pageData.content)}`,
    })),
};
