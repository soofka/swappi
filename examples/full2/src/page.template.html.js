const page = (data, dists, lang, url, type, meta, content) => `
  <!doctype html>
  <html lang="${lang}">
    <partial name="head" data="${encodeURI(JSON.stringify({ url, meta }))}"></partial>
    <body class="${type}">
      <header>
        <div class="wrapper">
          <nav>
            <ul>
              <a href="#" id="logo"><li><h4>swn.ski</h4></li></a>
              <li><partial name="link" data="${encodeURI(JSON.stringify({ lang, page: "index", label: "nav.home" }))}"></partial></li>
              <li><partial name="link" data="${encodeURI(JSON.stringify({ lang, page: "courses", label: "nav.courses" }))}"></partial></li>
              <li><partial name="link" data="${encodeURI(JSON.stringify({ lang, page: "talks", label: "nav.talks" }))}"></partial></li>
              <li><partial name="link" data="${encodeURI(JSON.stringify({ lang, page: "articles", label: "nav.articles" }))}"></partial></li>
              <li><partial name="link" data="${encodeURI(JSON.stringify({ lang, page: "blog", label: "nav.blog" }))}"></partial></li>
            </ul>
            <ul>
              <a href="#" id="lang-toggle"><li>pl</li></a
              ><a href="#" id="theme-toggle"><li>light</li></a>
            </ul>
          </nav>
        </div>
      </header>
      <partial name="main-${type}" data="${encodeURI(JSON.stringify({ lang, content }))}"></partial>
      <footer>
        <div class="wrapper">
          <p>
            <small
              >swn.ski 2007-2024 | powered by <a href="#">swappi</a> |
              <a href="#">repo</a></small
            >
          </p>
        </div>
      </footer>
      ${dists
        .filter((dist) => dist.name.startsWith("script") && dist.ext === ".js")
        .map((script) => `<script src="${script.rel}"></script>`)
        .join("")}
    </body>
  </html>
`;

export default {
  generate: (data) => {
    const dists = [];
    for (let pageName of Object.keys(data.pages)) {
      const { lang, url, type, meta, content } = data.pages[pageName];
      console.log(pageName, data.pages[pageName]);
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
