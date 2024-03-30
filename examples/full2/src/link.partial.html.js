const link = (data, dists, { id = "", classes = "", pageId, content = "" }) =>
  `<a id="${id}" class="${classes}" href="${data.pages.find((page) => page.id === pageId).url}">
    ${content}
  </a>`;

export default link;
