// theme
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

// menu
const menu = document.querySelector("nav #menu");
const menuButton = document.querySelector("nav #menu-toggle");
function setMenu() {
  if (!menu.style.display || menu.style.display === "none") {
    menu.style.display = "block";
    menuButton.textContent = "☓";
  } else {
    menu.style.display = "none";
    menuButton.textContent = "☰";
  }
}
menuButton.addEventListener("click", setMenu);

// text scroll
const container = document.querySelector(".text-blinker");
const texts = container.dataset.texts.split(",");
const classes = container.dataset.classes.split(",");
const text = container.querySelector(".text");
const blinker = container.querySelector(".blinker");

const forwardTimeoutRange = [50, 100];
const backwardTimeoutRange = [10, 30];
const blinkInterval = 500;
const fullWordBlinkCount = 6;
const noWordBlinkCount = 2;

let timeout = 0;
let currentTextId = 0;
let currentLetterId = 0;
let currentBlinkCount = 0;
let mode = 0; // 0 - forward, 1 - blink when typed, 2 - backward, 3 - blink when empty

function type() {
  text.innerText =
    currentLetterId === 0
      ? " "
      : texts[currentTextId].substring(0, currentLetterId);
  for (let cls of classes) {
    text.classList.remove(cls);
  }
  text.classList.add(classes[currentTextId]);

  switch (mode) {
    case 0:
      currentLetterId++;
      timeout = getTimeout(forwardTimeoutRange);
      if (currentLetterId > texts[currentTextId].length) {
        mode = 1;
      }
      break;

    case 1:
      blink();
      currentBlinkCount++;
      timeout = blinkInterval;
      if (currentBlinkCount >= fullWordBlinkCount) {
        currentBlinkCount = 0;
        mode = 2;
      }
      break;

    case 2:
      currentLetterId--;
      timeout = getTimeout(backwardTimeoutRange);
      if (currentLetterId === 0) {
        mode = 3;
        currentTextId++;
        if (currentTextId >= texts.length) {
          currentTextId = 0;
        }
      }
      break;

    case 3:
      blink();
      currentBlinkCount++;
      timeout = blinkInterval;
      if (currentBlinkCount >= noWordBlinkCount) {
        currentBlinkCount = 0;
        mode = 0;
      }
      break;

    default:
      break;
  }

  setTimeout(type, timeout);
}

const getTimeout = (range) => Math.random() * (range[1] - range[0]) + range[0];
const blink = () =>
  blinker.style.visibility === "hidden"
    ? (blinker.style.visibility = "")
    : (blinker.style.visibility = "hidden");

type();
