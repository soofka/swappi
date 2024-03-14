const head = (data, dists, { lang, url, meta }) => `
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

    ${data.langs
      .map(
        (lang) =>
          `<link rel="alternate" href="${url.replace(new RegExp(`/${data.langs.join("|")}/`), `/${lang}`)}" hreflang="${lang}" />`,
      )
      .join("")}
    <link rel="canonical" href="${url}" />

    ${data.themes
      .map(
        (theme) => `
          <meta class="theme-item ${theme.name}-theme-item" name="theme-color" content="${theme.color}" media="(prefers-color-scheme: ${theme.name})"></meta>
          <link class="theme-item ${theme.name}-theme-item" rel="manifest" href="${dists.find((dist) => dist.name === `manifest-${lang}-${theme.name}` && dist.ext === ".webmanifest").rel}" media="(prefers-color-scheme: ${theme.name})">
          <link class="theme-item ${theme.name}-theme-item" rel="stylesheet" href="${dists.find((dist) => dist.name === `style-${theme.name}` && dist.ext === ".css").rel}" media="(prefers-color-scheme: ${theme.name})">
        `,
      )
      .join("")}
    <meta name="color-scheme" content="${data.themes.map((theme) => theme.name).join(" ")}">
    <link rel="stylesheet" href="${dists.find((dist) => dist.name === "style" && dist.ext === ".css").rel}" />
  </head>
`;

export default head;
