const mainList = (data, dists, { content = [] }) => `
  <main>
    <div class="wrapper">
      <section>
        ${content
          .map(
            (item) => `
          <article>
            <h2>${item.title}</h2>
            ${
              Object.hasOwn(item, "alt")
                ? `
                <div class="col-3-1">
                  <div class="col">
                    ${item.alt}
                  </div>
                  <div class="col col-3">
                    <h4>${item.meta}</h4>
                    ${item.description}
                  </div>
                </div>
              `
                : `
                <h4>${item.meta}</h4>
                ${item.description}
              `
            }
          </article>
        `,
          )
          .join("")}
      </section>
    </div>
  </main>
`;

export default mainList;
