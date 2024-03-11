const page = (data, dists, key) => {
  const { type, meta, content } = data.routes[key];
  const metaData = encodeURI(JSON.stringify(meta));
  const mainData = encodeURI(JSON.stringify({ type, content }));

  return `
    <!doctype html>
    <html lang="${data.lang}">
      <head>
        <partial name="meta" data="${metaData}"></partial>
        <meta name="robots" content="index,follow"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      
        ${data.themes
          .map(
            (theme, index) =>
              `<meta name="theme-color" content="${theme.color}" ${index > 0 ? `media="(prefers-color-scheme: ${theme.name})"` : ""}></meta>`,
          )
          .join("")}
        <meta name="color-scheme" content="${data.themes.map((theme) => theme.name).join(" ")}">
      
        ${data.langs
          .map(
            (lang) =>
              `<link rel="alternate" href="${data.url}?lang=${lang}" hreflang="${lang}" />`,
          )
          .join("")}
        <link rel="canonical" href="${data.url}" />

        ${data.themes
          .map(
            (theme, index) =>
              `<link rel="manifest" href="${dists.find((dist) => dist.name === `manifest-${data.langs[0]}-${theme.name}` && dist.ext === ".webmanifest").rel}" ${index > 0 ? `media="(prefers-color-scheme: ${theme.name})"` : ""}>`,
          )
          .join("")}
      
        <link rel="stylesheet" href="${dists.find((dist) => dist.name === "style" && dist.ext === ".css").rel}" />
        ${dists
          .filter(
            (dist) => dist.name.startsWith("style-") && dist.ext === ".css",
          )
          .map(
            (style) =>
              `<link rel="stylesheet" href="${style.rel}" ${style.name === `style-${data.themes[0].name}` ? "" : `media="(prefers-color-scheme: ${data.themes[1].name})"`} />`,
          )
          .join("")}
      </head>
      <body class="${type === "cover" ? "cover" : ""}">
        <header>
          <div class="wrapper">
            <nav>
              <ul>
                <a href="#" id="logo"
                  ><li><h4>swn.ski</h4></li></a
                ><a href="#"><li>projects</li></a
                ><a href="#"><li>courses</li></a
                ><a href="#"><li>talks</li></a
                ><a href="#"><li>articles</li></a
                ><a href="#"><li>blog</li></a>
              </ul>
              <ul>
                <a href="#" id="lang-toggle"><li>pl</li></a
                ><a href="#" id="theme-toggle"><li>light</li></a>
              </ul>
            </nav>
          </div>
        </header>
        <partial name="main" data="${mainData}"></partial>
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
          .filter(
            (dist) => dist.name.startsWith("script") && dist.ext === ".js",
          )
          .map((script) => `<script src="${script.rel}"></script>`)
          .join("")}
      </body>
    </html>
  `;
};

export default {
  generate: (data) => {
    const dists = [];
    for (let key of Object.keys(data.routes)) {
      dists.push({
        name: key,
        content: (data, dists) => page(data, dists, key),
      });
    }
    return dists;
  },
};
