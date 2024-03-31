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

const getItem = (item, pageName, lang) => {
  let title = `<h3>${item.title}</h3>`;
  let content = `<p>${item.description}</p>`;
  let meta = item.date;
  let alt;

  switch (pageName) {
    case "articles":
      title = `<partial name="link" data="${encodeURI(
        JSON.stringify({
          pageId: `article-${lang}-${item.id}`,
          content: title,
        }),
      )}"></partial>`;
      if (item.publications && item.publications.length > 0) {
        meta = `${meta} | published by ${item.publications.map((publication) => `<a href="${publication.url}" target="_blank">${publication.name}</a>`).join(", ")}`;
      }
      alt = `<partial name="img" data="${encodeURI(JSON.stringify({ src: item.image, alt: item.title }))}"></partial>`;
      break;

    case "blog":
      title = `<partial name="link" data="${encodeURI(
        JSON.stringify({
          pageId: `post-${lang}-${item.id}`,
          content: title,
        }),
      )}"></partial>`;
      alt = `<partial name="img" data="${encodeURI(JSON.stringify({ src: item.image, alt: item.title }))}"></partial>`;
      break;

    case "courses":
      if (item.clients && item.clients.length > 0) {
        meta = `${meta} | taught for ${item.clients.join(", ")}`;
      }
      alt = `<ul>${item.content.map((item) => `<li>${item}</li>`).join("")}</ul>`;
      break;

    case "projects":
      const metaItems = [meta];
      if (item.demo) {
        metaItems.push(`<a href="${item.demo}" target="_blank">demo</a>`);
      }
      if (item.github) {
        metaItems.push(
          `<a href="https://github.com/soofka/${item.github}" target="_blank">github</a> (${item.stars} stars, ${item.forks} forks)`,
        );
      }
      if (item.npm) {
        metaItems.push(
          `<a href="https://npmjs.com/package/${item.npm}" target="_blank">npm</a> (${item.downloads} downloads)`,
        );
      }
      meta = metaItems.join(" | ");
      break;

    case "talks":
      meta = `${meta} | ${item.conference}, ${item.place} | <a href="https://youtube.com/watch?v=${item.youtube}" target="_blank">youtube</a>`;
      alt = `<partial name="youtube" data="${encodeURI(JSON.stringify({ id: item.youtube, title: item.title, width: 320, height: 190 }))}"></partial>`;
      break;

    default:
      break;
  }

  meta = `<h4>${meta}</h4>`;
  return alt
    ? getDoubleColumnItem(title, meta, content, alt)
    : getSingleColumnItem(title, meta, content);
};

const getSingleColumnItem = (title, meta, content) => `
  <article>
    ${title}
    ${meta}
    ${content}
  </article>
`;

const getDoubleColumnItem = (title, meta, content, alt) => `
  <article>
    <div class="col-3-1">
      <div class="col col-3">
        ${title}
        ${meta}
        ${content}
      </div>
      <div class="col">
        ${alt}
      </div>
    </div>
  </article>`;

export default mainList;
