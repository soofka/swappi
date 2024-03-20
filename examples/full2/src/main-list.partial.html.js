const mainList = (data, dists, { lang, content = [] }) => {
  return `
    <main>
      <div class="wrapper">
        <section>
          <h2>Projects</h2>
          ${content
            .map((item) => {
              const content = `
                <h4>${item.meta && item.meta.links ? item.meta.links.join(" | ") : "none"}</h4>
                <h4>${item.meta && item.meta.stats ? item.meta.stats.join(" | ") : "none"}</h4>
                ${item.description}`;
              return Object.hasOwn(item, "alt")
                ? getItemWithAlt(item.title, content, item.alt)
                : getItem(item.title, content);
            })
            .join("")}
        </section>
      </div>
  </main>`;
};

const getItem = (title, content) => `
  <article>
    <h3>${title}</h3>
    ${content}
  </article>
`;

const getItemWithAlt = (title, content, alt, left = true) => {
  const altCol = `<div class="col">${alt}</div>`;
  return `
  <article>
    <h3>${title}</h3>
    <div class="col-3-1">
      ${left && altCol};
      <div class="col col-3">
        ${content}
      </div>
      ${!left && altCol};
    </div>
  </article>
`;
};

export default mainList;
