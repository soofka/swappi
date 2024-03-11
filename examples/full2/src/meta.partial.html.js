// USE FILES FOR ICONS
const meta = (data, dists, partialData) => `
  <meta charset="utf-8">
  <title>${data.labels[data.langs[0]].meta.title}</title>
  <meta name="author" content="${data.author}">
  <meta name="description" content="${data.labels[data.langs[0]].meta.description}">
  <meta property="og:title" content="${data.labels[data.langs[0]].meta.title}">
  <meta property="og:type" content="${data.type}">
  <meta property="og:url" content="${data.url}">
  <meta property="og:description" content="${data.labels[data.langs[0]].meta.description}">
  <meta property="og:image" content="me.jpg">
  <meta property="og:image:alt" content="me">
`;

export default meta;
