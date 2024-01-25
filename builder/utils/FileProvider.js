import {
    File,
    CssFile,
    HtmlFile,
    ImgFile,
    JsFile,
    JsonFile,
    ModuleFile,
} from '../files/index.js';
import { getDirentObject } from '../helpers/index.js';
import { decorateWithSingleton } from './decorateWithSingleton.js';

class FileProvider {

    #filesGroupMap;

    constructor(filesGroupMap) {
        this.#filesGroupMap = filesGroupMap;
    }

    getFile(...absPathElements) {
        const { ext } = getDirentObject(...absPathElements);

        if (this.#filesGroupMap.html.includes(ext)) {
            return HtmlFile;
        } else if (this.#filesGroupMap.css.includes(ext)) {
            return CssFile;
        } else if (this.#filesGroupMap.js.includes(ext)) {
            return JsFile;
        } else if (this.#filesGroupMap.json.includes(ext)) {
            return JsonFile;
        } else if (this.#filesGroupMap.img.includes(ext)) {
            return ImgFile;
        } else {
            return File;
        }
    }

    getModuleFile() {
        return ModuleFile;
    }

}

const { init: initFileProvider, get: getFileProvider } = decorateWithSingleton(FileProvider);
export { initFileProvider, getFileProvider };
export default getFileProvider;
