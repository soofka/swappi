export class FileProcessor extends Processor {
  async prepareFile(file) {
    const distDirentData = file.src.clone();
    distDirentData.absDir =
      distDirentData.relDir === path.sep
        ? distPath
        : path.join(distPath, distDirentData.relDir);
    file.dist.push(distDirentData);
    return file;
  }
}
