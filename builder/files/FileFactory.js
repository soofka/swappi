import {
    File,
    CssFile,
    HtmlFile,
    ImgFile,
    JsFile,
    JsonFile,
    ModuleFile,
} from './index.js';
import { getDirentObject } from '../helpers/index.js';

export class FileFactory {

    static getFile(filesGroupMap, ...absPathElements) {
        const { ext } = getDirentObject(...absPathElements);

        if (filesGroupMap.html.includes(ext)) {
            return HtmlFile;
        } else if (filesGroupMap.css.includes(ext)) {
            return CssFile;
        } else if (filesGroupMap.js.includes(ext)) {
            return JsFile;
        } else if (filesGroupMap.json.includes(ext)) {
            return JsonFile;
        } else if (filesGroupMap.img.includes(ext)) {
            return ImgFile;
        } else {
            return File;
        }
    }

    static getModuleFile() {
        return ModuleFile;
    }

}

export default FileFactory;
