// theme
let theme =
  localStorage.getItem("theme") === "dark" ||
  (window.matchMedia &&
    window.matchMedia("(prefers-colors-scheme: dark)").matches)
    ? "dark"
    : "light";

applyTheme(theme, true);

document.querySelector("#theme-toggle").addEventListener("click", (e) => {
  e.preventDefault();
  applyTheme(theme === "light" ? "dark" : "light");
});

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

// menu
// const menu = document.querySelector("nav #menu");
// const menuList = document.querySelector("nav #menu ul");
// const menuButton = document.querySelector("nav #menu-toggle");

// window.addEventListener("resize", () => setupMenu());
// menuButton.addEventListener("click", () => setMenu());
// menuButton.addEventListener("blur", () => {
//   setMenu(false);
//   window.removeEventListener("scroll", hideMenuOnNextScroll);
// });
// menuButton.classList.add("no-before");

// setupMenu();

// function setupMenu() {
//   if (window.innerWidth <= 960) {
//     setMenu(false);
//   } else {
//     setMenu(true);
//     window.removeEventListener("scroll", hideMenuOnNextScroll);
//   }
// }
// function hideMenuOnNextScroll() {
//   setMenu(false);
//   window.removeEventListener("scroll", hideMenuOnNextScroll);
// }
// function setMenu(on) {
//   let open = on === true || on === false ? on : menu.style.height === "0px";
//   if (open) {
//     menu.style.height = `${menuList.offsetHeight}px`;
//     menuButton.textContent = "☓";
//     if (window.innerWidth <= 960) {
//       window.removeEventListener("scroll", hideMenuOnNextScroll);
//       window.addEventListener("scroll", hideMenuOnNextScroll);
//     }
//   } else {
//     menu.style.height = "0px";
//     menuButton.textContent = "☰";
//   }
// }
