const manifest = (data, dists, lang, theme) =>
  JSON.stringify({
    background_color:
      theme.name === "dark"
        ? data.colors.accents.developer.dark
        : data.colors.accents.developer.light,
    description: data.labels[lang].meta.description,
    display: "standalone",
    icons: dists
      .filter((dist) => dist.name === "icon-192" || dist.name === "icon-512")
      .map((dist) => ({
        src: dist.abs,
        type: "image/png",
        sizes: dist.name === "icon-192" ? "192x192" : "512x512",
      })),
    name: data.labels[lang].meta.title,
    scope: "/",
    screenshots: [],
    short_name: data.labels[lang].meta.title,
    start_url: data.url,
    theme_color: theme.color,
  });

export default {
  generate: (data) => {
    const dists = [];
    for (let lang of data.langs) {
      for (let theme of data.themes) {
        dists.push({
          name: `manifest-${lang}-${theme.name}`,
          content: (data, dists) => manifest(data, dists, lang, theme),
        });
      }
    }
    return dists;
  },
};
