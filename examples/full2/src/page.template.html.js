const page = (data, dists, lang, url, type, meta, content) => `
  <!doctype html>
  <html lang="${lang}">
    <head>
      <title>CO JEST KURWA</title>
      <partial name="head" data="${encodeURI(JSON.stringify({ url, meta }))}"></partial>
    </head>
    <body class="${type === "cover" ? "cover" : ""}">
      <header>
        <div class="wrapper">
          <nav>
            <ul>
              <a href="#" id="logo"><li><h4>swn.ski</h4></li></a>
              <a href="#"><li>
                <partial name="label" data="${encodeURI(JSON.stringify({ id: "nav.home", lang }))}"></partial>
              </li></a><a href="#"><li>
                <partial name="label" data="${encodeURI(JSON.stringify({ id: "nav.courses", lang }))}"></partial>
              </li></a><a href="#"><li>
                <partial name="label" data="${encodeURI(JSON.stringify({ id: "nav.talks", lang }))}"></partial>
              </li></a><a href="#"><li>
                <partial name="label" data="${encodeURI(JSON.stringify({ id: "nav.articles", lang }))}"></partial>
              </li></a><a href="#"><li>
                <partial name="label" data="${encodeURI(JSON.stringify({ id: "nav.blog", lang }))}"></partial>
              </li></a>
            </ul>
            <ul>
              <a href="#" id="lang-toggle"><li>pl</li></a
              ><a href="#" id="theme-toggle"><li>light</li></a>
            </ul>
          </nav>
        </div>
      </header>
      <partial name="main" data="${encodeURI(JSON.stringify({ lang, type, content }))}"></partial>
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
    for (let lang of Object.keys(data.pages)) {
      for (let pageName of Object.keys(data.pages[lang])) {
        const { url, type, meta, content } = data.pages[lang][pageName];
        dists.push({
          name: pageName,
          content: (data, dists) =>
            page(data, dists, lang, url, type, meta, content),
          resetContentHash: true,
          contentHashSalt: JSON.stringify({ lang, url, type, meta, content }),
        });
      }
    }
    return dists;
  },
};
