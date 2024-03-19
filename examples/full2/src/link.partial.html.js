const link = (data, dists, { id = "", classes = "", page, content = "" }) =>
  `<a id="${id}" class="${classes}" href="${(page && data.pages[page] && data.pages[page].url) || ""}">
    ${content}
  </a>`;

export default link;
