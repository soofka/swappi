export class BuildController {
  #src;
  #dist;
  #processors = [];

  constructor(processors) {
    this.#processors = processors;
  }

  async loadDirents(srcAbsPath, distAbsPath) {
    this.#src = new Directory(getConfig().src).load();
    this.#dist = new Directory(getConfig().src).load(false);
    await Promise.all([this.#src, this.#dist]);

    for (let dirent of this.#src.direntList) {
      for (let processor of this.#processors) {
        if (processor.test(dirent)) {
          processor.dirents.push(dirent);
        }
      }
    }
  }

  prepareDirents(srcDir, distDir, reportDir, distAbsPath) {
    this.#src.prepareDists(distAbsPath);
    for (let processor of this.#processors) {
      processor.processDists();
    }
  }

  isDirentInReportDir(dirent, reportDir) {
    if (
      reportDir &&
      isInArray(reportDir.allFiles, (element) => element.isEqual(dirent))
    ) {
      return true;
    }
    return false;
  }

  findDirentInDistDir(dirent, distDir) {
    let foundDirents = [];
    if (distDir) {
      for (let dist of dirent.dist) {
        const foundDirent = findInArray(distDir.allFiles, (element) =>
          element.src.isEqual(dist),
        );
        if (foundDirent) {
          foundDirents.push(foundDirent);
        } else {
          foundDirents = [];
          break;
        }
      }
    }
    return foundDirents;
  }

  async prepareDirent() {}
}

export default BuildController;
