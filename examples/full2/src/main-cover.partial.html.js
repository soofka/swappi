const mainCover = (data, dists, { lang }) => `
  <main>
    <section id="intro">
      <div class="wrapper">
        <article>
          <h1>
            <span class="architect-fg">J</span>
            <span class="architect-fg name">A</span>
            <span class="leader-fg mail">@</span>
            <span class="architect-fg name">K</span>
            <span class="architect-fg name">U</span>
            <span class="architect-fg name">B</span>
            <span class="developer-fg">S</span>
            <span class="developer-fg name">O</span>
            <span class="developer-fg">W</span>
            <span class="developer-fg name">I</span>
            <span class="developer-fg">N</span>
            <span class="teacher-fg mail">.</span>
            <span class="developer-fg">S</span>
            <span class="developer-fg">K</span>
            <span class="developer-fg">I</span>
          </h1>
          <div class="col-3-1">
            <div class="col col-3">
              <h2>${data.labels[lang].pages.home.intro.head}</h2>
              <h3>${data.labels[lang].pages.home.intro.lead}</h3>
              <p>${data.labels[lang].pages.home.intro.text}</p>
            </div>
            <div class="col">
              <partial name="img" data="${encodeURI(JSON.stringify({ src: "me.jpg", alt: data.labels[lang].pages.home.intro.imgAlt }))}"></partial>
              <p class=\"text-blinker\" data-texts=\"solution architect,software developer,teacher and leader\" data-classes=\"architect-fg,developer-fg,leader-fg\">
                <span class=\"text\"> </span>
                <span class=\"blinker\">_</span>
              </p>
            </div>
          </div>
          <div class="buttons">
            <a class="button architect-bg" href="#">${data.labels[lang].pages.home.intro.buttons.cv}</a>
            <a class="button developer-bg" href="#architect">${data.labels[lang].pages.home.intro.buttons.info}</a>
            <a class="button leader-bg" href="#contact">${data.labels[lang].pages.home.intro.buttons.contact}</a>
          </div>
        </article>
      </div>
    </section>
    <section id="architect">
      <div class="wrapper">
        <article>
          <h2 class="architect-fg">${data.labels[lang].pages.home.architect.head}</h2>
          <div class="col-3-1">
            <div class="col">
              <partial name="img" data="${encodeURI(JSON.stringify({ src: "me2.jpg", alt: data.labels[lang].pages.home.architect.imgAlt }))}"></partial>
              <p class="architect-fg">${data.labels[lang].pages.home.architect.imgAlt}</p>
            </div>
            <div class="col col-3">
              <h3>${data.labels[lang].pages.home.architect.lead}</h3>
              <p>${data.labels[lang].pages.home.architect.text}</p>
            </div>
          </div>
          <div class="buttons">
            <partial name="link" data="${encodeURI(
              JSON.stringify({
                classes: "button architect-bg",
                pageId: `talks-${lang}`,
                content: data.labels[lang].pages.home.architect.buttons.talks,
              }),
            )}"></partial>
            <partial name="link" data="${encodeURI(
              JSON.stringify({
                classes: "button architect-bg",
                pageId: `articles-${lang}`,
                content:
                  data.labels[lang].pages.home.architect.buttons.articles,
              }),
            )}"></partial>
            <a class="button" href="#contact">${data.labels[lang].pages.home.intro.buttons.contact}</a>
          </div>
        </article>
      </div>
    </section>
    <section id="developer">
      <div class="wrapper">
        <article>
          <h2 class="developer-fg">${data.labels[lang].pages.home.developer.head}</h2>
          <div class="col-3-1">
            <div class="col col-3">
              <h3>${data.labels[lang].pages.home.developer.lead}</h3>
              <p>${data.labels[lang].pages.home.developer.text}</p>
            </div>
            <div class="col">
              <partial name="img" data="${encodeURI(JSON.stringify({ src: "me3.jpg", alt: data.labels[lang].pages.home.developer.imgAlt }))}"></partial>
              <p class="developer-fg">${data.labels[lang].pages.home.developer.imgAlt}</p>
            </div>
          </div>
          <div class="buttons">
            <partial name="link" data="${encodeURI(
              JSON.stringify({
                classes: "button developer-bg",
                pageId: `projects-${lang}`,
                content:
                  data.labels[lang].pages.home.developer.buttons.projects,
              }),
            )}"></partial>
            <partial name="link" data="${encodeURI(
              JSON.stringify({
                classes: "button developer-bg",
                pageId: `blog-${lang}`,
                content: data.labels[lang].pages.home.developer.buttons.blog,
              }),
            )}"></partial>
            <a class="button" href="#contact">${data.labels[lang].pages.home.intro.buttons.contact}</a>
          </div>
        </article>
      </div>
    </section>
    <section id="leader">
      <div class="wrapper">
        <article>
          <h2 class="leader-fg">${data.labels[lang].pages.home.leader.head}</h2>
          <div class="col-3-1">
            <div class="col">
              <partial name="img" data="${encodeURI(JSON.stringify({ src: "me3.jpg", alt: data.labels[lang].pages.home.leader.imgAlt }))}"></partial>
              <p class="leader-fg">${data.labels[lang].pages.home.leader.imgAlt}</p>
            </div>
            <div class="col col-3">
              <h3>${data.labels[lang].pages.home.leader.lead}</h3>
              <p>${data.labels[lang].pages.home.leader.text}</p>
            </div>
          </div>
          <div class="buttons">
            <partial name="link" data="${encodeURI(
              JSON.stringify({
                classes: "button leader-bg",
                pageId: `courses-${lang}`,
                content: data.labels[lang].pages.home.leader.buttons.courses,
              }),
            )}"></partial>
            <a class="button" href="#contact">${data.labels[lang].pages.home.intro.buttons.contact}</a>
          </div>
        </article>
      </div>
    </section>
  </main>
`;

export default mainCover;
