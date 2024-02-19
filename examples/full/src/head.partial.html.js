// USE FILES FOR ICONS
const head = (data, dists, htmlElement) => `
  <meta charset="utf-8">
  <title>${data.labels[data.langs[0]].meta.title}</title>
  <meta name="author" content="${data.author}">
  <meta name="description" content="${data.labels[data.langs[0]].meta.description}">
  <meta property="og:title" content="${data.labels[data.langs[0]].meta.title}">
  <meta property="og:type" content="${data.type}">
  <meta property="og:url" content="${data.url}">
  <meta property="og:description" content="${data.labels[data.langs[0]].meta.description}">
  <meta property="og:image" content="me.jpg">
  <meta property="og:image:alt" content="me">
  
  <meta name="robots" content="index,follow"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  ${data.themes
    .map((theme, index) => {
      const media =
        index > 0 ? `media="(prefers-color-scheme: ${theme.name})"` : "";
      return `
          <meta name="theme-color" content="${theme.color}" ${media}></meta>
          <link rel="manifest" href="${dists.find((dist) => dist.name === `manifest-${data.langs[0]}-${theme.name}` && dist.ext === ".webmanifest").rel}" ${media}>
      `;
    })
    .join("")}
  <meta name="color-scheme" content="${data.themes.map((theme) => theme.name).join(" ")}">

  ${data.langs
    .map(
      (lang) =>
        `<link rel="alternate" href="${data.url}?lang=${lang}" hreflang="${lang}" />`,
    )
    .join("")}
  <link rel="canonical" href="${data.url}" />

  <link rel="stylesheet" href="${dists.find((dist) => dist.name === "style" && dist.ext === ".css").rel}" />
  ${dists
    .filter((dist) => dist.name.startsWith("style-") && dist.ext === ".css")
    .map(
      (style) =>
        `<link rel="stylesheet" href="${style.rel}" ${style.name === `style-${data.themes[0].name}` ? "" : `media="(prefers-color-scheme: ${data.themes[1].name})"`} />`,
    )
    .join("")}
`;

export default head;
