const link = (data, dists, { id = "", lang, page, label, content }) =>
  `<a id=${id} href="${(data.pages[`${page}-${lang}`] && data.pages[`${page}-${lang}`].url) || "#"}">
    ${content ? content : `<partial name="label" data="${encodeURI(JSON.stringify({ id: label, lang }))}"></partial>`}
  </a>`;

export default link;
