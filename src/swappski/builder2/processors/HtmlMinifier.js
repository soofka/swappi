export class HtmlMinifier extends Processor {
  test(file) {
    return file.ext === ".html";
  }

  async processFile(file) {
    file.content = minify(file.content, getConfig().options.optimize.html);
    return file;
  }
}
