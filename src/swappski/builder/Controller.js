export class Controller {
  #processors = [];

  constructor(processors) {
    this.#processors = processors;
  }

  prepare(srcDir, distDir, reportDir, distAbsPath, isConfigModified) {
    let fileCount = 0;
    const preparing = [];
    for (let dirent of srcDir.direntList) {
      preparing.push(
        dirent.prepare(
          isConfigModified,
          distPath,
          reportDirectory,
          additionalDirectories,
        ),
      );

      if (!dirent.isDir) {
        fileCount++;
      }
    }
  }
}
