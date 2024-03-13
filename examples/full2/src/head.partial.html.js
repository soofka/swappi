const head = (data, dists, partialData) => `
  <head>
    <meta charset="utf-8">
    <title>${partialData.meta.title}</title>
    <meta name="author" content="${data.author}">
    <meta name="description" content="${partialData.meta.description}">
    <meta property="og:title" content="${partialData.meta.title}">
    <meta property="og:type" content="${data.type}">
    <meta property="og:url" content="${partialData.url}">
    <meta property="og:description" content="${partialData.meta.description}">
    <meta property="og:image" content="me.jpg">
    <meta property="og:image:alt" content="me">

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
          `<link rel="alternate" href="${partialData.url.replace(new RegExp(`/${data.langs.join("|")}/`), `/${lang}`)}" hreflang="${lang}" />`,
      )
      .join("")}
    <link rel="canonical" href="${partialData.url}" />

    ${data.themes
      .map(
        (theme, index) =>
          `<link rel="manifest" href="${dists.find((dist) => dist.name === `manifest-${data.langs[0]}-${theme.name}` && dist.ext === ".webmanifest").rel}" ${index > 0 ? `media="(prefers-color-scheme: ${theme.name})"` : ""}>`,
      )
      .join("")}

    <link rel="stylesheet" href="${dists.find((dist) => dist.name === "style" && dist.ext === ".css").rel}" />
    ${dists
      .filter((dist) => dist.name.startsWith("style-") && dist.ext === ".css")
      .map(
        (style) =>
          `<link rel="stylesheet" href="${style.rel}" ${style.name === `style-${data.themes[0].name}` ? "" : `media="(prefers-color-scheme: ${data.themes[1].name})"`} />`,
      )
      .join("")}
  </head>
`;

export default head;
