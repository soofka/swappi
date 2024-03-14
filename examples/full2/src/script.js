let theme =
  window.location.search
    .substring(1)
    .split("&")
    .filter((e) => e === "theme=dark").length > 0 ||
  (window.matchMedia && window.matchMedia("(prefers-colors-scheme: dark)"))
    ? "dark"
    : "light";
applyTheme(theme, true);

document
  .querySelector("#theme-toggle")
  .addEventListener("click", (e) =>
    applyTheme(theme === "light" ? "dark" : "light"),
  );

function applyTheme(newTheme, force = false) {
  if (
    (newTheme === "light" || newTheme === "dark") &&
    (newTheme !== theme || force)
  ) {
    for (let element of document.querySelectorAll(`.${theme}-theme`)) {
      element.media = `(prefers-colors-scheme: ${theme})`;
      element.disabled = true;
    }
    theme = newTheme;
    for (let element of document.querySelectorAll(`.${theme}-theme`)) {
      element.media = "";
      element.disabled = false;
      element.removeAttribute("disabled");
    }

    document.querySelector("#theme-toggle").textContent =
      theme === "dark" ? "light" : "dark";
    window.history.pushState(
      {},
      document.title,
      `${window.location.pathname}?theme=${theme}`,
    );
  }
}
