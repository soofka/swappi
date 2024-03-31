const mainItem = (data, dists, { id, name, lang, content }) => {
  const dist = dists.find(
    (dist) =>
      dist.relDir.endsWith(content.id) &&
      dist.name === "index" &&
      dist.ext === ".html",
  );
  return `
    <main>
      <div class="wrapper">
        <section>
          <h2>${content.title}</h2>
          <h4>${content.date}</h4>
          <article>
            <partial name="img" data="${encodeURI(JSON.stringify({ src: content.image, alt: content.title }))}"></partial>
            <h3>${content.description}</h3>
            ${dist.content}
          </article>
        </section>
      </div>
    </main>
  `;
};

export default mainItem;
