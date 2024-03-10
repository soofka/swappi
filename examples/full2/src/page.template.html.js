const page = (lang, content) => `
  <!doctype html>
  <html lang="">
    <head data-swapp-partial="head"></head>
    <body data-swapp-partial="body" content=""></body>
  </html>
`;

export default {
  index: () => page(),
};

/*
variable:
- lang
- page content (+per lang)
- page style (+per theme)
*/
