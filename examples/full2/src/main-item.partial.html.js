const mainItem = (data, dists, { id, name, lang, content }) => {
  const dist = dists.find(
    (dist) =>
      dist.relDir.endsWith(id.substring(name.length + lang.length + 2)) &&
      dist.name === "index" &&
      dist.ext === ".html",
  );
  return `
    <main>
      <div class="wrapper">
        <section>
          <partial name="img" data="${encodeURI(JSON.stringify({ src: "microfrontends_1.jpg", alt: content.title }))}"></partial>
          <h2>${content.title}</h2>
          <h3>${content.date}</h3>
          <article>
            ${dist ? dist.content : "error"}
          </article>
        </section>
      </div>
    </main>
  `;
};

export default mainItem;
