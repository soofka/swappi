export class TemplateProcessor extends ModuleProcessor {
  test(file) {
    return isInArray(file.name.split("."), "template");
  }

  async processFile(file) {}
}
