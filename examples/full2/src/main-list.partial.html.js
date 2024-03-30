const mainList = (data, dists, { id, name, lang, content = [] }) => `
  <main>
    <div class="wrapper">
      <section>
        <h2>${data.labels[lang].pages[name].meta.title}</h2>
        ${content.map((item) => getItem(item, name, lang)).join("")}
      </section>
    </div>
  </main>
`;

const getItem = ({ id, title, description, alt, meta }, pageName, lang) => {
  let titleElement = `<h3>${title}</h3>`;
  if (pageName === "articles" || pageName === "blog") {
    const itemPageName = pageName === "articles" ? "article" : "post";
    titleElement = `<partial name="link" data="${encodeURI(
      JSON.stringify({
        pageId: `${itemPageName}-${lang}-${id}`,
        content: titleElement,
      }),
    )}"></partial>`;
  }
  const content = `${getItemLinks(meta)}${getItemStats(meta)}${description}`;
  return alt
    ? getDoubleColumnItem(titleElement, content, alt)
    : getSingleColumnItem(titleElement, content);
};

const getSingleColumnItem = (title, content) => `
  <article>
    <h3>${title}</h3>
    ${content}
  </article>
`;

const getDoubleColumnItem = (title, content, alt) => `
  <article>
    <h3>${title}</h3>
    <div class="col-3-1">
      <div class="col col-3">
        ${content}
      </div>
      <div class="col">
        <partial name="${alt.name}" data="${encodeURI(JSON.stringify(alt.data))}"></partial>
      </div>
    </div>
  </article>`;

const getItemLinks = (itemMeta) =>
  itemMeta && itemMeta.links && itemMeta.links.length > 0
    ? `<h4>${itemMeta.links
        .map(
          (link) =>
            `<a href="${link}" target="_blank">${link.replace(new RegExp("^http://|^https://"), "")}</a>`,
        )
        .join(" | ")}</h4>`
    : "";

const getItemStats = (itemMeta) =>
  itemMeta && itemMeta.stats && itemMeta.stats.length > 0
    ? `<h4>${itemMeta.stats.join(" | ")}</h4>`
    : "";

export default mainList;
