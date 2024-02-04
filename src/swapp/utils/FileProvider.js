import {
  File,
  CssFile,
  HtmlFile,
  ImgFile,
  JsFile,
  JsonFile,
  TemplateFile,
  PartialFile,
} from "../files/index.js";
import { getDirentObject } from "../helpers/index.js";
import decorateWithSingleton from "./decorateWithSingleton.js";

class FileProvider {
  #filesGroupMap;

  constructor(filesGroupMap) {
    this.#filesGroupMap = filesGroupMap;
  }

  getFileFromDirentData(direntData) {
    return this.#getFile(direntData.absDir, direntData.name, direntData.ext);
  }

  getFileFromNodeDirent(nodeDirent) {
    return this.#getFile(nodeDirent.path, nodeDirent.name);
  }

  getTemplateFile() {
    return new TemplateFile();
  }

  getPartialFile() {
    return new PartialFile();
  }

  getBaseFile() {
    return new File();
  }

  #getFile(...absPathElements) {
    const { ext } = getDirentObject(...absPathElements);

    if (this.#filesGroupMap.html.includes(ext)) {
      return new HtmlFile();
    } else if (this.#filesGroupMap.css.includes(ext)) {
      return new CssFile();
    } else if (this.#filesGroupMap.js.includes(ext)) {
      return new JsFile();
    } else if (this.#filesGroupMap.json.includes(ext)) {
      return new JsonFile();
    } else if (this.#filesGroupMap.img.includes(ext)) {
      return new ImgFile();
    } else {
      return new File();
    }
  }
}

const { init: initFileProvider, get: getFileProvider } =
  decorateWithSingleton(FileProvider);
export { initFileProvider, getFileProvider };
export default getFileProvider;
