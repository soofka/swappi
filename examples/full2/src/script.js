let theme =
  localStorage.getItem("theme") === "dark" ||
  (window.matchMedia &&
    window.matchMedia("(prefers-colors-scheme: dark)").matches)
    ? "dark"
    : "light";

applyTheme(theme, true);

document
  .querySelector("#theme-toggle")
  .addEventListener("click", () =>
    applyTheme(theme === "light" ? "dark" : "light"),
  );

function applyTheme(newTheme, force = false) {
  if (
    (newTheme === "light" || newTheme === "dark") &&
    (newTheme !== theme || force)
  ) {
    theme = newTheme;

    for (let element of document.querySelectorAll(
      `.theme-item:not(.${theme}-theme-item)`,
    )) {
      element.disabled = true;
    }
    for (let element of document.querySelectorAll(
      `.theme-item.${theme}-theme-item`,
    )) {
      element.removeAttribute("media");
      element.removeAttribute("disabled");
    }

    localStorage.setItem("theme", theme);
    document.querySelector("#theme-toggle").textContent =
      theme === "dark" ? "light" : "dark";
  }
}
