const head = (data, dists, { lang, url, meta, isIndex }) => `
  <head>
    <meta charset="utf-8">
    <title>${meta.title}</title>
    <meta name="author" content="${data.author}">
    <meta name="description" content="${meta.description}">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:type" content="${data.type}">
    <meta property="og:url" content="${data.url}${url}">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:image" content="me.jpg">
    <meta property="og:image:alt" content="me">

    <meta name="robots" content="index,follow"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="color-scheme" content="${data.themes.map((theme) => theme.name).join(" ")}">

    <link rel="canonical" href="${url}" />
    ${data.langs
      .filter((tempLang) => tempLang !== lang)
      .map(
        (lang) =>
          `<link rel="alternate" href="${url.replace(new RegExp(data.langs.join("|")), lang)}" hreflang="${lang}" />`,
      )
      .join("")}

    ${data.themes
      .map(
        (theme, index) => `
          <meta class="theme-item ${theme.name}-theme-item" name="theme-color" content="${theme.color}" media="(prefers-color-scheme: ${theme.name})"></meta>
          <link class="theme-item ${theme.name}-theme-item" rel="manifest" href="${dists.find((dist) => dist.name === `manifest-${lang}-${theme.name}` && dist.ext === ".webmanifest").rel}" media="${index == 0 ? "" : `(prefers-color-scheme: ${theme.name})`}">
          <link class="theme-item ${theme.name}-theme-item" rel="stylesheet" href="${dists.find((dist) => dist.name === `style-${theme.name}` && dist.ext === ".css").rel}" media="${index == 0 ? "" : `(prefers-color-scheme: ${theme.name})`}">
          <meta name="apple-mobile-web-app-status-bar-style" content="${theme.color}" media="${index == 0 ? "" : `(prefers-color-scheme: ${theme.name})`}">
        `,
      )
      .join("")}
    
    ${dists
      .filter((dist) => dist.name.startsWith("icon-"))
      .map((dist) =>
        dist.name === "icon-16" || dist.name === "icon-32"
          ? `<link rel="icon" type="image/png" sizes="${dist.name === "icon-16" ? "16x16" : "32x32"}" href="${dist.rel}">`
          : `<link rel="apple-touch-icon" sizes="${dist.name.substring(5, 2)}x${dist.name.substring(5, 2)}" href="${dist.rel}">`,
      )
      .join("")}

    ${dists
      .filter(
        (dist) =>
          (dist.name === "style" || (isIndex && dist.name === "style-index")) &&
          dist.ext === ".css",
      )
      .sort((a, b) => (a.name === "style" ? -1 : 0))
      .map((script) => `<link rel="stylesheet" href="${script.rel}">`)
      .join("")}
  </head>
`;

export default head;
