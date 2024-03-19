const link = (data, dists, { id = "", page, content = "" }) =>
  `<a id="${id}" href="${(page && data.pages[page] && data.pages[page].url) || ""}">
    ${content}
  </a>`;

export default link;
