import elements from "./elements.js";

export const index = (data, dists) => `
  <!doctype html>
  <html lang="en">
    <head data-swapp-partial="head"></head>
    <body class="loading">
      <div id="loading-container">
        <div class="wrapper">
          <div id="loading-bar"></div>
        </div>
      </div>
      <header>
        <div class="wrapper">
          <nav>
            <ul id="menu">
              <a href="#"
                ><li>
                  <p>
                    <span
                      class="link"
                      data-swapp-partial="label"
                      label-id="navigation.home"
                    ></span>
                  </p></li
              ></a>
              <a href="#about"
                ><li>
                  <p>
                    <span
                      class="link"
                      data-swapp-partial="label"
                      label-id="navigation.about"
                    ></span>
                  </p></li
              ></a>
              <a href="#contact"
                ><li>
                  <p>
                    <span
                      class="link"
                      data-swapp-partial="label"
                      label-id="navigation.contact"
                    ></span>
                  </p></li
              ></a>
            </ul>
            <ul>
              <a id="${elements.langToggle}"
                ><li><p></p></li
              ></a>
              <a id="${elements.themeToggle}"
                ><li><p></p></li
              ></a>
            </ul>
          </nav>
        </div>
      </header>
      <main>
        <section class="hero" id="intro" data-anchor-y="">
          <div class="wrapper box">
            <h1>Jakub Sowiński</h1>
            <h3 id="intro-text-switcher" data-texts="developer,architect,teacher">
              <code
                >software <span class="text"></span
                ><span class="blinker">_</span></code
              >
            </h3>
          </div>
        </section>
        <section id="about" data-anchor-y="about" data-anchor-x-container>
          <div class="item" data-anchor-x="about-intro">
            <div class="wrapper box">
              <button class="scroll" id="scroll-right">&rarr;</button>
              <h1 data-swapp-partial="label" label-id="about.intro.head"></h1>
              <h3 data-swapp-partial="label" label-id="about.intro.lead"></h3>
              <div data-swapp-partial="label" label-id="about.intro.text"></div>
            </div>
          </div>
          <div class="item" data-anchor-x="about-developer">
            <div class="wrapper box">
              <button class="scroll" id="scroll-left">&larr;</button>
              <button class="scroll" id="scroll-right">&rarr;</button>
              <h1 data-swapp-partial="label" label-id="about.developer.head"></h1>
              <h3 data-swapp-partial="label" label-id="about.developer.lead"></h3>
              <div
                data-swapp-partial="label"
                label-id="about.developer.text"
              ></div>
            </div>
          </div>
          <div class="item" data-anchor-x="about-architect">
            <div class="wrapper box">
              <button class="scroll" id="scroll-left">&larr;</button>
              <button class="scroll" id="scroll-right">&rarr;</button>
              <h1 data-swapp-partial="label" label-id="about.architect.head"></h1>
              <h3 data-swapp-partial="label" label-id="about.architect.lead"></h3>
              <div
                data-swapp-partial="label"
                label-id="about.architect.text"
              ></div>
            </div>
          </div>
          <div class="item" data-anchor-x="about-teacher">
            <div class="wrapper box">
              <button class="scroll" id="scroll-left">&larr;</button>
              <button class="scroll" id="scroll-right">&rarr;</button>
              <h1 data-swapp-partial="label" label-id="about.teacher.head"></h1>
              <h3 data-swapp-partial="label" label-id="about.teacher.lead"></h3>
              <div data-swapp-partial="label" label-id="about.teacher.text"></div>
            </div>
          </div>
          <div class="item" data-anchor-x="about-person">
            <div class="wrapper box">
              <button class="scroll" id="scroll-left">&larr;</button>
              <h1 data-swapp-partial="label" label-id="about.person.head"></h1>
              <h3 data-swapp-partial="label" label-id="about.person.lead"></h3>
              <div data-swapp-partial="label" label-id="about.person.text"></div>
            </div>
          </div>
        </section>
        <section id="contact" data-anchor-y="contact">
          <div class="wrapper box">
            <h1 data-swapp-partial="label" label-id="contact.head"></h1>
          </div>
        </section>
      </main>
      <footer>
        <ul>
          <li>
            <small>swn.ski 2007-<span id="current-year"></span></small>
          </li>
          <a href="mailto:j@swn.ski" target="_blank"
            ><li><small class="link">mail</small></li></a
          >
          <a
            href="https://www.linkedin.com/in/jakub-sowi%C5%84ski/"
            target="_blank"
            ><li><small class="link">linkedin</small></li></a
          >
          <a href="https://github.com/soofka/" target="_blank"
            ><li><small class="link">github</small></li></a
          >
          <a href="https://medium.com/@pansoofka" target="_blank"
            ><li><small class="link">medium</small></li></a
          >
          <a href="https://youtube.com" target="_blank"
            ><li><small class="link">youtube</small></li></a
          >
          <a href="https://www.last.fm/user/soofka" target="_blank"
            ><li><small class="link">last.fm</small></li></a
          >
        </ul>
      </footer>
      ${dists
        .filter((dist) => dist.name.startsWith("script") && dist.ext === ".js")
        .map((script) => `<script src="${script.rel}"></script>`)
        .join("")}      
    </body>
  </html>
`;

export default index;
