const page = (data, dists, lang, url, type, meta, content) => {
  const theOtherLang = lang === "pl" ? "en" : "pl";
  return `
    <!doctype html>
    <html lang="${lang}">
      <partial name="head" data="${encodeURI(JSON.stringify({ lang, url, meta }))}"></partial>
      <body class="${type}">
        <header>
          <div class="wrapper">
            <button id="menu-toggle">a</button>
            <nav>
              <ul>
                <li><partial name="link" data="${encodeURI(JSON.stringify({ lang, page: "index", content: '<h4><span class="architect-fg">s</span><span class="developer-fg">w</span><span class="leader-fg">n</span>.ski</h4>' }))}"></partial></li>
                <li><partial name="link" data="${encodeURI(JSON.stringify({ lang, page: "projects", label: "nav.projects" }))}"></partial></li>
                <li><partial name="link" data="${encodeURI(JSON.stringify({ lang, page: "courses", label: "nav.courses" }))}"></partial></li>
                <li><partial name="link" data="${encodeURI(JSON.stringify({ lang, page: "talks", label: "nav.talks" }))}"></partial></li>
                <li><partial name="link" data="${encodeURI(JSON.stringify({ lang, page: "articles", label: "nav.articles" }))}"></partial></li>
                <li><partial name="link" data="${encodeURI(JSON.stringify({ lang, page: "blog", label: "nav.blog" }))}"></partial></li>
              </ul>
              <ul>
                <li><a href="${url.replace(`/${lang}/`, `/${theOtherLang}/`)}">${theOtherLang}</a></li>
                <li><a id="theme-toggle"> </a></li>
              </ul>
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
                </div>
                <p><small>swn.ski 2007-2024 | powered by <a href="#">swappi</a> | <a href="#">repo</a></small></p>
              </article>
            </div>
          </section>
        </footer>
        ${dists
          .filter(
            (dist) => dist.name.startsWith("script") && dist.ext === ".js",
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
          page(data, dists, lang, url, type, meta, content),
        resetContentHash: true,
        contentHashSalt: JSON.stringify({ lang, url, type, meta, content }),
      });
    }
    return dists;
  },
};
