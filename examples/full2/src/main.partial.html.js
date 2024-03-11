const mainCover = () => `
  <main>
    <section id="hero">
      <div class="wrapper">
        <h1>Jakub Sowiński</h1>
      </div>
    </section>
    <section id="intro">
      <div class="wrapper">
        <article>
          <h1>ELO</h1>
          <div class="col-3-1">
            <div class="col col-3">
              <h3>
                My name is Jakub. I am a software enthusiast, who works as a
                software and solution architect, software developer, as well
                as tech leader and teacher. Welcome to my corner of the Web.
              </h3>
              <p>
                If you're intereste in my work experience, please refer to my
                <a href="#">resume</a>.
              </p>
              <p>
                Otherwise, scroll down to check out some of my work. If you'll
                find it interesting, feel free to contact me. I'm sure we
                could do something great together!
              </p>
              <div class="buttons">
                <button>Check out my work</button>
                <button>Contact me</button>
              </div>
            </div>
            <div class="col"><img src="me2.jpg" /></div>
          </div>
        </article>
      </div>
    </section>
    <section id="architect">
      <div class="wrapper">
        <article>
          <h2>Software architecture</h2>
          <div class="col-3-1">
            <div class="col"><img src="me2.jpg" /></div>
            <div class="col col-3">
              <h3>
                I have over 5 years of experience in software and solution
                architecture roles, as well as over 3 years of experience as a
                lecturer in software architecture at Polish-Japanese Academy
                of Information Technology in Warsaw, Poland.
              </h3>
              <p>
                I am giving talks, publishing articles, and creating courses
                on software architecture. Let me invite you to check some of
                them out below!
              </p>
              <div class="buttons">
                <button>Talks</button>
                <button>Articles</button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
    <section id="developer">
      <div class="wrapper">
        <article>
          <h2>Software development</h2>
          <div class="col-3-1">
            <div class="col col-3">
              <h3>
                I have over 5 years of experience in software and solution
                architecture roles, as well as over 3 years of experience as a
                lecturer in software architecture at Polish-Japanese Academy
                of Information Technology in Warsaw, Poland.
              </h3>
              <p>
                I am giving talks, publishing articles, and creating courses
                on software architecture. Let me invite you to check some of
                them out below!
              </p>
              <div class="buttons">
                <button>Projects</button>
                <button>Blog</button>
              </div>
            </div>
            <div class="col"><img src="me2.jpg" /></div>
          </div>
        </article>
      </div>
    </section>
    <section id="leader">
      <div class="wrapper">
        <article>
          <h2>Tech leadership and teaching</h2>
          <div class="col-3-1">
            <div class="col"><img src="me2.jpg" /></div>
            <div class="col col-3">
              <h3>
                I have over 5 years of experience in software and solution
                architecture roles, as well as over 3 years of experience as a
                lecturer in software architecture at Polish-Japanese Academy
                of Information Technology in Warsaw, Poland.
              </h3>
              <p>
                I am giving talks, publishing articles, and creating courses
                on software architecture. Let me invite you to check some of
                them out below!
              </p>
              <div class="buttons">
                <button>Courses</button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
    <section id="contact">
      <div class="wrapper">
        <h2>Contact me</h2>
      </div>
    </section>
  </main>
`;

const mainList = (content = []) => `
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
  const { type, content } = partialData;
  console.log("robie strone", type, content);
  if (type === "cover") {
    return mainCover();
  } else {
    if (type === "list") {
      return mainList(content);
    } else if (type === "item") {
      return mainItem(content);
    }
  }
};

export default main;
