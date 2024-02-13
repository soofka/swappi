const manifest = (data, lang, theme) => {
  const color = theme === "dark" ? data.colors[4] : data.colors[0];
  return JSON.stringify({
    background_color: color,
    categories: "",
    description: "",
    display: "standalone",
    icons: [],
    name: data.labels[lang].meta.title,
    orientation: "",
    scope: "/",
    screenshots: [],
    short_name: data.labels[lang].meta.title,
    shortcuts: [],
    start_url: "/",
    theme_color: color,
  });
};

export default {
  "-en-dark": (data) => manifest(data, "en", "dark"),
  "-pl-dark": (data) => manifest(data, "pl", "dark"),
  "-en-light": (data) => manifest(data, "en", "light"),
  "-pl-light": (data) => manifest(data, "pl", "light"),
};
