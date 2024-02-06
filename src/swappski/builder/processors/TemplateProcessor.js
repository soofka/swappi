export class TemplateProcessor {
  test(file) {
    return (
      file.src.dir.split(path.sep).includes("templates") ||
      file.src.name.endsWith(".template.js")
    );
  }
}
