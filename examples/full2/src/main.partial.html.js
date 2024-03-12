const mainCover = (lang) => `
  <main>
    <section id="hero">
      <div class="wrapper">
        <h1>Jakub Sowiński</h1>
      </div>
    </section>
    <section id="intro">
      <div class="wrapper">
        <article>
          <h1><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.intro.head", lang }))}"></partial></h1>
          <div class="col-3-1">
            <div class="col col-3">
              <h3><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.intro.lead", lang }))}"></partial></h3>
              <p><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.intro.text", lang }))}"></partial></p>
              <div class="buttons">
                <button><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.intro.info", lang }))}"></partial></button>
                <button><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.intro.contact", lang }))}"></partial></button>
              </div>
            </div>
            <div class="col"><partial name="img" data="${encodeURI(JSON.stringify({ src: "me2.jpg" }))}"></partial></div>
          </div>
        </article>
      </div>
    </section>
    <section id="architect">
      <div class="wrapper">
        <article>
          <h2><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.architect.head", lang }))}"></partial></h2>
          <div class="col-3-1">
            <div class="col"><partial name="img" data="${encodeURI(JSON.stringify({ src: "me2.jpg" }))}"></div>
            <div class="col col-3">
              <h3><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.architect.lead", lang }))}"></partial></h3>
              <p><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.architect.text", lang }))}"></partial></p>
              <div class="buttons">
                <button><partial name="label" data="${encodeURI(JSON.stringify({ id: "nav.talks", lang }))}"></partial></button>
                <button><partial name="label" data="${encodeURI(JSON.stringify({ id: "nav.articles", lang }))}"></partial></button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
    <section id="developer">
      <div class="wrapper">
        <article>
          <h2><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.developer.head", lang }))}"></partial></h2>
          <div class="col-3-1">
            <div class="col col-3">
              <h3><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.developer.lead", lang }))}"></partial></h3>
              <p><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.developer.text", lang }))}"></partial></p>
              <div class="buttons">
                <button><partial name="label" data="${encodeURI(JSON.stringify({ id: "nav.project", lang }))}"></partial></button>
                <button><partial name="label" data="${encodeURI(JSON.stringify({ id: "nav.blog", lang }))}"></partial></button>
              </div>
            </div>
            <div class="col"><partial name="img" data="${encodeURI(JSON.stringify({ src: "me2.jpg" }))}"></div>
          </div>
        </article>
      </div>
    </section>
    <section id="leader">
      <div class="wrapper">
        <article>
          <h2><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.leader.head", lang }))}"></partial></h2>
          <div class="col-3-1">
            <div class="col"><partial name="img" data="${encodeURI(JSON.stringify({ src: "me2.jpg" }))}"></div>
            <div class="col col-3">
              <h3><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.leader.lead", lang }))}"></partial></h3>
              <p><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.leader.text", lang }))}"></partial></p>
              <div class="buttons">
                <button><partial name="label" data="${encodeURI(JSON.stringify({ id: "nav.courses", lang }))}"></partial></button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
    <section id="contact">
      <div class="wrapper">
        <h2><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.contact.head", lang }))}"></partial></h2>
        <h3><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.contact.lead", lang }))}"></partial></h3>
        <p><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.contact.text", lang }))}"></partial></p>
      </div>
    </section>
  </main>
`;

const mainList = (lang, content = []) => `
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

const mainItem = () => `MAINITEM`;

const main = (data, dists, partialData) => {
  const { lang, type, content } = partialData;
  if (type === "cover") {
    return mainCover(lang);
  } else {
    if (type === "list") {
      return mainList(lang, content);
    } else if (type === "item") {
      return mainItem(lang, content);
    }
  }
};

export default main;
