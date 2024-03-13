const link = (data, dists, { lang, page, label }) =>
  `<a href="${(data.pages[`${page}-${lang}`] && data.pages[`${page}-${lang}`].url) || "#"}">
    <partial name="label" data="${encodeURI(JSON.stringify({ id: label, lang }))}"></partial>
  </a>`;

export default link;
