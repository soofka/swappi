import File from './File.js';
import HtmlFile from './HtmlFile.js';
import CssFile from './CssFile.js';
import JsFile from './JsFile.js';
import ModuleFile from './ModuleFile.js';
import JsonFile from './JsonFile.js';
import ImgFile from './ImgFile.js';

export class FileFactory {

    #filesGroupMap;

    constructor(filesGroupMap) {
        this.#filesGroupMap = filesGroupMap;
    }

    getFile(absPath, relPath = '') {
        const obj = path.parse(absPath);

        switch(obj.ext) {
            case '.html':
                return new HtmlFile(absPath, relPath);

            case '.css':
                return new CssFile(absPath, relPath);

            case '.js':
                try {
                    module = await import(path.join('file:///', absPath));
                    return new ModuleFile(absPath, relPath, module);
                } catch(e) {
                    if (e.code !== 'ERR_MODULE_NOT_FOUND') {
                        throw e;
                    }
                    return new JsFile(absPath, relPath);
                }

            case '.json':
                return new JsonFile(absPath, relPath);

            case '.img':
                return new ImgFile(absPath, relPath);

            default:
                return new File(absPath, relPath);
        }
    }

}

export default FileFactory;
