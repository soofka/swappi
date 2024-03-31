const code = (data, dists, {}, content) =>
  `<code><pre>${escapeHtml(content.trim().substring(5, content.trim().length - 7))}</pre></code>`;

const escapeHtml = (content) =>
  content
    // .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
// .replaceAll('"', "&quot;")
// .replaceAll("'", "&#039;")

export default code;
