const mainCover = (data, dists, { lang }) => `
  <main>
    <section id="intro">
      <div class="wrapper">
        <article>
          <h1><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.intro.head", lang }))}"></partial></h1>
          <div class="col-3-1">
            <div class="col col-3">
              <h3><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.intro.lead", lang }))}"></partial></h3>
              <p><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.intro.text", lang }))}"></partial></p>
            </div>
            <div class="col">
              <partial name="img" data="${encodeURI(JSON.stringify({ src: "me.jpg" }))}"></partial>
              <p class=\"text-blinker\" data-texts=\"solution architect,software developer,teacher and leader\" data-classes=\"architect-fg,developer-fg,leader-fg\">
                <span class=\"text\"> </span>
                <span class=\"blinker\">_</span>
              </p>
            </div>
          </div>
          <div class="buttons">
            <a class="button architect-bg" href="#architect"><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.intro.buttons.cv", lang }))}"></partial></a>
            <a class="button developer-bg" href="#architect"><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.intro.buttons.info", lang }))}"></partial></a>
            <a class="button leader-bg" href="#contact"><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.intro.buttons.contact", lang }))}"></partial></a>
          </div>
        </article>
      </div>
    </section>
    <section id="architect">
      <div class="wrapper">
        <article>
          <h2><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.architect.head", lang }))}"></partial></h2>
          <div class="col-3-1">
            <div class="col">
              <partial name="img" data="${encodeURI(JSON.stringify({ src: "me2.jpg" }))}"></partial>
              <p class="architect-fg"><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.architect.imgAlt", lang }))}"></p>
            </div>
            <div class="col col-3">
              <h3><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.architect.lead", lang }))}"></partial></h3>
              <p><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.architect.text", lang }))}"></partial></p>
            </div>
          </div>
          <div class="buttons">
            <a class="button architect-bg"><partial name="label" data="${encodeURI(JSON.stringify({ id: "page.home.architect.talks", lang }))}"></partial></a>
            <a class="button"><partial name="label" data="${encodeURI(JSON.stringify({ id: "page.home.architect.articles", lang }))}"></partial></a>
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
            </div>
            <div class="col">
              <partial name="img" data="${encodeURI(JSON.stringify({ src: "me3.jpg" }))}"></partial>
              <p class="developer-fg"><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.developer.imgAlt", lang }))}"></p>
            </div>
          </div>
          <div class="buttons">
            <a class="button"><partial name="label" data="${encodeURI(JSON.stringify({ id: "page.home.developer.projects", lang }))}"></partial></a>
            <a class="button developer-bg"><partial name="label" data="${encodeURI(JSON.stringify({ id: "page.home.developer.blog", lang }))}"></partial></a>
          </div>
        </article>
      </div>
    </section>
    <section id="leader">
      <div class="wrapper">
        <article>
          <h2><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.leader.head", lang }))}"></partial></h2>
          <div class="col-3-1">
            <div class="col">
              <partial name="img" data="${encodeURI(JSON.stringify({ src: "me3.jpg" }))}"></partial>
              <p class="leader-fg"><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.leader.imgAlt", lang }))}"></p>
            </div>
            <div class="col col-3">
              <h3><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.leader.lead", lang }))}"></partial></h3>
              <p><partial name="label" data="${encodeURI(JSON.stringify({ id: "pages.home.leader.text", lang }))}"></partial></p>
            </div>
          </div>
          <div class="buttons">
            <a class="button leader-bg"><partial name="label" data="${encodeURI(JSON.stringify({ id: "page.home.leader.courses", lang }))}"></partial></a>
          </div>
        </article>
      </div>
    </section>
  </main>
`;

export default mainCover;
